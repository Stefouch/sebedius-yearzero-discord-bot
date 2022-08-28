const mongoose = require('mongoose');

class Database {
  constructor(client, uri) {
    mongoose.connect(uri, {
      autoIndex: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
    }).then(() => console.log('✔ Sebedius is connected to the database!'))
      .catch(err => console.error(err));

    this.client = client;
  }
}

module.exports = Database;
