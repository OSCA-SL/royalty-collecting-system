var http = require('http');
var app = require('./app');
const mysql = require('mysql');

//Use system configuration for port or use 6001 by default.
const port = process.env.port || 6001;
const hostname = '127.0.0.1';

//Create server with exported express app
const server = http.createServer(app);
// server.listen(port);

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});

/*
const db = mysql.createConnection ({
    connectionLimit : 10,
    host     : '124.43.10.115',
    user     : 'rcs_db_user',
    password : '*6Lc?YpS',
    database : 'rcs_db',
    debug    : false
});

// connect to database
db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Connected to database');
});
global.db = db;
*/
