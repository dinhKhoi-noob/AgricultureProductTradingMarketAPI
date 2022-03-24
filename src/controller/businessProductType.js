const router = require("express").Router();
const connection = require("../model/connection");
const jsonResponse = require("../constant/jsonResponse");
const randomString = require("randomstring");
const { checkValidReferences } = require("../middleware/businessProductType");

router.post("/:uid", checkValidReferences, (req, res) => {
    const { uid } = req.params;
    const { interestArray } = req.body;
    const { BAD_REQUEST, POST_SUCCESS } = jsonResponse;
    let flag = true;
    for (let i = 0; i < interestArray.length && flag; i++) {
        const { productTypeId } = interestArray[i];
        const id = randomString.generate(10);
        console.log(`insert into business_product_type(id,user_id,product_type_id) values ('${id}','${uid}','${productTypeId}')
            select id from business_product_type where user_id not like '${uid}' and product_type_id not like '${productTypeId}'`);
        connection.query(
            `insert into business_product_type(id,user_id,product_type_id) select '${id}','${uid}','${productTypeId}' from dual 
            where not EXISTS (select * from business_product_type where user_id like '${uid}' and product_type_id like '${productTypeId}')`,
            (err, result) => {
                if (err) {
                    flag = false;
                }
            }
        );
    }
    if (flag) {
        return res.status(POST_SUCCESS.status).json({ success: true, message: POST_SUCCESS.message });
    }
    return res.status(BAD_REQUEST.status).json({ success: false, message: BAD_REQUEST.message });
});

router.get("/:uid", (req, res) => {
    const uid = req.params.uid;
    const { GET_SUCCESS, SERVER_ERROR, NOT_FOUND } = jsonResponse;
    const selectQuery = `Select * from business_product_type_view where user_id like '${uid}'`;
    connection.query(selectQuery, (err, result) => {
        if (result && result.length > 0) {
            return res.status(GET_SUCCESS.status).json({ success: true, message: GET_SUCCESS.message, result });
        }
        if (result && result.length < 1) {
            return res.status(NOT_FOUND.status).json({ success: false, message: NOT_FOUND.message });
        }
        return res.status(SERVER_ERROR.status).json({ success: false, message: SERVER_ERROR.message });
    });
});

module.exports = router;
