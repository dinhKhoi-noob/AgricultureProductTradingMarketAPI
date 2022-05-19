const router = require("express").Router();
const connection = require("../model/connection");
const jsonResponse = require("../constant/jsonResponse");
router.get("/:id", (req, res) => {
    const { SERVER_ERROR, GET_SUCCESS } = jsonResponse;
    const id = req.params;
    connection.query(`Select * from message where room_id like '${id}'`, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(SERVER_ERROR.status).json({ success: false, message: SERVER_ERROR.message });
        }
        return res.status(GET_SUCCESS.status).json({ success: true, message: GET_SUCCESS.message, result });
    });
});

module.exports = router;
