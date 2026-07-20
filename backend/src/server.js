require("dotenv").config();

const connectDB= require("./database/db.js");
const app = require("./app.js");

const PORT = process.env.PORT || 5000 ;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(` Server running on ${PORT}`);
    });
});