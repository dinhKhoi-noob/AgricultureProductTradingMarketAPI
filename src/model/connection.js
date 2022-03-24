let mysql = require("mysql2");
require("dotenv").config();
const { DB_HOST, DB_USER, DB_PASSWORD, DB_PORT, DB_NAME } = process.env;

let connection = mysql.createConnection({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    port: DB_PORT,
    database: DB_NAME,
});

connection.connect(function (err) {
    if (err) {
        console.log(err);
        return;
    }
    console.log("Connected to database!");
});

module.exports = connection;
