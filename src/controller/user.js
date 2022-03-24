require("dotenv").config();
require("../middleware/passport");
const router = require("express").Router();
const jsonResponse = require("../constant/jsonResponse");
const {
    nullCheckForRegisteration,
    nullCheckForLogin,
    nullCheckForAdditionalInformation,
    existedUser,
    isCorrectPassword,
} = require("../middleware/user");
const connection = require("../model/connection");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const { ACCESS_TOKEN_SECRET } = process.env;

const registerToken = id => {
    return jwt.sign(
        {
            userId: id,
            iat: new Date().getTime(),
            exp: new Date().setDate(new Date().getDate() + 3),
        },
        ACCESS_TOKEN_SECRET
    );
};

router.get("/:uid", (req, res) => {
    const { GET_SUCCESS, SERVER_ERROR, NOT_FOUND } = jsonResponse;
    const uid = req.params.uid;
    connection.query(`Select * from user_view where id = '${uid}' and is_active = '0'`, (err, result) => {
        if (result && result.length > 0) {
            return res
                .status(GET_SUCCESS.status)
                .json({ success: true, message: GET_SUCCESS.message, result: result[0] });
        }
        if (result && result.length < 1) {
            return res.status(NOT_FOUND.status).json({ success: false, message: NOT_FOUND.message });
        }
        if (err) {
            return res.status(SERVER_ERROR.status).json({ success: false, message: SERVER_ERROR.message });
        }
    });
});

router.post("/register", nullCheckForRegisteration, existedUser, async (req, res) => {
    const { POST_SUCCESS, SERVER_ERROR } = jsonResponse;
    try {
        const { username, password, address, email, phone } = req.body;
        const bcrypt = require("bcryptjs");
        const randomString = require("randomstring");

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const id = randomString.generate(10);
        const registerQueryString = `Insert into user(id, username, password, role_id, is_logged_in, login_method, email, address, phone) 
            values('${id}', '${username}','${hashedPassword}','1234567890', 0, 'default','${email}','${address}','${phone}')`;
        connection.query(registerQueryString, (err, result) => {
            if (result) {
                const token = registerToken(id);
                return res
                    .status(POST_SUCCESS.status)
                    .json({ success: true, message: POST_SUCCESS.message, uid: id, token });
            }
            if (err) {
                return res
                    .status(SERVER_ERROR.status)
                    .json({ success: false, message: "Lỗi hệ thống", uid: id, token });
            }
        });
    } catch (error) {
        return res.status(SERVER_ERROR.status).json({ success: false, message: SERVER_ERROR.message });
    }
});

router.post("/login", nullCheckForLogin, (req, res) => {
    const bcrypt = require("bcryptjs");
    const { GET_SUCCESS, SERVER_ERROR, NOT_FOUND, BAD_REQUEST } = jsonResponse;
    const { username, password } = req.body;
    try {
        const selectQueryString = `Select id, username, email, password, phone, address from user 
            where username like '${username}'`;
        connection.query(selectQueryString, async (err, result) => {
            if (result && result.length > 0) {
                const isValidPassword = await bcrypt.compare(password, result[0].password);
                if (isValidPassword) {
                    const token = registerToken(result[0].id);
                    return res
                        .status(GET_SUCCESS.status)
                        .json({ success: true, message: GET_SUCCESS.message, token, uid: result[0].id });
                }
                return res.status(BAD_REQUEST.status).json({ success: false, message: BAD_REQUEST.message });
            }
            return res.status(NOT_FOUND.status).json({ success: false, message: NOT_FOUND.message });
        });
    } catch (error) {
        return res.status(SERVER_ERROR.status).json({ success: false, message: SERVER_ERROR.message });
    }
});

