const router = require("express").Router();
const connection = require("../model/connection");
const jsonResponse = require("../constant/jsonResponse");
const randomString = require("randomstring");
const { checkBuyingRequestRef } = require("../middleware/image");

router.get("/buying_request", (req, res) => {
    const { GET_SUCCESS, NOT_FOUND, SERVER_ERROR } = jsonResponse;
    const selectQuery = `Select * from buying_request_image_view;`;
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

router.get("/buying_request/:id", (req, res) => {
    const { GET_SUCCESS, NOT_FOUND, SERVER_ERROR } = jsonResponse;
    const { id } = req.params;
    const selectQuery = `Select * from buying_request_image_view where request_id like '${id}'`;
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

router.post("/buying_request/:id", checkBuyingRequestRef, (req, res) => {
    const { POST_SUCCESS, SERVER_ERROR } = jsonResponse;
    const { images } = req.body;
    const { id } = req.params;
    let flag = true;
    for (let i = 0; i < images.length && flag; i++) {
        const imageId = randomString.generate(10);
        console.log(`image: Insert into image(id,url) values('${imageId}','${images[i]}')`);
        connection.query(`Insert into image(id,url) values('${imageId}','${images[i]}')`, (err, result) => {
            if (err) {
                flag = false;
            }
            const imageRefId = randomString.generate(10);
            console.log(
                `Ref: Insert into buying_request_image(id,image_id,request_id) values('${imageRefId}','${imageId}','${id}')`
            );
            connection.query(
                `Insert into buying_request_image(id,image_id,request_id) values('${imageRefId}','${imageId}','${id}')`,
                (err, result) => {
                    if (err) {
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

router.delete("/buying_request/:id", (req, res) => {
    const { POST_SUCCESS, SERVER_ERROR } = jsonResponse;
    const { id } = req.params;
    const deleteQuery = `DELETE FROM buying_request_image WHERE request_id like '${id}'`;
    connection.query(deleteQuery, (err, result) => {
        if (result) {
            return res.status(POST_SUCCESS.status).json({ success: true, message: POST_SUCCESS.message });
        }
        return res.status(SERVER_ERROR.status).json({ success: false, message: SERVER_ERROR.message });
    });
});

module.exports = router;
