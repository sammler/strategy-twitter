const AppServer = require('./src/app-server');
const defaultConfig = require('./src/config/server-config');

let app = new AppServer(defaultConfig);
app.start();
