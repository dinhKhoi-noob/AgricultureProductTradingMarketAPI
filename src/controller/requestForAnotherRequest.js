const router = require("express").Router();
const connection = require("../model/connection");
const jsonResponse = require("../constant/jsonResponse");
const randomString = require("randomstring");
const {
    checkPostNewRequest,
    checkUpdateRequest,
    confirmSubrequest,
} = require("../middleware/requestForAnotherRequest");

router.get("/", (req, res) => {
    const { SERVER_ERROR, GET_SUCCESS, NOT_FOUND } = jsonResponse;
    const { id, type, date_begin, date_end, search } = req.query;
    let dateBegin = null;
    let dateEnd = null;
    if (date_begin && date_end) {
        dateBegin = new Date(date_begin).toISOString().slice(0, 19).replace("T", " ");
        dateEnd = new Date(date_end).toISOString().slice(0, 19).replace("T", " ");
    }
    const selectQuery = `Select * from request_for_another_request_view where 1 ${
        !type ? "" : type === "selling" ? "and transaction_type='selling'" : "and transaction_type='buying'"
    }${id ? ` and created_by like '${id}'` : ``}
    ${dateBegin && dateEnd ? ` and date_created between '${dateBegin}' and '${dateEnd}'` : ""}
    ${search ? `and product_name like '%${search}%'` : ""}
    order by price`;
    console.log(selectQuery);
    connection.query(selectQuery, (err, result) => {
        if (err) {
            return res.status(SERVER_ERROR.status).json({ success: false, message: SERVER_ERROR.message });
        }
        if (result && result.length === 0) {
            return res.status(NOT_FOUND.status).json({ success: false, message: NOT_FOUND.message });
        }
        return res.status(GET_SUCCESS.status).json({ success: false, message: GET_SUCCESS.message, result });
    });
});

router.get("/:id", (req, res) => {
    const { SERVER_ERROR, GET_SUCCESS, NOT_FOUND } = jsonResponse;
    const { id } = req.params;
    const selectQuery = `Select * from request_for_another_request_view where request_id like '${id}' order by price`;
    connection.query(selectQuery, (err, result) => {
        if (err) {
            return res.status(SERVER_ERROR.status).json({ success: false, message: SERVER_ERROR.message });
        }
        if (result && result.length === 0) {
            return res.status(NOT_FOUND.status).json({ success: false, message: NOT_FOUND.message });
        }
        return res.status(GET_SUCCESS.status).json({ success: false, message: GET_SUCCESS.message, result });
    });
});

router.get("/all/:id", (req, res) => {
    const { SERVER_ERROR, GET_SUCCESS, NOT_FOUND } = jsonResponse;
    const { id } = req.params;
    const { type, date_begin, date_end, user_role, status } = req.query;
    let dateBegin = null;
    let dateEnd = null;
    if (date_begin && date_end) {
        dateBegin = new Date(date_begin).toISOString().slice(0, 19).replace("T", " ");
        dateEnd = new Date(date_end).toISOString().slice(0, 19).replace("T", " ");
    }
    const selectQuery = `Select * from request_for_another_request_view where 1 ${
        user_role !== "consummer" ? "" : ` and where created_by like '${id}'`
    } ${status !== undefined ? ` and status like '${status}'` : ""} ${type ? ` and type like '${type}'` : ""}
    ${dateBegin ? ` and date_created between '${dateBegin}' and '${dateEnd}'` : ""};`;
    console.log(selectQuery);
    connection.query(selectQuery, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(SERVER_ERROR.status).json({ success: false, message: SERVER_ERROR.message });
        }
        if (result && result.length === 0) {
            return res.status(NOT_FOUND.status).json({ success: false, message: NOT_FOUND.message });
        }
        return res.status(GET_SUCCESS.status).json({ success: true, message: GET_SUCCESS.message });
    });
});

router.get("/specific/:id", (req, res) => {
    const { SERVER_ERROR, GET_SUCCESS, NOT_FOUND } = jsonResponse;
    const { id } = req.params;
    console.log(`Select * from request_for_another_request_view where id like '${id}'`);
    const selectQuery = `Select * from request_for_another_request_view where id like '${id}'`;
    connection.query(selectQuery, (err, result) => {
        if (err) {
            return res.status(SERVER_ERROR.status).json({ success: false, message: SERVER_ERROR.message });
        }
        if (result && result.length === 0) {
            return res.status(NOT_FOUND.status).json({ success: false, message: NOT_FOUND.message });
        }
        return res.status(GET_SUCCESS.status).json({ success: false, message: GET_SUCCESS.message, result: result[0] });
    });
});

router.post("/:id", checkPostNewRequest, (req, res) => {
    const { SERVER_ERROR, POST_SUCCESS } = jsonResponse;
    const { id } = req.params;
    const { uid, quantity, price, description, address, dateCompletedOrder, type } = req.body;
    const sellingRequestId = randomString.generate(10);
    const insertQuery = `insert into request_for_another_request(id,created_by,quantity,price,status,request_id,description,address_id,date_complete_order,transaction_type)
    values ('${sellingRequestId}','${uid}','${quantity}','${price}','waiting','${id}','${description}','${address}','${dateCompletedOrder}','${type}')`;
    console.log(insertQuery);
    connection.query(insertQuery, (err, result) => {
        if (result) {
            return res
                .status(POST_SUCCESS.status)
                .json({ success: true, message: POST_SUCCESS.message, id: sellingRequestId });
        }
        console.log(err);
        return res.status(SERVER_ERROR.status).json({ success: false, message: SERVER_ERROR.message });
    });
});

router.patch("/:id", checkUpdateRequest, (req, res) => {
    const { POST_SUCCESS, SERVER_ERROR } = jsonResponse;
    const { id } = req.params;
    const { quantity, price, description, address, dateCompletedOrder } = req.body;
    const editQuery = `Update request_for_another_request set
        quantity='${quantity}',
        price='${price}',
        description='${description}',
        address_id='${address}',
        date_complete_order = '${dateCompletedOrder}'
        where id like '${id}'
        and status = 'waiting'
    `;
    connection.query(editQuery, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(SERVER_ERROR.status).json({ success: false, message: SERVER_ERROR.message });
        }
        if (result && result.length === 0) {
            return res.status(NOT_FOUND.status).json({ success: false, message: NOT_FOUND.message });
        }
        return res.status(POST_SUCCESS.status).json({ success: false, message: POST_SUCCESS.message });
    });
});

router.patch("/status/:id", confirmSubrequest, (req, res) => {
    const { POST_SUCCESS, SERVER_ERROR } = jsonResponse;
    const { id } = req.params;
    const { status } = req.body;
    const updateQuery = `Update request_for_another_request set status = '${status}' where id like '${id}'
    and now() BETWEEN now() and DATE_SUB(date_complete_order,INTERVAL 12 HOUR);`;
    console.log(updateQuery);
    connection.query(updateQuery, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(SERVER_ERROR.status).json({ success: false, message: SERVER_ERROR.message });
        }
        return res.status(POST_SUCCESS.status).json({ success: false, message: POST_SUCCESS.message });
    });
});

module.exports = router;
