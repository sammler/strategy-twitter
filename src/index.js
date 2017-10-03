const AppServer = require('./app-server');
const config = require('./config/config');

let app = new AppServer(config);
app.start();

