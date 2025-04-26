const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/zolarexpress').then(async () => {
  const db = mongoose.connection.db;

  const collections = await db.listCollections().toArray();
  if (collections.length === 0) {
    console.log('Database is empty.');
  } else {
    for (const col of collections) {
      const collection = db.collection(col.name);
      const count = await collection.countDocuments();
      console.log(`${col.name}: ${count} document(s)`);

      if (count > 0) {
        const documents = await collection.find().toArray(); // <-- Fetch documents!
        for (const document of documents) {
          // console.log(`doc headline: ${document.headline}`);
          console.log(document);
        }
      }
    }
  }

  await mongoose.disconnect();
}).catch(err => console.error(err));
