const express = require('express');
const userRoute = require('./src/controller/user');
const app = express();

app.get('/',(req,res)=>{
    res.send('Hello world');
})

app.use('/api/user',userRoute);

app.listen(4000,()=>{
    console.log('listening on port 4000\nhttp://localhost:4000');
})