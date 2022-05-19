const jsonResponse = require("../constant/jsonResponse");
const connection = require("../model/connection");

const checkOrderRefId = (req, res, next) => {
    const { id } = req.params;
    const { NOT_FOUND, SERVER_ERROR } = jsonResponse;
    console.log(id);
    const selectQuery = `Select id from request_order_view where id like '${id}' or request_id like '${id}'`;
    console.log(selectQuery);
    connection.query(selectQuery, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(SERVER_ERROR.status).json({ success: false, message: SERVER_ERROR.message });
        }
        if (result && result.length === 0) {
            return res.status(NOT_FOUND.status).json({ success: false, message: NOT_FOUND.message });
        }
        next();
    });
};

module.exports = {
    checkOrderRefId,
};
