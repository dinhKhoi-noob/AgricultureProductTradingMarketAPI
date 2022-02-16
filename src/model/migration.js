const connection = require("./connection");
const {
  queryStringList,
  tableNameList,
} = require("../constant/migrationQuery");

const migrateTable = (tableName) => {
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
  tableNameList.forEach((table) => {
    migrateTable(table);
  });
};

migrate();

module.exports = migrate;
