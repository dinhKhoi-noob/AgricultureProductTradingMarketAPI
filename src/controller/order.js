const router = require("express").Router();
const connection = require("../model/connection");
const jsonResponse = require("../constant/jsonResponse");
const { checkOrderRefId } = require("../middleware/order");

router.get("/", (req, res) => {
    const { load_history } = req.query;
    const { GET_SUCCESS, SERVER_ERROR, NOT_FOUND } = jsonResponse;
    const selectQuery = `Select * from request_order_view WHERE 1 ${
        load_history ? "" : "and now() between now() and expired_date"
    }`;
    connection.query(selectQuery, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(SERVER_ERROR.status).json({ success: false, message: SERVER_ERROR.message });
        }
        if (result && result.length > 0) {
            return res.status(GET_SUCCESS.status).json({ success: true, message: GET_SUCCESS.message, result });
        }
        return res.status(NOT_FOUND.status).json({ success: false, message: NOT_FOUND.message });
    });
});

router.get("/root/:id", (req, res) => {
    const id = req.params.id;
    const { type } = req.query;
    const { GET_SUCCESS, SERVER_ERROR, NOT_FOUND } = jsonResponse;
    const selectQuery = `Select * from request_order_view where request_id like '${id}'`;
    connection.query(selectQuery, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(SERVER_ERROR.status).json({ success: false, message: SERVER_ERROR.message });
        }
        if (result && result.length === 0) {
            return res.status(NOT_FOUND.status).json({ success: false, message: NOT_FOUND.message });
        }
        return res.status(GET_SUCCESS.status).json({ success: true, message: GET_SUCCESS.message, result });
    });
});

router.get("/specific/:id", (req, res) => {
    const id = req.params.id;
    const { GET_SUCCESS, NOT_FOUND, SERVER_ERROR } = jsonResponse;
    const selectQuery = `Select * from request_order_view where id like '${id}' or request_id like '${id}'`;
    connection.query(selectQuery, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(SERVER_ERROR.status).json({ success: false, message: SERVER_ERROR.message });
        }
        if (result && result.length === 0) {
            return res.status(NOT_FOUND.status).json({ success: false, message: NOT_FOUND.message });
        }
        return res.status(GET_SUCCESS.status).json({ success: true, message: GET_SUCCESS.message, result: result[0] });
    });
});

router.get("/:uid", (req, res) => {
    const { uid } = req.params;
    const { GET_SUCCESS, NOT_FOUND, SERVER_ERROR } = jsonResponse;
    const { date_begin, date_end, date_type, user_id_type } = req.query;
    let dateBegin = null;
    let dateEnd = null;
    if (date_begin && date_end) {
        dateBegin = new Date(date_begin).toISOString().slice(0, 19).replace("T", " ");
        dateEnd = new Date(date_end).toISOString().slice(0, 19).replace("T", " ");
    }
    const selectQuery = `Select * from request_order_view where 1 ${
        dateBegin && dateEnd ? `and ${date_type} between '${dateBegin}' and '${dateEnd}'` : ``
    } ${
        user_id_type
            ? user_id_type.trim() !== "customer"
                ? ``
                : `and ${user_id_type.trim()} like '${uid}'`
            : `and (subrequest_user like '${uid}' or request_user like '${uid}')`
    }`;
    console.log("-------------------------", selectQuery);
    connection.query(selectQuery, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(SERVER_ERROR.status).json({ success: false, message: SERVER_ERROR.message });
        }
        if (result && result.length === 0) {
            return res.status(NOT_FOUND.status).json({ success: false, message: NOT_FOUND.message });
        }
        return res.status(GET_SUCCESS.status).json({ success: true, message: GET_SUCCESS.message, result });
    });
});

