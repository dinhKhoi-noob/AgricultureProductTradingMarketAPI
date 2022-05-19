const router = require("express").Router();
const connection = require("../model/connection");
const jsonResponse = require("../constant/jsonResponse");
const randomString = require("randomstring");
const { checkRequestRef } = require("../middleware/image");

router.get("/request", (req, res) => {
    const { GET_SUCCESS, NOT_FOUND, SERVER_ERROR } = jsonResponse;
    const { type } = req.query;
    const selectQuery = `Select * from request_image_view where is_active=0 ${
        type === "selling" ? ` and transaction_type like 'selling'` : ` and transaction_type like 'buying'`
    };`;
    console.log(selectQuery);
    connection.query(selectQuery, (err, result) => {
        if (result && result.length > 0) {
            return res.status(GET_SUCCESS.status).json({ success: true, message: GET_SUCCESS.message, result });
        }
        if (result && result.length === 0) {
            return res.status(NOT_FOUND.status).json({ success: false, message: NOT_FOUND.message });
        }
        return res.status(SERVER_ERROR.status).json({ success: false, message: SERVER_ERROR.message });
    });
});

router.get("/subrequest", (req, res) => {
    const { GET_SUCCESS, NOT_FOUND, SERVER_ERROR } = jsonResponse;
    const { type } = req.query;
    const selectQuery = `Select * from request_for_another_request_image_view where is_active=0 ${
        type === "selling" ? ` and transaction_type like 'selling'` : ` and transaction_type like 'selling'`
    };`;
    connection.query(selectQuery, (err, result) => {
        if (result && result.length > 0) {
            return res.status(GET_SUCCESS.status).json({ success: true, message: GET_SUCCESS.message, result });
        }
        if (result && result.length === 0) {
            return res.status(NOT_FOUND.status).json({ success: false, message: NOT_FOUND.message });
        }
        console.log(err);
        return res.status(SERVER_ERROR.status).json({ success: false, message: SERVER_ERROR.message });
    });
});

router.get("/request/:id", (req, res) => {
    const { GET_SUCCESS, NOT_FOUND, SERVER_ERROR } = jsonResponse;
    const { id } = req.params;
    const selectQuery = `Select * from request_image_view where request_id like '${id}' and is_active=0`;
    console.log(selectQuery);
    connection.query(selectQuery, (err, result) => {
        if (result && result.length > 0) {
            return res.status(GET_SUCCESS.status).json({ success: true, message: GET_SUCCESS.message, result });
        }
        if (result && result.length === 0) {
            return res.status(NOT_FOUND.status).json({ success: false, message: NOT_FOUND.message });
        }
        console.log(err);
        return res.status(SERVER_ERROR.status).json({ success: false, message: SERVER_ERROR.message });
    });
});

router.get("/subrequest/:id", (req, res) => {
    const { GET_SUCCESS, NOT_FOUND, SERVER_ERROR } = jsonResponse;
    const { id } = req.params;
    const selectQuery = `Select * from request_for_another_request_image_view where request_id like '${id}' and is_active=0`;
    connection.query(selectQuery, (err, result) => {
        if (result && result.length > 0) {
            return res.status(GET_SUCCESS.status).json({ success: true, message: GET_SUCCESS.message, result });
        }
        if (result && result.length === 0) {
            return res.status(NOT_FOUND.status).json({ success: false, message: NOT_FOUND.message });
        }
        console.log(err);
        return res.status(SERVER_ERROR.status).json({ success: false, message: SERVER_ERROR.message });
    });
});

