import dotenv from "dotenv";
import { createServer } from "http";
import connectDB from "./database/index.js";
import { app } from "./app.js";

dotenv.config({
  path: `./.env`,
});

connectDB()
  .then(() => {
    // createServer wraps Express so Socket.io can share the same port
    const httpServer = createServer(app);
    const PORT = process.env.PORT || 7000;
    httpServer.listen(PORT, () => {
      console.log(`⚙️ Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed !!! ", err);
  });

/*
import express from "express";
import mongoose from "mongoose";
import { DB_NAME } from "./constants";
const app = express();

(async()=>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error", (error) => {
            console.error("Error in server connection:", error);
            throw error;
        });

        app.listen(process.env.PORT, () => {
            console.log(`Server is running on port ${process.env.PORT}`);
        });
    } catch (error) {
        console.error("Error connecting to the database:", error);
    }
})()*/
