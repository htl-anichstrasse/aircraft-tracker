const express = require('express');

class API {
    server;

    constructor() {
        this.server = express();

        // register endpoints
        this.server.get('/', (req, res) => this.getRoot(req, res));
        this.server.get('/data', (req, res) => this.getData(req, res));

        // logging
        this.server.use((req, res, next) => this.log(req, next));

        // run server
        this.server.listen(process.env.PORT, () => {
            console.log(`REST API is now listening on port ${process.env.PORT}`);
        });
    }

    log(req, next) {
        console.log(`${req.ip} => ${req.method} ${req.path}`);
        next();
    }

    getRoot(req, res) {
        return res.status(403).end();
    }

    getData(req, res) {
        // todo: access mysql db
        mysql.getAllData().then((result) => {
            res.setHeader('Content-Type', 'application/json');
            res.send(result);
        }).catch((err) => {
            throw err;
        });
    }
}

module.exports = API;