const router = require("express").Router();
const connection = require("../model/connection");
const jsonResponse = require("../constant/jsonResponse");
const randomString = require("randomstring");
const { checkEmptyField, checkExistedCategoryName } = require("../middleware/productCategory");

router.get("/", (req, res) => {
    const { NOT_FOUND, GET_SUCCESS, SERVER_ERROR } = jsonResponse;
    const query = `Select * from product_type where is_active='0' order by product_type.date_modified desc;`;
    try {
        connection.query(query, (err, result) => {
            if (result && result.length > 0) {
                return res.status(GET_SUCCESS.status).json({ success: true, message: GET_SUCCESS.message, result });
            }
            return res.status(NOT_FOUND.status).json({ success: false, message: NOT_FOUND.message });
        });
    } catch (error) {
        console.log(error);
        return res.status(SERVER_ERROR.status).json({ success: false, message: SERVER_ERROR.message });
    }
});

router.get("/details/:type", (req, res) => {
    const type = req.params.type;
    const { NOT_FOUND, GET_SUCCESS, SERVER_ERROR } = jsonResponse;
    const query = `Select * from product_type where type like '${type}' and is_active='0'`;
    try {
        connection.query(query, (err, result) => {
            if (result && result.length > 0) {
                return res.status(GET_SUCCESS.status).json({ success: true, message: GET_SUCCESS.message, result });
            }
            return res.status(NOT_FOUND.status).json({ success: false, message: NOT_FOUND.message });
        });
    } catch (error) {
        return res.status(SERVER_ERROR.status).json({ success: false, message: SERVER_ERROR.message });
    }
});

router.post("/", checkEmptyField, checkExistedCategoryName, (req, res) => {
    let { title, type } = req.body;
    const { POST_SUCCESS, SERVER_ERROR } = jsonResponse;
    const id = randomString.generate(10);
    const query = `Insert into product_type(id, title, type, created_by) values ('${id}', '${title}', '${type}', "5xFzXgwCok")`;
    console.log(query);
    connection.query(query, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(SERVER_ERROR.status).json({ success: false, message: SERVER_ERROR.message });
        }
        if (result) {
            return res.status(POST_SUCCESS.status).json({ success: true, message: POST_SUCCESS.message });
        }
    });
});

router.patch("/:id", checkEmptyField, checkExistedCategoryName, (req, res) => {
    const { id } = req.params;
    let { title, type } = req.body;
    const { POST_SUCCESS, SERVER_ERROR } = jsonResponse;
    const query = `UPDATE product_type
        SET title = '${title}', type='${type}'
        WHERE id like '${id}' and is_active='0'`;
    connection.query(query, (err, result) => {
        if (result) {
            return res.status(POST_SUCCESS.status).json({ success: true, message: POST_SUCCESS.message });
        }
        return res.status(SERVER_ERROR.status).json({ success: false, message: SERVER_ERROR.message });
    });
});

router.delete("/:id", (req, res) => {
    const { id } = req.params;
    const { POST_SUCCESS, SERVER_ERROR } = jsonResponse;
    console.log(id);
    const query = `UPDATE product_type
        SET is_active='1'
        WHERE id like '${id}' and is_active='0'`;
    connection.query(query, (err, result) => {
        if (result) {
            return res.status(POST_SUCCESS.status).json({ success: true, message: POST_SUCCESS.message });
        }
        console.log(err);
        return res.status(SERVER_ERROR.status).json({ success: false, message: SERVER_ERROR.message });
    });
});

module.exports = router;
