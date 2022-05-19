const router = require("express").Router();
const connection = require("../model/connection");
const jsonResponse = require("../constant/jsonResponse");
const randomString = require("randomstring");

router.post("/", (req, res) => {
    const { SERVER_ERROR, POST_SUCCESS } = jsonResponse;
    const { productRatingList, serviceRating, uid, type } = req.body;
    const ratingId = randomString.generate(10);
    const serviceRatingId = randomString.generate(10);
    const insertRatingQuery = `Insert into rating(id,rate_by) values ('${ratingId}','${uid}')`;
    console.log(insertRatingQuery);
    return connection.query(insertRatingQuery, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(SERVER_ERROR.status).json({ success: false, message: SERVER_ERROR.message });
        }
        let flag = true;
        for (let i = 0; i < productRatingList.length && flag; i++) {
            const element = productRatingList[i];
            const { requestId, ratePoint, comment } = element;
            const productRatingId = randomString.generate(10);
            const insertProductRating = `Insert into product_rating(id,rating_id,subrequest_id,rating_point,comment) values ('${productRatingId}', '${ratingId}','${requestId}',${ratePoint},${
                comment ? `'${comment}'` : null
            })`;
            console.log(insertProductRating);
            connection.query(insertProductRating, (err, result) => {
                if (err) {
                    console.log(err);
                    flag = false;
                }
            });
            if (type === "root") {
                const id = randomString.generate(10);
                const insertServiceRating = `Insert into service_rating (id,rating_id,subrequest_id,rating_point,comment) values (
                    '${id}','${ratingId}','${productRatingList[i].requestId}',${serviceRating.ratePoint},${
                    serviceRating.comment ? `'${serviceRating.comment}'` : null
                }
                )`;
                console.log(insertServiceRating);
                connection.query(insertServiceRating, (err, result) => {
                    if (err) {
                        console.log(err);
                        flag = false;
                    }
                });
            }
        }
        if (!flag) {
            return res.status(SERVER_ERROR.status).json({ success: false, message: SERVER_ERROR.message });
        }
        if (type !== "root") {
            const insertServiceRating = `Insert into service_rating (id,rating_id,subrequest_id,rating_point,comment) values ('${serviceRatingId}', '${ratingId}','${
                serviceRating.requestId
            }',${serviceRating.ratePoint},${serviceRating.comment ? `'${serviceRating.comment}'` : null})`;
            console.log("Hello:", insertServiceRating);
            return connection.query(insertServiceRating, (err, result) => {
                if (err) {
                    return res.status(SERVER_ERROR.status).json({ success: false, message: SERVER_ERROR.message });
                }
                return res.status(POST_SUCCESS.status).json({ success: true, message: POST_SUCCESS.message });
            });
        } else {
            return res.status(POST_SUCCESS.status).json({ success: true, message: POST_SUCCESS.message });
        }
    });
});

router.get("/:id/:filter_type", (req, res) => {
    const { SERVER_ERROR, NOT_FOUND, GET_SUCCESS } = jsonResponse;
    const { id, filter_type } = req.params;
    // for profile
    let selectProductRatingQuery = `Select * from product_rating_view where rate_for like '${id}' order by subrequest_id`;
    let selectServiceRatingQuery = `Select * from service_rating_view where grabbing_user_id like '${id}'
        or packaging_user_id like '${id}' or delivering_user_id like '${id}' order by subrequest_id`;
    if (filter_type === "request") {
        selectProductRatingQuery = `Select * from product_rating_view where request_id like '${id}'`;
        selectServiceRatingQuery = `Select * from service_rating_view where request_id like '${id}'`;
    }
    if (filter_type === "subrequest") {
        selectProductRatingQuery = `Select * from product_rating_view where subrequest_id like '${id}'`;
        selectServiceRatingQuery = `Select * from service_rating_view where subrequest_id like '${id}'`;
    }
    let resultList = [];
    console.log(selectProductRatingQuery, selectServiceRatingQuery);
    connection.query(selectProductRatingQuery, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(SERVER_ERROR.status).json({ success: false, message: SERVER_ERROR.message });
        }
        resultList = resultList.concat(result);
        connection.query(selectServiceRatingQuery, (err, result) => {
            if (err) {
                console.log(err);
                return res.status(SERVER_ERROR.status).json({ success: false, message: SERVER_ERROR.message });
            }
            resultList = resultList.concat(result);
            if (resultList.length === 0) {
                return res.status(NOT_FOUND.status).json({ success: false, message: NOT_FOUND.message });
            }
            return res
                .status(GET_SUCCESS.status)
                .json({ success: true, message: GET_SUCCESS.message, result: resultList });
        });
    });
});

module.exports = router;
