# aircraft-tracker

This application visualizes the position of aircraft from a database by putting them on a world map.

## Installation

### 1. Clone this repository

```
git clone https://github.com/htl-anichstrasse/aircraft-tracker.git
```

### 2. Install dependencies

```
npm install
```

### 3. Setup MySQL database

Table structure

![](https://cdn.discordapp.com/attachments/290945213063757824/698994310422724878/unknown.png)

### 4. Enter required environment information in .env file

```
touch .env
```

Environment configuration using dotenv

| Variable | Description |
|---|---|
| MYSQL_HOST | MySQL hostname |
| MYSQL_USER | MySQL username |
| MYSQL_PASSWORD | Password for the MySQL user |
| MYSQL_DB | Name of the MySQL database to be used |
| MYSQL_TABLE_NAME | Name of the table to be used (for example "dump1090data") |
| PORT | Port of the express REST server |

### 5. Enter backend host address in main.js

```javascript
const HOST_ADDRESS = "http://localhost:1234";
```

## Running the application

```
npm run start
```

Then fire up [site/index.html](site/index.html) in your web browser.
