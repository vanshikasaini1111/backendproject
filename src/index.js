// import dotenv from 'dotenv';
// dotenv.config();


// import express from "express"
// import mongoose from "mongoose";
// import {DB_NAME} from "./constants.js";
// import connectDB from "./db/index.js";

// // dotenv.config({
// //     path :'./env'
// // })
// const app = express();
// connectDB( )
// .then(()=>{
//     app.listen(process.env.PORT || 8000,()=>{
//           console.log(`Server is running at port :${process.env.PORT}`);
//     });
// })
// .catch((err)=>{
//     console.log("MONGO db connection failed !!!",err);
// });

import { app } from "./app.js";
import connectDB from "./db/index.js"; // Ensure this file is correct

const PORT = process.env.PORT || 8000;

connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running at port: ${PORT}`);
        });
    })
    .catch((err) => {
        console.log("MONGO db connection failed !!!", err);
    });

