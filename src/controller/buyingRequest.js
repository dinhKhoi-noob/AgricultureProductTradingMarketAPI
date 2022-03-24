const router = require("express").Router();
const connection = require("../model/connection");
const jsonResponse = require("../constant/jsonResponse");
const randomString = require("randomstring");
const { checkPostBuyingRequest } = require("../middleware/buyingRequest");

router.get("/", (req, res) => {
    const { GET_SUCCESS, NOT_FOUND, SERVER_ERROR } = jsonResponse;
    const { search, confirmed, status } = req.query;
    const selectQuery = `Select * from buying_request_view where now() between date_created and expired_date 
    ${search ? `and product_name like '%${search}%'` : ""} 
    ${confirmed ? `and is_confirm = '${confirmed}'` : ""}
    ${status ? `and status like '${status}'` : ""}
    order by expired_date DESC`;
    console.log(selectQuery);
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

router.get("/:id", (req, res) => {
    const { GET_SUCCESS, NOT_FOUND, SERVER_ERROR } = jsonResponse;
    const { search, confirmed, status } = req.query;
    const { id } = req.params;
    const selectQuery = `Select * from buying_request_view where now() between date_created and expired_date 
    and product_id like '${id}'
    ${search ? `and product_name like '%${search}%'` : ""} 
    ${confirmed ? `and is_confirm = '${confirmed}'` : ""}
    ${status ? `and status like '${status}'` : ""}
    order by expired_date DESC`;
    console.log(selectQuery);
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

router.get("/specific/:id", (req, res) => {
    const { GET_SUCCESS, NOT_FOUND, SERVER_ERROR } = jsonResponse;
    const { id } = req.params;
    const selectQuery = `Select * from buying_request_view where id like '${id}'`;
    connection.query(selectQuery, (err, result) => {
        if (result && result.length > 0) {
            return res
                .status(GET_SUCCESS.status)
                .json({ success: true, message: GET_SUCCESS.message, result: result[0] });
        }
        if (result && result.length < 1) {
            return res.status(NOT_FOUND.status).json({ success: false, message: NOT_FOUND.message });
        }
        return res.status(SERVER_ERROR.status).json({ success: false, message: SERVER_ERROR.message });
    });
});

router.post("/:uid", checkPostBuyingRequest, (req, res) => {
    const { POST_SUCCESS, SERVER_ERROR } = jsonResponse;
    const { productId, price, quantity, measure, desc, expiredDate } = req.body;
    const { uid } = req.params;
    const id = randomString.generate(10);
    const insertQuery = `Insert into buying_request (id, created_by, product_id, price, quantity, measure, description, expired_date)
     values ('${id}','${uid}','${productId}','${price}','${quantity}','${measure}','${desc}','${expiredDate}')`;
    console.log(insertQuery);
    connection.query(insertQuery, (err, result) => {
        if (result) {
            return res.status(POST_SUCCESS.status).json({ success: true, message: POST_SUCCESS.message, id });
        }
        return res.status(SERVER_ERROR.status).json({ success: false, message: SERVER_ERROR.message });
    });
});

router.patch("/:id", (req, res) => {
    const { POST_SUCCESS, SERVER_ERROR } = jsonResponse;
    const { productId, price, quantity, measure, desc, expiredDate } = req.body;
    const { id } = req.params;
    const updateQuery = `Update buying_request set
        productId = '${productId}',
        price = '${price}',
        quantity = '${quantity}',
        measure = '${measure}',
        description = '${desc}',
        expired_date = '${expiredDate}'
        where id like '${id}'
    `;
    connection.query(updateQuery, (err, result) => {
        if (result) {
            return res.status(POST_SUCCESS.status).json({ success: true, message: POST_SUCCESS.message });
        }
        return res.status(SERVER_ERROR.status).json({ success: false, message: SERVER_ERROR.message });
    });
});

router.patch("/confirm/:id", (req, res) => {
    const { POST_SUCCESS, SERVER_ERROR } = jsonResponse;
    const { id } = req.params;
    const { isConfirmed } = req.body;
    const updateQuery = `Update buying_request set is_confirm = '${isConfirmed}' where id like '${id}'`;
    connection.query(updateQuery, (err, result) => {
        if (result) {
            return res.status(POST_SUCCESS.status).json({ success: true, message: POST_SUCCESS.message });
        }
        console.log(err);
        return res.status(SERVER_ERROR.status).json({ success: false, message: SERVER_ERROR.message });
    });
});

router.patch("/status/:id", (req, res) => {
    const { POST_SUCCESS, SERVER_ERROR } = jsonResponse;
    const { id } = req.params;
    const { status } = req.body;
    const updateQuery = `Update buying_request set status = '${status}' where id like '${id}'`;
    connection.query(updateQuery, (err, result) => {
        if (result) {
            return res.status(POST_SUCCESS.status).json({ success: true, message: POST_SUCCESS.message });
        }
        return res.status(SERVER_ERROR.status).json({ success: false, message: SERVER_ERROR.message });
    });
});

module.exports = router;
