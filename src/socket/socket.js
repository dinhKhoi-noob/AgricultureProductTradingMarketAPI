const connection = require("../model/connection");
module.exports = (io, app) => {
    io.use((socket, next) => {
        const uid = socket.handshake.auth.uid;
        if (uid) {
            socket.uid = uid;
            socket.id = uid;
            next();
        }
    });
    io.on("connection", socket => {
        const requestRoute = require("./controller/request")(socket, io);
        const notificationRoute = require("./controller/notification")(io, socket);
        const chatRoute = require("./controller/chat")(io, socket);
        const users = [];
        for (let [id, socket] of io.of("/").sockets) {
            users.push({ uid: socket.uid, socketId: id });
        }
        console.log(users);
        app.use("/api/request", require("../controller/request")(io, socket));
        app.use("/api/test", require("../controller/test")(io, socket));
        socket.on("joinroom", ({ role }) => {
            socket.join(role);
        });
        socket.emit("users", users);
        socket.broadcast.emit("user connected", {
            socketId: socket.id,
            uid: socket.uid,
        });
        socket.on("private message", ({ content, to }) => {
            socket.to(to).emit("private message", {
                content,
                from: socket.id,
            });
        });
        socket.on("test:load", () => {
            requestRoute.testLoadTodo();
        });
        socket.on("test:post", ({ todo, username, uid, to }) => {
            requestRoute.testPostTodo(username, todo, uid, to);
        });
        socket.on("request:post", ({ uid, data }) => {
            requestRoute.postNewRequest(uid, data);
        });
        socket.on("notification:create:newRequest", ({ user, data }) => {
            notificationRoute.createNewRequest(user, data);
        });
        socket.on("notification:get:all", () => {
            notificationRoute.loadNotifications();
        });
        socket.on("join:discuss", ({ roomId, firstUser, secondUser, userId }) => {
            socket.join(roomId);
            console.log(`user ${userId}  has been joined room ${roomId}`);
            connection.query(`Select * from chat_room where id like '${roomId}'`, (err, result) => {
                if (err) {
                    console.log(err);
                    socket
                        .to(roomId)
                        .emit("createRoom:error", { message: "Tạo phòng không thành công !", success: false });
                }
                if (result && result.length < 1) {
                    connection.query(
                        `Insert into chat_room(id,first_user,second_user) values ('${roomId}','${firstUser}','${secondUser}')`,
                        (err, result) => {
                            if (err) {
                                console.log(err);
                                socket.to(roomId).emit("createRoom:error", {
                                    message: "Tạo phòng không thành công !",
                                    success: false,
                                });
                                return;
                            }
                        }
                    );
                }
            });
        });
        socket.on("leave:disuss", roomId => {
            console.log(`user has been leave room`);
            socket.leave(roomId);
        });
        socket.on("messages:load", ({ roomId, userId }) => {
            chatRoute.loadMessages(roomId, userId);
        });
        socket.on("newMessage:post", ({ roomId, message, files, sendBy }) => {
            chatRoute.newMessage(roomId, message, files, sendBy);
        });
    });
};
