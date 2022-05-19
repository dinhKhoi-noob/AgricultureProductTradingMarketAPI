const router = require("express").Router();
const connection = require("../model/connection");
const jsonResponse = require("../constant/jsonResponse");
const randomString = require("randomstring");
const { checkPostRequest } = require("../middleware/request");

module.exports = (io, socket) => {
    const { POST_SUCCESS } = jsonResponse;
    router.post("/", (req, res) => {
        const { todo, username } = req.body;
        const id = randomString.generate(10);
        connection.query(
            `Insert into todo(id,todo,username) value ('${id}','${todo}','${username}')`,
            (err, result) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ success: false });
                }
                socket.to("manager").emit("request:post_status", {
                    status: POST_SUCCESS.status,
                    message: `Test successfully!`,
                    success: true,
                });
                socket.emit("test:get", { todo, username });
                return res.status(201).json({ success: true });
            }
        );
    });
    return router;
};