router.patch("/root/status/:id", checkOrderRefId, (req, res) => {
    const { POST_SUCCESS, SERVER_ERROR, NOT_FOUND } = jsonResponse;
    const { id } = req.params;
    const { status, uid, type } = req.body;
    const updateQuery = `Update request_order set status = '${status}'where request_id like '${id}'`;
    let assignmentQuery = "Select*from request_order_view where 1";
    const assignmentQueries = [];
    const currentTimestamp = new Date(Date.now()).toISOString().slice(0, 19).replace("T", " ");
    connection.query(updateQuery, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(SERVER_ERROR.status).json({ success: false, message: SERVER_ERROR.message });
        }
        return connection.query(`Select * from order_assignment where request_id like '${id}'`, (err, result) => {
            if (err) {
                console.log(err);
                return res.status(SERVER_ERROR.status).json({ success: false, message: SERVER_ERROR.message });
            }
            if (result && result.length === 0) {
                return res.status(NOT_FOUND.status).json({ success: false, message: NOT_FOUND.message });
            }
            switch (status) {
                case "carrying_in":
                    if (type === "selling") {
                        assignmentQueries.push(`Update grabbing_assignment set 
                        assignee = '${uid}',
                        date_assigned='${currentTimestamp}'
                        where assignment_id like '${result[0].id}'`);
                    } else {
                        result.forEach();
                    }
                    break;
                case "carried_in":
                    assignmentQuery = `Update grabbing_assignment set 
                        date_completed='${currentTimestamp}'
                        where assignment_id like '${result[0].id}'`;
                    break;
                case "packaging":
                    assignmentQuery = `Update packaging_assignment set 
                        assignee = '${uid}',
                        date_assigned='${currentTimestamp}'
                        where assignment_id like '${result[0].id}'`;
                    break;
                case "packaged":
                    assignmentQuery = `Update packaging_assignment set 
                        date_completed='${currentTimestamp}'
                        where assignment_id like '${result[0].id}'`;
                    break;
                case "delivering":
                    assignmentQuery = `Update delivering_assignment set 
                        assignee = '${uid}',
                        date_assigned='${currentTimestamp}'
                        where assignment_id like '${result[0].id}'`;
                    break;
                case "success":
                    assignmentQuery = `Update delivering_assignment set 
                        date_completed='${currentTimestamp}'
                        where assignment_id like '${result[0].id}'`;
                    break;
                case "confirmed":
                    assignmentQuery = `Update request_order set
                        date_confirmed = '${currentTimestamp}'
                        where id like '${id}'`;
                default:
                    break;
            }
            console.log(assignmentQuery);
            return connection.query(assignmentQuery, (err, result) => {
                if (err) {
                    console.log(err);
                    return res.status(SERVER_ERROR.status).json({ success: false, message: SERVER_ERROR.message });
                }
                return res.status(POST_SUCCESS.status).json({ success: true, message: POST_SUCCESS.message });
            });
        });
    });
});

router.patch("/status/:id", checkOrderRefId, (req, res) => {
    const { POST_SUCCESS, SERVER_ERROR, NOT_FOUND } = jsonResponse;
    const { id } = req.params;
    const { status, isRoot, uid } = req.body;
    const updateQuery = `Update request_order set status = '${status}' where ${
        isRoot ? "request_id" : "id"
    } like '${id}'`;
    const assignmentQueries = [];
    const currentTimestamp = new Date(Date.now()).toISOString().slice(0, 19).replace("T", " ");
    connection.query(updateQuery, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(SERVER_ERROR.status).json({ success: false, message: SERVER_ERROR.message });
        }
        console.log(`Select * from order_assignment where request_id like '${id}'`);
        return connection.query(
            `Select * from order_assignment where ${isRoot ? "request_id" : "order_id"} like '${id}'`,
            (err, result) => {
                if (err) {
                    console.log(err);
                    return res.status(SERVER_ERROR.status).json({ success: false, message: SERVER_ERROR.message });
                }
                if (result && result.length === 0) {
                    return res.status(NOT_FOUND.status).json({ success: false, message: NOT_FOUND.message });
                }
                switch (status) {
                    case "carrying_in":
                        result.forEach(item => {
                            assignmentQueries.push(
                                `Update grabbing_assignment set 
                                assignee = '${uid}',
                                date_assigned='${currentTimestamp}'
                                where assignment_id like '${item.id}'`
                            );
                        });
                        break;
                    case "carried_in":
                        result.forEach(item => {
                            assignmentQueries.push(`Update grabbing_assignment set 
                            date_completed='${currentTimestamp}'
                            where assignment_id like '${item.id}'`);
                        });
                        break;
                    case "packaging":
                        result.forEach(item => {
                            assignmentQueries.push(`Update packaging_assignment set 
                            assignee = '${uid}',
                            date_assigned='${currentTimestamp}'
                            where assignment_id like '${item.id}'`);
                        });
                        break;
                    case "packaged":
                        result.forEach(item => {
                            assignmentQueries.push(`Update packaging_assignment set 
                            date_completed='${currentTimestamp}'
                            where assignment_id like '${item.id}'`);
                        });
                        break;
                    case "delivering":
                        result.forEach(item => {
                            assignmentQueries.push(`Update delivering_assignment set 
                            assignee = '${uid}',
                            date_assigned='${currentTimestamp}'
                            where assignment_id like '${item.id}'`);
                        });
                        break;
                    case "success":
                        result.forEach(item => {
                            assignmentQueries.push(`Update delivering_assignment set 
                            date_completed='${currentTimestamp}'
                            where assignment_id like '${item.id}'`);
                        });
                    case "confirmed":
                        assignmentQueries.push(`Update request_order set
                            date_confirmed = '${currentTimestamp}'
                            where id like '${id}' or request_id like '${id}'`);

                    default:
                        break;
                }
                console.log(assignmentQueries);
                let flag = true;
                for (let i = 0; i < assignmentQueries.length && flag; i++) {
                    connection.query(assignmentQueries[i], (err, result) => {
                        if (err) {
                            console.log(err);
                            flag = false;
                        }
                    });
                }
                if (!flag) {
                    return res.status(SERVER_ERROR.status).json({ success: false, message: SERVER_ERROR.message });
                }
                return res.status(POST_SUCCESS.status).json({ success: true, message: POST_SUCCESS.message });
            }
        );
    });
});

module.exports = router;
