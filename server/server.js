/**
 * TODO: how to use HTTP /2 protocol
 */

/**
 * configuration of database is stored in config file
 */
require('./config/config');
global.deviceNames = 4;

/**
 * server require
 */
const server = require('./app/app');

/********************************************************************/

/**
 * setting the port at which the server run
 */
const port = process.env.PORT || 8081;

/**
 * setting the hostname at which the server run
 */
const hostname = process.env.HOSTNAME || 'localhost';

require('./socketio/defaultSocket');
require('./socketio/pulchowkSocket');
require('./socketio/nangiSocket');
require('./socketio/dharanSocket');
require('./socketio/dhangadiSocket');
/********************************************************************/

/**
 * setting up a server at port 3000 or describe by process.env.PORT and host localhost or described by
 * process.env.HOSTNAME
 */
server.listen(port,hostname, () => {
    console.log(`Server running at https://${hostname}:${port}`);
});
