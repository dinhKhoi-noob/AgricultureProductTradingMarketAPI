const jsonResponse = require("../constant/jsonResponse");
const connection = require("../model/connection");

const checkValidReferences = (req, res, next) => {
    const uid = req.params.uid;
    const { interestArray } = req.body;
    const { NOT_FOUND } = jsonResponse;
    connection.query(`Select id from user where id like '${uid}'`, (err, result) => {
        if (err || !result || result.length < 1) {
            return res.status(NOT_FOUND.status).json({ success: false, message: "Không tìm thấy người dùng !" });
        }
        let flag = true;
        for (let i = 0; i < interestArray.length && flag; i++) {
            const { productTypeId } = interestArray[i];
            connection.query(`Select * from product_type where id like '${productTypeId}' `, (err, result) => {
                if (err || !result || result.length < 1) {
                    flag = false;
                }
            });
        }
        if (!flag) {
            return res.status(NOT_FOUND.status).json({ success: false, message: "Không tìm thấy danh mục nông sản !" });
        }
        next();
    });
};

module.exports = {
    checkValidReferences,
};
