require("dotenv").config();
const mongoose = require('mongoose');

const connectDB = async()=>{
 try{
  await mongoose.connect(process.env.MONGO_URL);
  console.log("MOngoDB connected succesfully");
 }catch(error){
    console.error("MongoDB Connection Failed");
    console.error(error.message);
 };
};

module.exports = connectDB ;