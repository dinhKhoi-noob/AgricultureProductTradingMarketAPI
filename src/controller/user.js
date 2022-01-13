const router = require('express').Router();
const userService = require('../service/user');

router.get('/',(req,res)=>{
    try {
        userService.testService(req,res);
    } catch (error) {
        return res.status(500).json({success:false,message:"Internal server error"});
    }
})

module.exports = router;