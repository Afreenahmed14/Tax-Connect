// require('dotenv').config();
// const mongoose = require('mongoose');

require('dotenv').config();

const dns = require('node:dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const mongoose = require('mongoose');
const User = require('../models/User');
const { hash } = require('../utils/hash');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const exists = await User.findOne({ role: 'admin' });
  if (exists) { console.log('Admin already exists'); return process.exit(0); }
  await User.create({
    name: 'Admin', email: 'admin@taxconnect.com', phone: '9999999999',
    password: await hash('Admin@12345'), role: 'admin', isVerified: true,
  });
  console.log('Admin created: admin@taxconnect.com / Admin@12345 (change immediately)');
  process.exit(0);
})();
