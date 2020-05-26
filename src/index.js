const log4js = require('log4js');

const dotenv = require('dotenv');
const MySQL = require('./sql').mysql;
const API = require('./api');

log4js.configure({
  appenders: {
    console: { type: 'console' }
  },
  categories: {
    default: { appenders: ['console'], level: 'debug' }
  }
});
const logger = log4js.getLogger('bootstrap');

function main(args) {
  logger.info('aircraft-tracker is booting...')
  dotenv.config();
  new MySQL().connect((mysql) => {
    new API(mysql);
  });
}

main(process.argv);
