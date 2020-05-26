const express = require('express');
const log4js = require('log4js');
const logger = log4js.getLogger('api');

class API {
  server;
  mysql;

  constructor(mysql) {
    this.server = express();
    this.mysql = mysql;

    this.server.use(log4js.connectLogger(logger, {
      level: 'auto', statusRules: [
        { from: 200, to: 499, level: 'debug' },
        { from: 500, to: 599, level: 'error' }
      ]
    }));

    this.server.get('/', (req, res) => this.getRoot(req, res));
    this.server.get('/data/:latlonPair/:minDate/:maxDate', (req, res) =>
      this.getData(req, res)
    );

    this.server.listen(process.env.PORT, () => {
      logger.info(`REST API is now listening on port ${process.env.PORT}`);
    });
  }

  getRoot(req, res) {
    return res.status(403).end();
  }

  getData(req, res) {
    res.header('Access-Control-Allow-Origin', '*');
    try {
      var json = JSON.parse(req.params.latlonPair);
      if (!(json.lat1 && json.lat2 && json.lon1 && json.lon2)) {
        res.status('400').send({ message: 'Invalid parameters' });
        return;
      }
      var minDate = req.params.minDate;
      var maxDate = req.params.maxDate;
      if (!minDate || !maxDate) {
        res.status('400').send({ message: 'Invalid parameters' });
        return;
      }
      this.mysql
        .getData(
          json.lat1,
          json.lon1,
          json.lat2,
          json.lon2,
          new Date(minDate).getTime(),
          new Date(maxDate).getTime()
        )
        .then((result) => {
          res.setHeader('Content-Type', 'application/json');
          res.status('200').send(result);
        })
        .catch((err) => {
          throw err;
        });
    } catch (err) {
      res.status('400').send({ message: 'Invalid JSON' });
    }
  }
}

module.exports = API;
