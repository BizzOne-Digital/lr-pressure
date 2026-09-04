require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');
(async () => {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);
  await client.connect();
  const admin = client.db().admin();
  const { databases } = await admin.listDatabases();
  for (const db of databases) {
    console.log(db.name, db.sizeOnDisk, 'bytes');
  }
  await client.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
