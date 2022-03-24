const connection = require("./connection");
const { tableNameList } = require("../constant/migrationQuery");
const router = require("express").Router();
const dropTable = tableName => {
    try {
        const query = `Drop table if exists ${tableName}`;
        connection.query(query, (err, result) => {
            if (result) {
                console.log(`Drop table "${tableName}" successfully`);
            }
        });
    } catch (error) {
        console.log(error);
        console.log(`Drop table "${tableName}" failed`);
    }
};

const dropTables = () => {
    let tableNameListReverse = tableNameList.reverse();
    tableNameListReverse.forEach((table, index) => {
        console.log(index);
        dropTable(table);
    });
};

router.post("/", (req, res) => {
    try {
        dropTables();
        return res.status(201).json({ success: true });
    } catch (error) {
        return res.status(500).json({ success: false });
    }
});

module.exports = router;
