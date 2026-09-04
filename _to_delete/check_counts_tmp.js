require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
(async () => {
  await mongoose.connect(process.env.MONGODB_URI, { bufferCommands: false });
  const db = mongoose.connection.db;
  const names = ['admins','leads','projects','testimonials','navigations','sitesettings','galleryitems','pages','teammembers','services','serviceplans','media'];
  for (const n of names) {
    const c = await db.collection(n).countDocuments();
    console.log(n, ':', c);
  }
  await mongoose.disconnect();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
