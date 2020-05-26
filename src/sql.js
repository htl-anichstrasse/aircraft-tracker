const mysqldriver = require('mysql');
const logger = require('log4js').getLogger('mysql');

class MySQL {
  con;

  constructor() {
    logger.info('Connecting to MySQL...');
    this.con = mysqldriver.createConnection({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DB,
    });
  }

  connect(callback) {
    this.con.connect((err) => {
      if (err) throw err;
      logger.info('Successfully connected to MySQL!');
      callback(this);
    });
  }

  /**
   * Gets aircraft data from the database
   *
   * @param la1 Latitude of Corner1
   * @param lo1 Longtitude of Corner1
   * @param la2 Latitude of Corner2
   * @param lo2 Longtitude of Corner2
   */
  getData(lat1, lon1, lat2, lon2, minDate, maxDate) {
    return new Promise((resolve, reject) => {
      const minLat = Math.min(lat1, lat2);
      const maxLat = Math.max(lat1, lat2);
      const minLon = Math.min(lon1, lon2);
      const maxLon = Math.max(lon1, lon2);
      minDate /= 1000;
      maxDate /= 1000;
      this.con.query(
        `SELECT flightnr, seentime, height, speed, squawk, lat, lon FROM ${process.env.MYSQL_TABLE_NAME} WHERE lat BETWEEN ? AND ? AND lon BETWEEN ? AND ? AND seentime BETWEEN ? AND ? GROUP BY flightnr;`,
        [minLat, maxLat, minLon, maxLon, minDate, maxDate],
        (err, result, fields) => {
          if (err) reject(err);
          resolve(result);
        }
      );
    });
  }

  getFlightRoute(flightnr, lat1, lon1, lat2, lon2, time) {
    const minLat = Math.min(lat1, lat2);
    const maxLat = Math.max(lat1, lat2);
    const minLon = Math.min(lon1, lon2);
    const maxLon = Math.max(lon1, lon2);
    time /= 1000;
    const timeNext = time + 86400;

    return new Promise((resolve, reject) => {
      this.con.query(
        `SELECT lat, lon FROM ${process.env.MYSQL_TABLE_NAME} WHERE flightnr = ? AND lat BETWEEN ? AND ? AND lon BETWEEN ? AND ? AND seentime BETWEEN ? AND ?;`,
        [flightnr, minLat, maxLat, minLon, maxLon, time, timeNext],
        (err, result) => {
          if (err) reject(err);
          resolve(result);
        }
      );
    });
  }
}

exports.mysql = MySQL;
