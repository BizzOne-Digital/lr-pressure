require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
(async () => {
  await mongoose.connect(process.env.MONGODB_URI, { bufferCommands: false });
  console.log('Connected db name:', mongoose.connection.db.databaseName);
  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log('Collections:', collections.map(c => c.name));
  const settingsCount = await mongoose.connection.db.collection('sitesettings').countDocuments().catch(e => 'ERR:'+e.message);
  console.log('sitesettings count:', settingsCount);
  await mongoose.disconnect();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
