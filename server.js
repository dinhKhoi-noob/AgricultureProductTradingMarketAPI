const express = require('express');
const userRoute = require('./src/controller/user');
const uploadRoute = require('./src/controller/upload');
const app = express();
require("dotenv").config();

app.get('/',(req,res)=>{
    res.send('Hello world');
})

app.use('/api/user',userRoute);
app.use('/api/upload',uploadRoute);
app.get('/test',(req,res)=>{
    res.json({success:true,message:"Test successfully"})
})
app.listen(4000,()=>{
    console.log('listening on port 4000\nhttp://localhost:4000');
})