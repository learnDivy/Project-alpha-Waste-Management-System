# Project-alpha-Waste-Management-System
This project We completed for the development and Less consumption of fuel and time through route management and comprehensive System Design.

---

🌟 Demo Features (open SmartWaste_Demo.html)

🔐 Login — 3 Roles:

• Click role cards (Admin / Employee / Citizen) → credentials auto-fill

👨‍💼 Admin Dashboard:

• 📊 Overview — Live stats cards (total/full/moderate/low bins, open complaints, avg fill %)

• 🗺️ Live Map — All 25 bins on Leaflet OpenStreetMap (red=full, yellow=moderate, green=low)

• ⚡ Route Generation — Click "Generate Optimal Route" → Nearest Neighbor TSP runs → animated polyline appears

• 🛣️ Routes tab — Step-by-step route display with distance + ETA

• 👷 Employees tab — Check-in log, zone assignments, bins collected

• 📋 Complaints — Review/resolve public complaints with priority badges

👷 Employee Dashboard:

• 🗺️ Assigned route on map with all full bins

• ✅ Check-in timestamp auto-recorded

• Tick each bin ✓ as collected → progress bar updates

🏘️ Citizen Dashboard:

• 📢 Report bin overflow, illegal dumping, or damage (form with type, location, description)

• 📋 Track submitted complaints

• ♻️ Recycle & Reuse guide (Plastic, Glass, Paper, Organic, E-Waste cards)

🚨 Early Warning System:

• Alert banner auto-fires when any bin hits ≥95%

• Fill levels simulate live increases every 8 seconds

• Toast notifications for all events

---

🔧 Backend (MERN — smart-waste/backend/)

• 5 Mongoose models: User, Bin, Route, Complaint, CheckIn

• 5 route files: /api/auth, /api/bins, /api/route, /api/complaints, /api/employees

• JWT auth with role middleware (admin, employee, client)

• Socket.io real-time: bin_alert, route_generated, bin_collected, fill_levels_update

• TSP algorithm + optional OSRM road routing

• Seed script → npm run seed populates all 25 bins + demo users
