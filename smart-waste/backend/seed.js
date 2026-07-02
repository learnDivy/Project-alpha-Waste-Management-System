require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Bin = require('./models/Bin');
const binsData = require('./data/bins.json');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/smartwaste';

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  // Clear existing
  await User.deleteMany({});
  await Bin.deleteMany({});

  // Seed Users
  const users = [
    { name: 'Admin User', email: 'admin@smartwaste.in', password: 'Admin@123', role: 'admin' },
    { name: 'Ramesh Kumar', email: 'employee1@smartwaste.in', password: 'Emp@123', role: 'employee', employeeId: 'EMP-001', zone: 'Market & Railway' },
    { name: 'Suresh Singh', email: 'employee2@smartwaste.in', password: 'Emp@123', role: 'employee', employeeId: 'EMP-002', zone: 'Schools & Residential' },
    { name: 'Priya Sharma', email: 'client@smartwaste.in', password: 'Client@123', role: 'client' },
    { name: 'Amit Verma', email: 'client2@smartwaste.in', password: 'Client@123', role: 'client' }
  ];

  for (const u of users) {
    const hashed = await bcrypt.hash(u.password, 10);
    await User.create({ ...u, password: hashed });
  }
  console.log(`✅ Seeded ${users.length} users`);

  // Seed Bins
  for (const b of binsData) {
    await Bin.create({
      binId: b.binId,
      area: b.area,
      location: b.location,
      coordinates: { lat: b.lat, lng: b.lng },
      fillLevel: b.fillLevel,
      capacity: b.capacity,
      lastUpdated: new Date(b.lastUpdated)
    });
  }
  console.log(`✅ Seeded ${binsData.length} bins`);

  console.log('\n📋 Login Credentials:');
  console.log('  Admin:    admin@smartwaste.in / Admin@123');
  console.log('  Employee: employee1@smartwaste.in / Emp@123');
  console.log('  Client:   client@smartwaste.in / Client@123');

  await mongoose.disconnect();
  console.log('\n✅ Seed complete!');
}

seed().catch(console.error);
