# 🗑️ SmartWaste — Smart Waste Management System
**Hackathon Prototype | MERN Stack + IoT Simulation**
> City: Lucknow, Uttar Pradesh, India (26.84°N, 80.94°E)

---

## 🚀 Quick Demo

Open `frontend/index.html` directly in your browser — **no server required** for the interactive prototype!

**Demo Credentials:**
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@smartwaste.in | Admin@123 |
| Employee | employee1@smartwaste.in | Emp@123 |
| Citizen | client@smartwaste.in | Client@123 |

---

## 📁 Project Structure

```
smart-waste/
├── frontend/
│   └── index.html              ← Full interactive prototype (single file)
├── backend/
│   ├── server.js               ← Express + Socket.io server
│   ├── seed.js                 ← MongoDB seeder
│   ├── package.json
│   ├── .env.example
│   ├── data/
│   │   └── bins.json           ← 25 synthetic bin records (Lucknow)
│   ├── models/
│   │   ├── User.js             ← Auth (admin/employee/client)
│   │   ├── Bin.js              ← IoT bin data model
│   │   ├── Route.js            ← Optimized collection routes
│   │   ├── Complaint.js        ← Public complaints
│   │   └── CheckIn.js          ← Employee attendance
│   ├── routes/
│   │   ├── auth.js             ← JWT login/register
│   │   ├── bins.js             ← Bin CRUD + status
│   │   ├── route.js            ← Route generation (TSP)
│   │   ├── complaints.js       ← Complaint management
│   │   └── employees.js        ← Check-in tracking
│   └── middleware/
│       └── auth.js             ← JWT + role guard
```

---

## 🌟 Features

### 🗺️ Route Optimization
- **Algorithm:** Nearest Neighbor TSP (greedy approximation)
- Bins ≥80% fill flagged as FULL
- Shortest path computed from LMC Depot → all full bins → return
- Displayed as animated polyline on Leaflet.js map
- Optional: OSRM real road routing (auto-falls back to haversine)

### 📡 Simulated IoT Sensor Data
25 smart bins across 5 zones in Lucknow:
| Area | Fill Level | Notes |
|------|-----------|-------|
| Market (5 bins) | 86–93% | High footfall, fills fast |
| Railway Station (4 bins) | 92–97% | Fastest fill rate |
| School (5 bins) | 51–64% | Moderate fill |
| Residential (6 bins) | 45–61% | Slow fill |
| Park (5 bins) | 21–35% | Lowest fill |

### 🔐 Role-Based Access (JWT)
- **Admin:** Live map, route generation, employee logs, complaints
- **Employee:** Assigned route, check-in timestamp, task completion
- **Citizen:** Report issues, view recycle tips, track complaints

### 🚨 Early Warning System
- Real-time fill level simulation (updates every 8s in demo)
- Alert banner when any bin ≥95%
- Red markers on map for critical bins
- Toast notifications for alerts

### 📋 Complaint Management
- Types: Bin Overflow, Illegal Dumping, Bin Damage
- Priority auto-assigned (illegal dumping → HIGH)
- Admin can review → resolve complaints
- Citizen tracks own complaints

### ♻️ Recycle & Reuse Guide
Waste categories: Plastic, Glass, Paper, Organic, E-Waste

---

## 🔧 Backend Setup

```bash
cd backend
cp .env.example .env          # Edit MongoDB URI and JWT secret
npm install
npm run seed                  # Seed 25 bins + 5 users
npm run dev                   # Start server (port 5000)
```

### API Endpoints

| Method | Endpoint | Role | Description |
|--------|---------|------|-------------|
| POST | /api/auth/login | All | JWT login |
| GET | /api/bins | All | All bins |
| GET | /api/bins/full | Admin/Emp | Bins ≥80% |
| GET | /api/bins/stats | Admin | Summary stats |
| POST | /api/bins/:id/collect | Emp/Admin | Mark collected |
| POST | /api/route/generate | Admin | Generate TSP route |
| GET | /api/route/today | Admin | Today's routes |
| PATCH | /api/route/:id/bin/:binId | Employee | Tick off a stop |
| POST | /api/complaints | All | Submit complaint |
| GET | /api/complaints | Admin | All complaints |
| PATCH | /api/complaints/:id | Admin | Update status |
| GET | /api/employees/checkins | Admin | View check-ins |
| GET | /api/employees/my-route | Employee | My today route |

### WebSocket Events (Socket.io)
| Event | Direction | Payload |
|-------|-----------|---------|
| `bin_alert` | Server → Client | `{binId, location, fillLevel}` |
| `bin_update` | Server → Client | Updated bin object |
| `bin_collected` | Server → Client | `{binId, routeId}` |
| `route_generated` | Server → Client | `{routeId, binsCount, totalDistance}` |
| `new_complaint` | Server → Client | `{complaintId, type, location}` |
| `fill_levels_update` | Server → Client | Array of fill updates |

---

## 📊 Routing Algorithm Details

```
Nearest Neighbor TSP (Greedy):
1. Start at depot (LMC Hazratganj: 26.8467°N, 80.9462°E)
2. Pick the closest unvisited full bin (Haversine distance)
3. Move to that bin, repeat until all full bins visited
4. Return to depot
5. Time complexity: O(n²)
6. Provides ~20–25% of optimal TSP solution
```

**Disclaimer for Judges:**
> *"As this is a software prototype, we created a synthetic dataset that mimics the data an IoT-based smart bin would generate. The software architecture remains the same — in a real deployment, this data source would be replaced by actual sensor readings via MQTT or HTTP webhooks."*

---

## 🛠️ Tech Stack
- **Frontend:** Leaflet.js, Tailwind CSS (CDN), Vanilla JS
- **Backend:** Node.js, Express.js, Socket.io
- **Database:** MongoDB + Mongoose
- **Auth:** JWT (jsonwebtoken + bcryptjs)
- **Routing:** Nearest Neighbor TSP + OSRM (optional)
- **Map:** OpenStreetMap tiles via Leaflet
