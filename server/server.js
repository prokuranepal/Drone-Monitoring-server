/**
 * TODO: how to use HTTP /2 protocol
 */

/**
 * configuration of database is stored in config file
 */

require('./config/config');

/**
 * server require
 */
const server = require('./app/app');

/********************************************************************/

/**
 * setting the port at which the server run
 */
const port = process.env.PORT || 3000;

/**
 * setting the hostname at which the server run for own server only
 */
const hostname = 'localhost';

require('./socketio/defaultSocket');
require('./socketio/JT601Socket');
require('./socketio/JT602Socket');
require('./socketio/JT603Socket');
require('./socketio/JT604Socket');
/********************************************************************/

/**
 * setting up a server at port 3000 or describe by process.env.PORT and host localhost or described by
 * process.env.HOSTNAME for own server only
 */
server.listen(port,hostname, () => {
    console.log(`Server running at http://${hostname}:${port}`);
});

/*server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
})*/
