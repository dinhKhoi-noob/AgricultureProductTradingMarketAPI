let mysql = require("mysql2");
require("dotenv").config();
const { DB_HOST, DB_USERNAME, DB_PASSWORD } = process.env;

let connection = mysql.createConnection({
  host: DB_HOST,
  user: DB_USERNAME,
  password: DB_PASSWORD,
  port: 3306,
  database: "apm_db",
});

connection.connect(function (err) {
  if (err) {
    console.log(err);
    return;
  }
  console.log("Connected to database!");
});

module.exports = connection;
