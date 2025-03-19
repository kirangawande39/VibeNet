
const express=require('express')
require('dotenv').config();

const app=express();

const PORT=process.env.PORT || 5000;

app.get('/',(req,res)=>{
    res.send("Hello I am root route")
})

app.listen(PORT,()=>{
    console.log(`PORT listing on ${PORT} `)
})