router.get(
    "/google/callback",
    passport.authenticate("google", { failureRedirect: "/api/user/page/google" }),
    (req, res) => {
        const user = req.user;
        const selectQuery = `Select login_method, id from user where email like '${user._json.email}'`;
        const changeLoginStatusQuery = `Update user set is_logged_in = 0 where id like '${user.id}'`;
        const registerUserQuery = `Insert into user(id, username, is_logged_in, login_method, email, role_id) 
            values('${user.id}', '${user._json.given_name}', 0, 'google', '${user._json.email}','1234567890')`;
        try {
            connection.query(selectQuery, (err, result) => {
                if (result && result.length > 0) {
                    if (result[0].login_method !== "google") {
                        return res.redirect(`/api/user/page/verify?err=${result[0].login_method}`);
                    }
                    connection.query(changeLoginStatusQuery);
                    const token = registerToken(result[0].id);
                    return res.redirect(`/api/user/page/verify?token=${token}`);
                }
                connection.query(registerUserQuery);
                const token = registerToken(user.id);
                return res.redirect(`/api/user/page/verify?token=${token}`);
            });
        } catch (error) {
            console.log(error);
            return res.redirect(`/api/user/page/google`);
        }
    }
);

router.get(
    "/facebook/callback",
    passport.authenticate("facebook", { failureRedirect: "/api/user/page/facebook" }),
    (req, res) => {
        const user = req.user;
        const selectQuery = `Select login_method, address, phone from user where email like '${user._json.email}'`;
        const changeLoginStatusQuery = `Update user set is_logged_in = 0 where id like '${user.id}'`;
        const registerUserQuery = `Insert into user(id, username, is_logged_in, login_method, email, role_id) 
            values('${user.id}', '${user._json.name}', 0, 'facebook', '${user._json.email}', '1234567890')`;
        try {
            connection.query(selectQuery, (err, result) => {
                if (result && result.length > 0) {
                    if (result[0].login_method !== "facebook") {
                        return res.redirect(`/api/user/page/verify?err=${result[0].login_method}`);
                    }
                    if (result[0].address === "" || !result[0].address || result[0].phone === "" || !result[0].phone) {
                        return res.redirect(`api/user/page/verify`);
                    }
                    connection.query(changeLoginStatusQuery);
                    const token = registerToken(result[0].id);
                    return res.redirect(`/api/user/page/verify?token=${token}`);
                }
                connection.query(registerUserQuery);
                const token = registerToken(user.id);
                return res.redirect(`/api/user/page/verify?token=${token}`);
            });
        } catch (error) {
            return res.redirect(`/api/user/page/facebook`);
        }
    }
);

router.patch("/additional/:uid", nullCheckForAdditionalInformation, (req, res) => {
    const uid = req.params.uid;
    const { POST_SUCCESS, SERVER_ERROR } = jsonResponse;
    const { phone, address, filePath } = req.body;
    const updateQuery = `Update user set address = '${address}',
                        phone = '${phone}' ${filePath ? `, avatar= '${filePath}'` : ""} where id='${uid}'`;
    connection.query(updateQuery, (err, result) => {
        if (result) {
            return res.status(POST_SUCCESS.status).json({ success: true, message: POST_SUCCESS.message });
        }
        console.log(err);
        return res.status(SERVER_ERROR.status).json({ success: false, message: SERVER_ERROR.message });
    });
});

router.patch("/password/:uid", isCorrectPassword, async (req, res) => {
    const uid = req.params.uid;
    const { password } = req.body;
    const { POST_SUCCESS, SERVER_ERROR } = jsonResponse;
    const bcrypt = require("bcryptjs");
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const updateQuery = `Update user set ` + "`password`" + ` = '${hashedPassword}' where id like '${uid}'`;
    connection.query(updateQuery, (err, result) => {
        if (result) {
            return res.status(POST_SUCCESS.status).json({ success: true, message: POST_SUCCESS.message });
        }
        return res.status(SERVER_ERROR.status).json({ success: false, message: SERVER_ERROR.message });
    });
});

router.post("/verify", passport.authenticate("jwt", { session: false }), (req, res) => {
    const { GET_SUCCESS, UNAUTHORIZED } = jsonResponse;
    if (req.user) {
        return res.status(GET_SUCCESS.status).json({ success: true, message: GET_SUCCESS.message, id: req.user.id });
    }
    return res.status(UNAUTHORIZED.status).json({ success: false, message: UNAUTHORIZED.message });
});

router.get("/page/verify", (req, res) => {
    res.render("googleRedirect.ejs");
});

router.get("/page/google", passport.authenticate("google", { scope: ["email", "profile"], session: false }));

router.get(
    "/page/facebook",
    passport.authenticate("facebook", { authType: "reauthenticate", scope: ["email", "user_location"] })
);

module.exports = router;
