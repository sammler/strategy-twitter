const AppServer = require('./app-server');
const defaultConfig = require('./config/config-default');

let app = new AppServer(defaultConfig);
app.start();

