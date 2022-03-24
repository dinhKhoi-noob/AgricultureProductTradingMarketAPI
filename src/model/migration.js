const connection = require("./connection");
const router = require("express").Router();

const { queryStringList, tableNameList } = require("../constant/migrationQuery");

const migrateTable = tableName => {
    try {
        const query = queryStringList[tableName];
        connection.query(query, (err, result) => {
            if (result) {
                console.log(`Create table "${tableName}" successfully`);
            }
        });
    } catch (error) {
        console.log(error);
        console.log(`Create table "${tableName}" failed`);
    }
};

const migrate = () => {
    tableNameList.forEach((table, index) => {
        console.log(index);
        migrateTable(table);
    });
};

router.post("/migrate", (req, res) => {
    try {
        migrate();
        return res.status(201).json({ success: true });
    } catch (error) {
        return res.status(500).json({ success: false });
    }
});

module.exports = router;
