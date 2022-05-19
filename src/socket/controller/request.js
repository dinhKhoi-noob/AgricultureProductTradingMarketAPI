const connection = require("../../model/connection");
const randomString = require("randomstring");
const jsonResponse = require("../../constant/jsonResponse");
const { SERVER_ERROR, NOT_FOUND, BAD_REQUEST, POST_SUCCESS, GET_SUCCESS } = jsonResponse;
module.exports = (socket, io) => {
    const postNewRequest = (uid, data) => {
        const { productId, price, quantity, measure, desc, expiredDate, productName, address, type } = data;
        if (
            !uid ||
            uid === "" ||
            !productId ||
            productId === "" ||
            !price ||
            price === 0 ||
            !quantity ||
            quantity === 0 ||
            !measure ||
            measure === "" ||
            !desc ||
            desc === "" ||
            !expiredDate ||
            productName === "" ||
            !productName ||
            address === "" ||
            !address
        ) {
            io.to(uid).emit("request:post_status", {
                status: BAD_REQUEST.status,
                message: "Vui lòng nhập đầy đủ thông tin cần thiết !",
            });
            return;
        }
        connection.query(`Select id from user where id like '${uid}'`, (err, result) => {
            if (err) {
                io.to(uid).emit("request:post_status", {
                    status: NOT_FOUND.status,
                    message: "Không tìm thấy người dùng !",
                });
                return;
            }
        });
        const insertQuery = `Insert into request (id, created_by, product_id, price, quantity, measure, description, expired_date,product_specific_name,address_id,transaction_type)
    values ('${id}','${uid}','${productId}','${price}','${quantity}','${measure}','${desc}','${expiredDate}','${productName}','${address}','${type}')`;
        connection.query(insertQuery, (err, result) => {
            if (err) {
                console.log(err);
                io.to(uid).emit("request:post_status", { status: SERVER_ERROR.status, message: SERVER_ERROR.message });
                return;
            }
            connection.query(`Select * from request_view order by created_date desc`, (err, result) => {
                if (err) {
                    console.log(err);
                    return;
                }
                socket.to("manager").emit("request:get", result);
            });
            socket.to("manager").emit("request:post_status", {
                status: POST_SUCCESS.status,
                message: `Có một yêu cầu ${type === "selling" ? "bán" : "mua"} mới !`,
            });
            io.to(uid).emit("request:post_status", {
                status: SERVER_ERROR.status,
                message: "Đã thêm yêu cầu thành công, vui lòng đợi người quản lý phê duyệt !",
            });
        });
    };

    const testLoadTodo = () => {
        connection.query(`Select * from todo`, (err, result) => {
            if (err) {
                console.log(err);
                return;
            }
            socket.emit("test:get", result);
        });
    };

    const testPostTodo = (username, todo, uid, to) => {
        console.log(username, todo, uid, to);
        const id = randomString.generate(10);
        connection.query(
            `Insert into todo(id,username,todo) values('${id}','${username}','${todo}')`,
            (err, result) => {
                if (err) {
                    console.log(err);
                    io.to(uid).emit("test:post_status", {
                        success: false,
                        message: "Internal server error",
                        status: 500,
                    });
                    return;
                }
                connection.query(`Select * from todo`, (err, result) => {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    io.to(uid).emit("test:get", result);
                    io.to(uid).emit("test:post_status", {
                        success: true,
                        message: "You just post new todo",
                        status: 201,
                    });
                    io.to(to).emit("test:get", result);
                    socket.to("manager").emit("test:post_status", {
                        success: true,
                        message: "User has post new todo !",
                        status: 201,
                    });
                    io.to(to).emit("test:post_status", {
                        success: true,
                        message: "You have a notification !",
                        status: 201,
                    });
                });
            }
        );
    };

    return { postNewRequest, testLoadTodo, testPostTodo };
};
