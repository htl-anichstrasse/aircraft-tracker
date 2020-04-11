const mysqldriver = require('mysql');

class MySQL {
    con;

    constructor() {
        this.con = mysqldriver.createConnection({
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DB
        });
    }

    connect(callback) {
        this.con.connect((err) => {
            if (err) throw err;
            console.log('Successfully connected to MySQL database');
            callback();
        });
    }

    getAllData() {
        return new Promise((resolve, reject) => {
            this.con.query('SELECT * FROM dump1090data;', (err, result, fields) => {
                if (err) reject(err);
                resolve(result);
            });
        });
    }
}

exports.mysql = MySQL;