const dotenv = require('dotenv');
const MySQL = require('./sql').mysql;
const API = require('./api');

console.log('aircraft-tracker is booting');
dotenv.config();

console.log('Connecting to MySQL');
new MySQL().connect(() => {
    // Wait for MySQL to connect before booting REST
    console.log('Booting up REST API');
    new API();
});