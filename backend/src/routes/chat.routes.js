const express = require("express");


const{ getChats ,createChat} = require("../controllers/chat.controller")
const router = express.Router();

router.get("/getChats", getChats);
router.post("/createChat", createChat);

module.exports = router ;
