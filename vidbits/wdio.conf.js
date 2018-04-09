const app = require('./app');
const port = process.env.PORT || require('./server.config').test.port;
const {mongoose, databaseUrl, options} = require('./database');

let expressServer;

exports.config = {
  specs: [
    'test/features/*-test.js',
    //'test/features/*deleting-*-test.js',
  ],
  coloredLogs: true,
  baseUrl: `http://localhost:${port}`,
  framework: 'mocha',
  mochaOpts: {
    timeout: 60000
  },
  reporters: ['spec'],
  maxInstances: 1,
  waitforTimeout: 10 * 1000,
  capabilities: [{
    browserName: 'phantomjs',
  }],
  services: ['phantomjs'],
  async beforeTest() {
    await mongoose.connect(databaseUrl, options);
    await mongoose.connection.db.dropDatabase();
    expressServer = app.listen(port);
  },
  async afterTest() {
    await mongoose.disconnect();
    expressServer.close();
  },
};