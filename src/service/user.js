const connection = require("../model/connection");

const testService = (req,res) => {
    connection.query(`select * from users`,(err,result)=>{
        if(result && result.length > 0){
            return res.json({success:true, users: result})
        }
        return res.status(400).json({success:false});
    })
}

module.exports = {
    testService
}