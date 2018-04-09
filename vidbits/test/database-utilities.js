const {mongoose, databaseUrl, options} = require('../database');

const connectDatabase = async () => {
  await mongoose.connect(databaseUrl, options);
};

const connectDatabaseAndDropData = async () => {
  await connectDatabase();
  await mongoose.connection.db.dropDatabase();
};

const disconnectDatabase = async () => {
  await mongoose.disconnect();
};

module.exports = {
  connectDatabase,
  connectDatabaseAndDropData,
  disconnectDatabase,
};
