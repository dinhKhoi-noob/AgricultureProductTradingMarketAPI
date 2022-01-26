const s3 = require('../../s3');
const multer = require('multer');
const multerS3 = require('multer-s3');
const connection = require('../model/connection');

const uploadFile = (url) => {
    try {
        connection.query(`insert into test(id, url) values ('1234567890','${url}')`);
        return res
    } catch (error) {
        
    }
}