const jsonResponse = require("../constant/jsonResponse");
const connection = require("../model/connection");

const checkBuyingRequestRef = (req, res, next) => {
    const { SERVER_ERROR, BAD_REQUEST, NOT_FOUND } = jsonResponse;
    const { id } = req.params;
    const { images } = req.body;
    if (!id || !images || id === "" || images.length === 0) {
        return res.status(BAD_REQUEST.status).json({ success: false, message: BAD_REQUEST.message });
    }
    next();
};

module.exports = { checkBuyingRequestRef };
