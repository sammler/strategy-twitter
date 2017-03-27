const AppServer = require('./app-server');
const defaultConfig = require('./config/server-config');

let app = new AppServer( defaultConfig );
app.start();
