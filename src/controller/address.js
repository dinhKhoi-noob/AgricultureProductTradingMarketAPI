const router = require("express").Router();
const connection = require("../model/connection");
const jsonResponse = require("../constant/jsonResponse");
const randomString = require("randomstring");
const { checkPostNewAddress } = require("../middleware/address");

router.get("/:uid", (req, res) => {
    const { GET_SUCCESS, NOT_FOUND, SERVER_ERROR } = jsonResponse;
    const { uid } = req.params;
    connection.query(`Select * from address where user_id like '${uid}'`, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(SERVER_ERROR.status).json({ success: false, message: SERVER_ERROR.message });
        }
        if (result && result.length < -1) {
            return res.status(NOT_FOUND.status).json({ success: false, message: NOT_FOUND.message });
        }
        return res.status(GET_SUCCESS.status).json({ success: false, message: GET_SUCCESS.message, result });
    });
});

router.post("/:uid", checkPostNewAddress, (req, res) => {
    const { SERVER_ERROR, POST_SUCCESS } = jsonResponse;
    const { uid } = req.params;
    const { address } = req.body;
    const id = randomString.generate(10);
    connection.query(
        `Insert into address(id,address,user_id) values ('${id}','${address}','${uid}')`,
        (err, result) => {
            if (err) {
                console.log(err);
                return res.status(SERVER_ERROR.status).json({ success: false, message: SERVER_ERROR.message });
            }
            return res.status(POST_SUCCESS.status).json({ success: false, message: POST_SUCCESS.message, id });
        }
    );
});

module.exports = router;
