const jsonResponse = require("../constant/jsonResponse");
const connection = require("../model/connection");

const checkEmptyField = (req, res, next) => {
    const { BAD_REQUEST } = jsonResponse;
    const { type, title } = req.body;
    if (type === "" || !type || title === "" || !title || (type !== "crude" && type !== "processed")) {
        return res.status(BAD_REQUEST.status).json({ success: false, message: BAD_REQUEST.message });
    }
    next();
};

const checkExistedCategoryName = (req, res, next) => {
    const { BAD_REQUEST, POST_SUCCESS, SERVER_ERROR } = jsonResponse;
    const { title } = req.body;
    const id = req.params.id;
    if (id) {
        connection.query(`Select id from product_type where title like '${title}'`, (err, result) => {
            if (result && result.length > 0 && result[0].id !== id) {
                return res.status(BAD_REQUEST.status).json({ success: false, message: BAD_REQUEST.message });
            }
            next();
        });
    } else {
        const query = `Select id,is_active from product_type where title = '${title}'`;
        connection.query(query, (err, result) => {
            if (result && result.length > 0) {
                if (result[0].is_active === 1) {
                    return connection.query(
                        `UPDATE product_type
                    SET is_active='0'
                    WHERE id like '${result[0].id}' and is_active='1'`,
                        (err, result) => {
                            if (err) {
                                return res
                                    .status(SERVER_ERROR.status)
                                    .json({ success: false, message: SERVER_ERROR.message });
                            }
                            return res
                                .status(POST_SUCCESS.status)
                                .json({ success: true, message: POST_SUCCESS.message });
                        }
                    );
                }
                return res.status(BAD_REQUEST.status).json({ success: false, message: BAD_REQUEST.message });
            }
            next();
        });
    }
};

module.exports = {
    checkEmptyField,
    checkExistedCategoryName,
};
