const connection = require("../../model/connection");
const randomString = require("randomstring");
module.exports = (io, socket) => {
    const joinRoom = roomId => {
        socket.join(roomId);
    };

    const newMessage = (roomId, message, files, sendBy) => {
        const messageId = randomString.generate(10);
        connection.query(
            `Insert into message(id,room_id,sent_by,content) values('${messageId}','${roomId}','${sendBy}',"${message}")`,
            (err, result) => {
                if (err) {
                    console.log(err);
                    io.to(sendBy).emit("newMessage:error", {
                        content: "Gửi tin nhắn không thành công, thử lại sau",
                        success: false,
                    });
                    return;
                }
                if (files && files.length > 0) {
                    const flag = true;
                    for (let i = 0; i < files.length && flag; i++) {
                        const messageFileId = randomString.generate(10);
                        connection.query(
                            `insert into message_file(id,message_id,url) values('${messageFileId}','${messageId}','${files[i]}')`,
                            (err, result) => {
                                if (err) {
                                    console.log(err);
                                    flag = false;
                                }
                            }
                        );
                    }
                    if (!flag) {
                        io.to(sendBy).emit("newMessage:error", {
                            content: "Gửi tin nhắn không thành công, thử lại sau",
                            success: false,
                        });
                    }
                    socket
                        .to(roomId)
                        .emit("newMessage:success", { message: message, uid: sendBy, id: messageId, files });
                    return;
                }
                socket.to(roomId).emit("newMessage:success", { message, uid: sendBy, id: messageId, files: [] });
            }
        );
    };

    const loadMessages = (roomId, userId) => {
        console.log(`Message loaded by ${userId}`);
        connection.query(
            `Select * from message where room_id like '${roomId}' order by date_created asc`,
            (err, result) => {
                if (err) {
                    console.log(err);
                    io.to(userId).emit("loadMessages:failed", {
                        content: "Tải tin nhắn không thành công!",
                        success: false,
                        messages: [],
                    });
                    return;
                }
                let transitoryResult = [];
                connection.query(`Select * from message_file`, (err, images) => {
                    if (err) {
                        console.log(err);
                        io.to(userId).emit("loadMessages:failed", {
                            content: "Tải tin nhắn không thành công!",
                            success: false,
                            messages: [],
                        });
                    }
                    for (let i = 0; i < result.length; i++) {
                        transitoryResult.push({
                            id: result[i].id,
                            room_id: result[i].room_id,
                            sent_by: result[i].sent_by,
                            content: result[i].content,
                            date_created: result[i].date_created,
                            files:
                                images.length > 0
                                    ? images.filter(image => image.message_id === result[i].id).map(file => file.url)
                                    : [],
                        });
                    }
                    io.in(roomId).emit("loadMessages:success", transitoryResult);
                });
            }
        );
    };

    return { joinRoom, newMessage, loadMessages };
};
