const jsonResponse = require("../constant/jsonResponse");
const connection = require("../model/connection");

const checkRequestRef = (req, res, next) => {
    const { BAD_REQUEST } = jsonResponse;
    const { id } = req.params;
    const { images } = req.body;
    if (!id || !images || id === "" || images.length === 0) {
        return res.status(BAD_REQUEST.status).json({ success: false, message: BAD_REQUEST.message });
    }
    next();
};

module.exports = { checkRequestRef };
