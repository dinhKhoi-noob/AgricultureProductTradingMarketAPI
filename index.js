const express = require("express");
const passport = require("passport");
const cors = require("cors");
const http = require("http");
const userRoute = require("./src/controller/user");
const uploadRoute = require("./src/controller/upload");
const categoryRoute = require("./src/controller/productCategory");
const productRoute = require("./src/controller/product");
const businessProductTypeRoute = require("./src/controller/businessProductType");
const buyingRequestRoute = require("./src/controller/buyingRequest");
const imageRoute = require("./src/controller/image");
const migrateRoute = require("./src/model/migration");
const droppingRoute = require("./src/model/dropping");
const app = express();

const { PORT } = process.env;
const server = http.createServer(app);

const corsOption = {
    origin: [`http://localhost:3000`, "https://agriculture-product-trading-market-ui.vercel.app"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOption));
require("dotenv").config();
const io = require("socket.io")(server, {
    cors: corsOption,
});

io.use((socket, next) => {
    const uid = socket.handshake.auth.uid;
    if (uid) {
        socket.uid = uid;
        next();
    }
});

io.on("connection", socket => {
    const users = [];
    for (let [id, socket] of io.of("/").sockets) {
        users.push({ uid: socket.uid, socketId: id });
    }
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
});

app.get("/", (req, res) => {
    res.send("Hello world hihi");
});

app.set("view engine", "ejs");
app.use(express.json());
app.use(passport.initialize());
app.use("/api/db", migrateRoute);
app.use("/api/dropdb", droppingRoute);
app.use("/api/user", userRoute);
app.use("/api/upload", uploadRoute);
app.use("/api/category", categoryRoute);
app.use("/api/product", productRoute);
app.use("/api/business_product_type", businessProductTypeRoute);
app.use("/api/buying_request", buyingRequestRoute);
app.use("/api/image", imageRoute);
app.get("/test", (req, res) => {
    res.json({ success: true, message: "Test successfully" });
});
server.listen(PORT, () => {
    console.log(`listening on port ${PORT}\nhttp://localhost:${PORT}`);
});
