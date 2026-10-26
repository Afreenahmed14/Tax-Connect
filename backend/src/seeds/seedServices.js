require('dotenv').config();
const mongoose = require('mongoose');
const Service = require('../models/Service');
const names = require('../constants/taxServices');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  for (const name of names) await Service.updateOne({ name }, { name }, { upsert: true });
  console.log('Services seeded');
  process.exit(0);
})();
