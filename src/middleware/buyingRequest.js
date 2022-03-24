const jsonResponse = require("../constant/jsonResponse");
const connection = require("../model/connection");

const checkPostBuyingRequest = (req, res, next) => {
    const { uid } = req.params;
    const { BAD_REQUEST, NOT_FOUND } = jsonResponse;
    const { productId, price, quantity, measure, desc, expiredDate } = req.body;
    if (
        !uid ||
        uid === "" ||
        !productId ||
        productId === "" ||
        !price ||
        price === 0 ||
        !quantity ||
        quantity === 0 ||
        !measure ||
        measure === "" ||
        !desc ||
        desc === "" ||
        !expiredDate
    ) {
        return res.status(BAD_REQUEST.status).json({ success: false, message: BAD_REQUEST.message });
    }
    console.log(`Select id from user where id like '${uid}'`);
    connection.query(`Select id from user where id like '${uid}'`, (err, result) => {
        if (result && result.length < 1) {
            return res.status(NOT_FOUND.status).json({ success: false, message: NOT_FOUND.message });
        }
        if (err) {
            return res.status(SERVER_ERROR.status).json({ success: false, message: SERVER_ERROR.message });
        }
        return connection.query(`Select id from product where id like '${productId}'`, (err, result) => {
            if (result && result.length < 1) {
                return res.status(NOT_FOUND.status).json({ success: false, message: NOT_FOUND.message });
            }
            if (err) {
                return res.status(SERVER_ERROR.status).json({ success: false, message: SERVER_ERROR.message });
            }
            next();
        });
    });
};

module.exports = { checkPostBuyingRequest };
