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

Project Synopsis: Smart Waste Management System
1. Project Overview
Project Alpha is a comprehensive, real-time waste management and route optimization platform. The primary objective is to significantly reduce the fuel consumption and operational time of waste collection vehicles. By leveraging live data and algorithmic route generation, the system ensures that waste is collected only when necessary and via the most efficient paths possible.

2. Core System Architecture
The project is built on a robust MERN stack (MongoDB, Express, React, Node.js) architecture, integrating real-time communication and mapping technologies:

Database & Backend: 5 Mongoose models (User, Bin, Route, Complaint, CheckIn) managing distinct API routes for authentication, bins, routing, and users.

Real-Time Data: Socket.io implementation handles live alerts, auto-firing early warnings when bins hit ≥95% capacity, and simulating real-time fill level increases.

Routing & Mapping: Nearest Neighbor Traveling Salesperson Problem (TSP) algorithm combined with Leaflet OpenStreetMap to visualize dynamic, optimized collection routes.

3. Role-Based Features
The system is divided into three secure, role-specific dashboards:

👨‍💼 Admin Dashboard (Central Operations):

Live Analytics: Real-time statistics on total bins, fill levels (color-coded: red, yellow, green), and open public complaints.

Dynamic Routing: One-click "Generate Optimal Route" execution that calculates the shortest path for collection using TSP logic, displaying distance and ETA.

Fleet Tracking: Monitors employee check-ins, zone assignments, and daily collection progress.

Issue Resolution: Tools to review, prioritize, and resolve public complaints.

👷 Employee Dashboard (On-Ground Operations):

Task Management: Displays assigned optimized routes on a live map, isolating only the bins that require immediate collection.

Progress Tracking: Automated check-in timestamps and interactive checkboxes to mark bins as collected, instantly updating the central progress bar.

🏘️ Citizen Dashboard (Public Engagement):

Civic Reporting: A streamlined form to report overflowing bins, illegal dumping, or damaged infrastructure, complete with location and description tagging.

Awareness & Education: Integrated guides for recycling and reusing materials (Plastics, Glass, Paper, Organic, E-Waste).

4. Impact and Value Proposition
Environmental Sustainability: Drastically cuts down on unnecessary vehicle emissions by preventing trucks from visiting empty or half-full bins.

Cost Efficiency: Reduces operational costs by minimizing fuel consumption, vehicle wear-and-tear, and labor hours.

Predictive Maintenance: The early warning system prevents waste overflow, improving urban hygiene and public health.

Community Engagement: Empowers citizens to take an active role in local cleanliness while providing them with educational resources on recycling.
