const jsonResponse = require("../constant/jsonResponse");
const connection = require("../model/connection");

const nullCheckForRegisteration = (req, res, next) => {
    const { BAD_REQUEST } = jsonResponse;
    const { username, password, email, address, phone } = req.body;
    if (
        !username ||
        !password ||
        !email ||
        !address ||
        !phone ||
        username === "" ||
        password === "" ||
        email === "" ||
        address === "" ||
        phone === ""
    ) {
        return res
            .status(BAD_REQUEST.status)
            .json({ success: false, message: "Vui lòng nhập đầy đủ thông tin cần thiết" });
    }
    next();
};

const nullCheckForLogin = (req, res, next) => {
    const { BAD_REQUEST } = jsonResponse;
    const { username, password } = req.body;
    if (!username || !password || !username === "" || password === "") {
        return res.status(BAD_REQUEST.status).json({ success: false, message: BAD_REQUEST.message });
    }
    next();
};

const nullCheckForAdditionalInformation = (req, res, next) => {
    const { BAD_REQUEST } = jsonResponse;
    const { address, phone } = req.body;
    if (!address || !phone || address === "" || phone === "") {
        return res
            .status(BAD_REQUEST.status)
            .json({ success: false, message: "Vui lòng điền đủ thông tin cần thiết !" });
    }
    next();
};

const existedUser = (req, res, next) => {
    const { BAD_REQUEST } = jsonResponse;
    const { username, email } = req.body;
    const query = `Select id from user where username like '${username}' or email like '${email}'`;
    try {
        connection.query(query, (err, result) => {
            if (result.length > 0) {
                return res
                    .status(BAD_REQUEST.status)
                    .json({ success: false, message: "Tên người dùng hoặc email đã tồn tại, vui lòng thử lại !" });
            }
            next();
        });
    } catch (error) {
        const { SERVER_ERROR } = jsonResponse;
        return res.status(SERVER_ERROR.status).json({ success: false, message: SERVER_ERROR.message });
    }
};

const isCorrectPassword = (req, res, next) => {
    const { BAD_REQUEST, SERVER_ERROR, NOT_FOUND } = jsonResponse;
    const uid = req.params.uid;
    const bcrypt = require("bcryptjs");
    const { old_password, password } = req.body;
    if (!old_password || old_password === "" || !password || password === "") {
        return res
            .status(BAD_REQUEST.status)
            .json({ success: false, message: "Vui lòng điền đầy đủ thông tin cần thiết !" });
    }
    connection.query(`Select password from user where id like '${uid}'`, async (err, result) => {
        if (err) {
            return res.status(SERVER_ERROR.status).json({ success: false, message: SERVER_ERROR.message });
        }
        if (result && result.length < 1) {
            return res.status(NOT_FOUND.status).json({ success: false, message: NOT_FOUND.message });
        }
        if (result && result.length > 0) {
            const isCorrect = await bcrypt.compare(old_password, result[0].password);
            if (!isCorrect) {
                return res
                    .status(BAD_REQUEST.status)
                    .json({ success: false, message: "Mật khẩu không chính xác, vui lòng thử lại!" });
            }
            next();
        }
    });
};

module.exports = {
    nullCheckForLogin,
    nullCheckForRegisteration,
    nullCheckForAdditionalInformation,
    existedUser,
    isCorrectPassword,
};
