import dotenv from 'dotenv';
dotenv.config({
    path:'./.env'
})

import {app} from './app.js'
import express from "express"
import mongoose from "mongoose";
import {DB_NAME} from "./constants.js";
import connectDB from "./db/index.js";

// dotenv.config({
//     path :'./env'
// })
connectDB( )
.then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
          console.log(`Server is running at port :${process.env.PORT}`);
    });
})
.catch((err)=>{
    console.log("MONGO db connection failed !!!",err);
});

