const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/zolarexpress').then(async () => {
  const db = mongoose.connection.db;

  const collections = await db.listCollections().toArray();
  if (collections.length === 0) {
    console.log('Database is empty.');
  } else {
    for (const col of collections) {
      const count = await db.collection(col.name).countDocuments();
      console.log(`${col.name}: ${count} document(s)`);
    }
  }

  mongoose.disconnect();
}).catch(err => console.error(err));
