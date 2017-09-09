const AppServer = require('./src/app-server');
const defaultConfig = require('./src/config/config-default');

let app = new AppServer(defaultConfig);
app.start();
