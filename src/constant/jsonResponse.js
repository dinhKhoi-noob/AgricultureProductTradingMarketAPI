const POST_SUCCESS = {
    status: 201,
    message: "OK",
};

const GET_SUCCESS = {
    status: 200,
    message: "Sucess",
};

const BAD_REQUEST = {
    status: 400,
    message: "Bad Request",
};

const UNAUTHORIZED = {
    status: 401,
    message: "Unauthorized",
};

const NOT_FOUND = {
    status: 404,
    message: "Not Found",
};

const SERVER_ERROR = {
    status: 500,
    message: "Internal server error",
};

module.exports = {
    GET_SUCCESS,
    POST_SUCCESS,
    BAD_REQUEST,
    NOT_FOUND,
    UNAUTHORIZED,
    SERVER_ERROR,
};
