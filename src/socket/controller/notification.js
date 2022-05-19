const connection = require("../../model/connection");
const randomString = require("randomstring");

module.exports = (io, socket) => {
    const createNewRequest = (user, data) => {
        const { username, id } = user;
        const { content, requestId } = data;
        const notificationId = randomString.generate(10);
        const insertQuery = `Insert into notification(id,create_by,content) values('${notificationId}','${id}','${content}')`;
        connection.query(insertQuery, (err, result) => {
            if (err) {
                console.error(err);
                io.to(id).emit("notification:newrequest", {
                    content: `Có lỗi xảy ra khi thêm thông báo !!`,
                    status: 500,
                });
                return;
            }
            socket.to("manager").emit("notification:newrequest", {
                content: `Người dùng ${username} vừa tạo môt yêu cầu mới !`,
            });
        });
    };

    const loadNotifications = () => {
        connection.query(`Select * from notifications`, (err, result) => {
            if (err) {
                console.log(err);
                return;
            }
            socket.emit("notification:get:all", { content: result, status: 201 });
        });
    };
    return { createNewRequest, loadNotifications };
};
