const connection = require("./connection");
const { tableNameList } = require("../constant/migrationQuery");

const dropTable = (tableName) => {
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
  tableNameListReverse.forEach((table,index) => {
    console.log(index);
    dropTable(table);
  });
};

dropTables();

module.exports = dropTables;