const express = require('express');
const axios = require('axios');
const Route = require('../models/Route');
const Bin = require('../models/Bin');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const router = express.Router();

// Nearest-Neighbor TSP — returns ordered array of bins
function nearestNeighborTSP(bins, depot = { lat: 26.8467, lng: 80.9462 }) {
  if (bins.length === 0) return [];
  const unvisited = [...bins];
  const route = [];
  let current = depot;

  while (unvisited.length > 0) {
    let nearestIdx = 0;
    let minDist = Infinity;
    unvisited.forEach((bin, i) => {
      const d = haversine(current.lat, current.lng, bin.coordinates.lat, bin.coordinates.lng);
      if (d < minDist) { minDist = d; nearestIdx = i; }
    });
    route.push(unvisited[nearestIdx]);
    current = unvisited[nearestIdx].coordinates;
    unvisited.splice(nearestIdx, 1);
  }
  return route;
}

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function totalDistance(orderedBins) {
  const depot = { lat: 26.8467, lng: 80.9462 };
  let dist = 0;
  let prev = depot;
  for (const bin of orderedBins) {
    dist += haversine(prev.lat, prev.lng, bin.coordinates.lat, bin.coordinates.lng);
    prev = bin.coordinates;
  }
  dist += haversine(prev.lat, prev.lng, depot.lat, depot.lng);
  return parseFloat(dist.toFixed(2));
}

// POST /api/route/generate — admin triggers route generation
router.post('/generate', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    const { employeeId, threshold = 80 } = req.body;

    // Get full bins
    const fullBins = await Bin.find({ fillLevel: { $gte: threshold }, isActive: true });
    if (fullBins.length === 0) return res.status(200).json({ message: 'No bins above threshold. No route needed.' });

    // Optimize with Nearest Neighbor TSP
    const optimizedBins = nearestNeighborTSP(fullBins);
    const dist = totalDistance(optimizedBins);
    const estTime = Math.round((dist / 20) * 60 + optimizedBins.length * 5); // 20 km/h + 5 min per bin

    // Build polyline (depot → bins → depot)
    const depot = [26.8467, 80.9462];
    const polyline = [depot, ...optimizedBins.map(b => [b.coordinates.lat, b.coordinates.lng]), depot];

    // Optional: call OSRM for real road distance
    let osrmRoute = null;
    try {
      const coords = [depot, ...optimizedBins.map(b => [b.coordinates.lat, b.coordinates.lng])];
      const coordStr = coords.map(c => `${c[1]},${c[0]}`).join(';');
      const osrmResp = await axios.get(`http://router.project-osrm.org/route/v1/driving/${coordStr}?overview=full&geometries=geojson`, { timeout: 5000 });
      if (osrmResp.data.routes?.[0]) {
        osrmRoute = osrmResp.data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
      }
    } catch { /* OSRM unavailable, use straight-line polyline */ }

    const routeId = 'RT-' + Date.now().toString().slice(-6);
    const newRoute = await Route.create({
      routeId,
      assignedEmployee: employeeId || null,
      bins: optimizedBins.map((b, i) => ({
        binId: b.binId,
        location: b.location,
        lat: b.coordinates.lat,
        lng: b.coordinates.lng,
        fillLevel: b.fillLevel,
        order: i + 1
      })),
      totalDistance: dist,
      estimatedTime: estTime,
      routePolyline: osrmRoute || polyline,
      algorithm: 'Nearest Neighbor TSP'
    });

    // Emit socket event
    req.app.get('io')?.emit('route_generated', { routeId, binsCount: optimizedBins.length, totalDistance: dist });

    res.json({
      message: 'Route generated successfully',
      route: {
        routeId,
        binsCount: optimizedBins.length,
        totalDistance: dist,
        estimatedTime: estTime,
        bins: optimizedBins.map((b, i) => ({
          order: i + 1,
          binId: b.binId,
          location: b.location,
          lat: b.coordinates.lat,
          lng: b.coordinates.lng,
          fillLevel: b.fillLevel
        })),
        polyline: osrmRoute || polyline,
        algorithm: 'Nearest Neighbor TSP'
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/route/today — get today's routes
router.get('/today', authMiddleware, async (req, res) => {
  try {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const end = new Date(); end.setHours(23, 59, 59, 999);
    const routes = await Route.find({ date: { $gte: start, $lte: end } }).populate('assignedEmployee', 'name email');
    res.json(routes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/route/:id
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const route = await Route.findOne({ routeId: req.params.id }).populate('assignedEmployee', 'name email');
    if (!route) return res.status(404).json({ message: 'Route not found' });
    res.json(route);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/route/:id/bin/:binId — employee marks a bin as collected
router.patch('/:id/bin/:binId', authMiddleware, roleMiddleware('employee', 'admin'), async (req, res) => {
  try {
    const route = await Route.findOne({ routeId: req.params.id });
    if (!route) return res.status(404).json({ message: 'Route not found' });
    const bin = route.bins.find(b => b.binId === req.params.binId);
    if (!bin) return res.status(404).json({ message: 'Bin not in route' });
    bin.status = 'collected';
    bin.collectedAt = new Date();
    const allDone = route.bins.every(b => b.status === 'collected');
    if (allDone) { route.status = 'completed'; route.completedAt = new Date(); }
    else if (route.status === 'pending') { route.status = 'in-progress'; route.startedAt = new Date(); }
    await route.save();
    // Also reset fill level in Bin collection
    await Bin.findOneAndUpdate({ binId: req.params.binId }, { fillLevel: 0, status: 'low', lastCollected: new Date() });
    req.app.get('io')?.emit('bin_collected', { binId: req.params.binId, routeId: req.params.id });
    res.json({ message: 'Bin marked as collected', route });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
