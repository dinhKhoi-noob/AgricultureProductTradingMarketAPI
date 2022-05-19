const jsonResponse = require("../constant/jsonResponse");
const connection = require("../model/connection");

const checkPostNewRequest = (req, res, next) => {
    const { SERVER_ERROR, BAD_REQUEST, NOT_FOUND } = jsonResponse;
    const { id } = req.params;
    const { uid, quantity, price } = req.body;
    if (!id || !uid || !quantity || !price || id === "" || uid === "" || quantity < 1 || price < 1) {
        return res
            .status(BAD_REQUEST.status)
            .json({ success: false, message: "Vui lòng nhập đầy đủ thông tin cần thiết !" });
    }
    connection.query(`Select id from user where id like '${uid}'`, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(SERVER_ERROR.status).json({ success: false, message: SERVER_ERROR.message });
        }
        if (result && result.length < 1) {
            return res.status(NOT_FOUND.status).json({ success: false, message: "Không tìm thấy người dùng !" });
        }
        connection.query(`Select id from request where id like '${id}'`, (err, result) => {
            if (err) {
                console.log(err);
                return res.status(SERVER_ERROR.status).json({ success: false, message: SERVER_ERROR.message });
            }
            if (result && result.length < 1) {
                return res.status(NOT_FOUND.status).json({ success: false, message: "Không tìm thấy yêu cầu mua !" });
            }
            next();
        });
    });
};

const checkUpdateRequest = (req, res, next) => {
    const { SERVER_ERROR, NOT_FOUND, BAD_REQUEST } = jsonResponse;
    const id = req.params.id;
    const { quantity, price, description, address, dateCompletedOrder } = req.body;
    if (quantity < 1 || price < 1 || address === "" || !dateCompletedOrder || !quantity || !price || !address) {
        return res
            .status(BAD_REQUEST.status)
            .json({ success: false, message: "Vui lòng nhập đầy đủ thông tin cần thiết !" });
    }
    connection.query(`Select id from request_for_another_request where id like '${id}'`, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(SERVER_ERROR.status).json({ success: false, message: SERVER_ERROR.message });
        }
        if (result && result.length < 1) {
            return res.status(NOT_FOUND.status).json({ success: false, message: NOT_FOUND.message });
        }
        next();
    });
};

const confirmSubrequest = (req, res, next) => {
    const { SERVER_ERROR, NOT_FOUND, BAD_REQUEST } = jsonResponse;
    const { id } = req.params;
    const { status } = req.body;
    connection.query(
        `Select total_quantity,quantity from request_for_another_request_view where id like '${id}'`,
        (err, result) => {
            if (err) {
                console.log(err);
                return res.status(SERVER_ERROR.status).json({ success: false, message: SERVER_ERROR.message });
            }
            if (result && result.length < 1) {
                return res.status(NOT_FOUND.status).json({ success: false, message: NOT_FOUND.message });
            }
            if (result && result[0].total_quantity <= 0 && status === "success") {
                return res
                    .status(BAD_REQUEST.status)
                    .json({ success: false, message: "Yêu cầu này đã đóng do đã đủ số lượng đăng ký !" });
            }
            if (result && result[0].total_quantity < result[0].quantity && status === "success") {
                return res
                    .status(BAD_REQUEST.status)
                    .json({ success: false, message: "Không thể đăng ký do đã vượt quá số lượng có thể đăng ký !" });
            }
            next();
        }
    );
};

module.exports = {
    checkPostNewRequest,
    checkUpdateRequest,
    confirmSubrequest,
};
