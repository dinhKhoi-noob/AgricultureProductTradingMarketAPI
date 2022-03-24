const router = require("express").Router();
const connection = require("../model/connection");
const jsonResponse = require("../constant/jsonResponse");
const randomString = require("randomstring");
const { checkEmptyField, checkExistedProductName } = require("../middleware/product");

router.get("/", (req, res) => {
    const { NOT_FOUND, GET_SUCCESS, SERVER_ERROR } = jsonResponse;
    const query = `Select * from productView;`;
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

router.post("/", checkEmptyField, checkExistedProductName, (req, res) => {
    const { title, typeId } = req.body;
    const { POST_SUCCESS, SERVER_ERROR, BAD_REQUEST } = jsonResponse;
    const id = randomString.generate(10);
    const query = `Insert into product(id, title, type_id, created_by) values ('${id}', '${title}', '${typeId}', "5xFzXgwCok")`;
    if (typeId === "" || !typeId) {
        return res.status(BAD_REQUEST.status).json({ success: false, message: BAD_REQUEST.message });
    }
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

router.patch("/:id", checkEmptyField, checkExistedProductName, (req, res) => {
    const { id } = req.params;
    const { title, typeId } = req.body;
    const { POST_SUCCESS, SERVER_ERROR } = jsonResponse;
    const query = `UPDATE product SET title = '${title}' ${
        typeId ? `, type_id='${typeId}'` : ""
    } WHERE id like '${id}' and is_active='0'`;
    connection.query(query, (err, result) => {
        if (result) {
            return res.status(POST_SUCCESS.status).json({ success: true, message: POST_SUCCESS.message });
        }
        console.log(err);
        return res.status(SERVER_ERROR.status).json({ success: false, message: SERVER_ERROR.message });
    });
});

router.delete("/:id", (req, res) => {
    const { id } = req.params;
    const { POST_SUCCESS, SERVER_ERROR } = jsonResponse;
    const query = `UPDATE product
        SET is_active='1'
        WHERE id like '${id}' and is_active='0'`;
    console.log(query);
    connection.query(query, (err, result) => {
        if (result) {
            return res.status(POST_SUCCESS.status).json({ success: true, message: POST_SUCCESS.message });
        }
        console.log(err);
        return res.status(SERVER_ERROR.status).json({ success: false, message: SERVER_ERROR.message });
    });
});

module.exports = router;
