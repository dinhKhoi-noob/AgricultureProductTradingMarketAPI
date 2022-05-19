const router = require("express").Router();
const connection = require("../model/connection");
const jsonResponse = require("../constant/jsonResponse");
const randomString = require("randomstring");
const { checkPostRequest } = require("../middleware/request");

module.exports = (io, socket) => {
    router.get("/", (req, res) => {
        const { GET_SUCCESS, NOT_FOUND, SERVER_ERROR } = jsonResponse;
        const { search, confirmed, status, type, list_history, date_begin, date_end } = req.query;
        let dateBegin = null;
        let dateEnd = null;
        if (date_begin && date_end) {
            dateBegin = new Date(date_begin).toISOString().slice(0, 19).replace("T", " ");
            dateEnd = new Date(date_end).toISOString().slice(0, 19).replace("T", " ");
        }
        const selectQuery = `Select * from request_view where 1
    ${list_history === "1" ? "and now() between date_created and DATE_SUB(expired_date,INTERVAL 1 DAY)" : ""}
    ${search ? `and product_name like '%${search}%'` : ""} 
    ${confirmed ? `and is_confirm = '${confirmed}'` : ""}
    ${status ? `and status like '${status}'` : ""}
    ${type ? (type === "selling" ? ` and transaction_type like 'selling'` : ` and transaction_type like 'buying'`) : ""}
    ${date_begin ? ` and date_created between '${dateBegin}' and '${dateEnd}'` : ""}
    order by date_created DESC`;
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
        const { search, confirmed, status, list_history, date_begin, date_end } = req.query;
        const { id } = req.params;
        let dateBegin = null;
        let dateEnd = null;
        if (date_begin && date_end) {
            dateBegin = new Date(date_begin).toISOString().slice(0, 19).replace("T", " ");
            dateEnd = new Date(date_end).toISOString().slice(0, 19).replace("T", " ");
        }
        const selectQuery = `Select * from request_view where created_by like '${id}'
    ${list_history === "1" ? "and now() between date_created and DATE_SUB(expired_date,INTERVAL 1 DAY)" : ""}
    ${search ? `and product_name like '%${search}%'` : ""} 
    ${confirmed ? `and is_confirm = '${confirmed}'` : ""}
    ${status ? `and status like '${status}'` : ""}
    ${date_begin ? ` and date_created between '${dateBegin}' and '${dateEnd}'` : ""}
    order by date_created DESC`;
        console.log(selectQuery);
        connection.query(selectQuery, (err, result) => {
            if (result && result.length > 0) {
                return res.status(GET_SUCCESS.status).json({ success: true, message: GET_SUCCESS.message, result });
            }
            if (result && result.length < 1) {
                return res.status(NOT_FOUND.status).json({ success: false, message: NOT_FOUND.message });
            }
            console.log(err);
            return res.status(SERVER_ERROR.status).json({ success: false, message: SERVER_ERROR.message });
        });
    });

    router.get("/specific/:id", (req, res) => {
        const { GET_SUCCESS, NOT_FOUND, SERVER_ERROR } = jsonResponse;
        const { id } = req.params;
        const selectQuery = `Select * from request_view where id like '${id}'`;
        console.log(selectQuery);
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

    router.post("/:uid", checkPostRequest, (req, res) => {
        const { POST_SUCCESS, SERVER_ERROR } = jsonResponse;
        const { productId, price, quantity, measure, desc, expiredDate, productName, address, type, fee } = req.body;
        const { uid } = req.params;
        const id = randomString.generate(10);
        const insertQuery = `Insert into request (id, created_by, product_id, price, quantity, measure, description, expired_date,product_specific_name,address_id,transaction_type,fee)
    values ('${id}','${uid}','${productId}','${price}','${quantity}','${measure}','${desc}','${expiredDate}','${productName}','${address}','${type}',${fee})`;
        connection.query(insertQuery, (err, result) => {
            if (result) {
                socket.broadcast.emit("request:post_status", {
                    status: POST_SUCCESS.status,
                    message: `Có một yêu cầu ${type === "selling" ? "bán" : "mua"} mới !`,
                    success: true,
                });
                return res.status(POST_SUCCESS.status).json({ success: true, message: POST_SUCCESS.message, id });
            }
            console.log(err);
            return res.status(SERVER_ERROR.status).json({ success: false, message: SERVER_ERROR.message });
        });
    });

    router.patch("/:id", (req, res) => {
        const { POST_SUCCESS, SERVER_ERROR } = jsonResponse;
        const { productId, price, quantity, measure, desc, expiredDate, productName, address, fee } = req.body;
        const { id } = req.params;
        console.log(req.body);
        const updateQuery = `Update request set
        product_id = '${productId}',
        price = '${price}',
        quantity = '${quantity}',
        measure = '${measure}',
        description = '${desc}',
        expired_date = '${expiredDate}',
        product_specific_name = '${productName}',
        address_id = '${address}',
        fee = ${fee}
        where id like '${id}'
    `;
        console.log(updateQuery);
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
        const updateQuery = `Update request set is_confirm = '${isConfirmed}' where id like '${id}'`;
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
        const updateQuery = `Update request set status = '${status}' where id like '${id}'`;
        console.log(req.body);
        connection.query(updateQuery, (err, result) => {
            if (result) {
                return res.status(POST_SUCCESS.status).json({ success: true, message: POST_SUCCESS.message });
            }
            return res.status(SERVER_ERROR.status).json({ success: false, message: SERVER_ERROR.message });
        });
    });

    return router;
};