router.post("/request/:id", checkRequestRef, (req, res) => {
    const { POST_SUCCESS, SERVER_ERROR } = jsonResponse;
    const { images, type } = req.body;
    const { id } = req.params;
    let flag = true;
    for (let i = 0; i < images.length && flag; i++) {
        const imageId = randomString.generate(10);
        connection.query(`Insert into image(id,url) values('${imageId}','${images[i]}')`, (err, result) => {
            if (err) {
                flag = false;
            }
            const imageRefId = randomString.generate(10);
            connection.query(
                `Insert into request_image (id,image_id,request_id,transaction_type) values('${imageRefId}','${imageId}','${id}','${type}')`,
                (err, result) => {
                    if (err) {
                        console.log(err);
                        flag = false;
                    }
                }
            );
        });
    }
    if (!flag) {
        return res.status(SERVER_ERROR.status).json({ success: false, message: SERVER_ERROR.message });
    }
    return res.status(POST_SUCCESS.status).json({ success: true, message: POST_SUCCESS.message });
});

router.patch("/request/:id", (req, res) => {
    const { POST_SUCCESS, SERVER_ERROR } = jsonResponse;
    const { id } = req.params;
    const { images, type, isSubrequest } = req.body;
    const table = isSubrequest ? "request_for_another_request_image" : "request_image";
    let flag = true;
    const updateQuery = `Update ${table} set is_active = 1 where request_id like '${id}'`;
    connection.query(updateQuery, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(SERVER_ERROR.status).json({ success: false, message: SERVER_ERROR.message });
        }
        for (let i = 0; i < images.length && flag; i++) {
            const imageId = randomString.generate(10);
            console.log(`Insert into image(id,url) values('${imageId}','${images[i]}')`);
            connection.query(`Insert into image(id,url) values('${imageId}','${images[i]}')`, (err, result) => {
                if (err) {
                    console.log(err);
                    flag = false;
                }
                const imageRefId = randomString.generate(10);
                console.log(
                    `Insert into ${table} (id,image_id,request_id,transaction_type) values('${imageRefId}','${imageId}','${id}','${type}')`
                );
                connection.query(
                    `Insert into ${table} (id,image_id,request_id,transaction_type) values('${imageRefId}','${imageId}','${id}','${type}')`,
                    (err, result) => {
                        if (err) {
                            console.log(err);
                            flag = false;
                        }
                    }
                );
            });
        }
        if (!flag) {
            return res.status(SERVER_ERROR.status).json({ success: false, message: SERVER_ERROR.message });
        }
        return res.status(POST_SUCCESS.status).json({ success: true, message: POST_SUCCESS.message });
    });
});

router.post("/subrequest/:id", checkRequestRef, (req, res) => {
    const { POST_SUCCESS, SERVER_ERROR } = jsonResponse;
    const { images, type } = req.body;
    const { id } = req.params;
    let flag = true;
    for (let i = 0; i < images.length && flag; i++) {
        const imageId = randomString.generate(10);
        connection.query(`Insert into image(id,url) values('${imageId}','${images[i]}')`, (err, result) => {
            if (err) {
                flag = false;
            }
            const imageRefId = randomString.generate(10);
            connection.query(
                `Insert into request_for_another_request_image (id,image_id,request_id,transaction_type) values('${imageRefId}','${imageId}','${id}','${type}')`,
                (err, result) => {
                    if (err) {
                        console.log(err);
                        flag = false;
                    }
                }
            );
        });
    }
    if (!flag) {
        return res.status(SERVER_ERROR.status).json({ success: false, message: SERVER_ERROR.message });
    }
    return res.status(POST_SUCCESS.status).json({ success: true, message: POST_SUCCESS.message });
});

router.delete("/request/:id", (req, res) => {
    const { POST_SUCCESS, SERVER_ERROR } = jsonResponse;
    const { id } = req.params;
    const deleteQuery = `DELETE FROM request_image WHERE request_id like '${id}'`;
    connection.query(deleteQuery, (err, result) => {
        if (result) {
            return res.status(POST_SUCCESS.status).json({ success: true, message: POST_SUCCESS.message });
        }
        return res.status(SERVER_ERROR.status).json({ success: false, message: SERVER_ERROR.message });
    });
});

module.exports = router;
