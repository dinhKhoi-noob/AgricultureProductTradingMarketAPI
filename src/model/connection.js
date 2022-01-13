let mysql = require('mysql2');

let connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: "EcommerceJS"
});

connection.connect(function (err) {
    if (err) {
        console.log(err);
        return;
    };
    console.log('Database is connected successfully !');
});

module.exports = connection;