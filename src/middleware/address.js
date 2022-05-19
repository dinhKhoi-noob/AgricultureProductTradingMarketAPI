const jsonResponse = require("../constant/jsonResponse");
const connection = require("../model/connection");

const checkPostNewAddress = (req, res, next) => {
    const { NOT_FOUND, SERVER_ERROR, BAD_REQUEST } = jsonResponse;
    const { uid } = req.params;
    const { address } = req.body;
    if (!uid || !address || uid === "" || address === "") {
        return res
            .status(BAD_REQUEST.status)
            .json({ success: false, message: "Thông tin không hợp lệ, vui lòng thử lại !" });
    }
    connection.query(`Select id from user where id like '${uid}'`, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(SERVER_ERROR.status).json({ success: false, message: SERVER_ERROR.message });
        }
        if (result && result.length < 1) {
            return res.status(NOT_FOUND.status).json({ success: false, message: NOT_FOUND.message });
        }
        return connection.query(
            `Select id from address where address like '${address}' and user_id like '${uid}'`,
            (err, result) => {
                if (err) {
                    console.log(err);
                    return res.status(SERVER_ERROR.status).json({ success: false, message: SERVER_ERROR.message });
                }
                if (result && result.length > 0) {
                    return res
                        .status(BAD_REQUEST.status)
                        .json({ success: false, message: "Địa chỉ đã tồn tại với người dùng này, vui lòng thử lại !" });
                }
                next();
            }
        );
    });
};

module.exports = { checkPostNewAddress };
