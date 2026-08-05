require("dotenv").config();
const jwt = require("jsonwebtoken");

const authMiddleware = (req,res,next)=>{
    const authHeader = req.headers.authorization ;
    if(!authHeader){
        return res.status(401).json({
            success:false,
            message:"Authorization header missing"
        });
    }

    if(!authHeader.startsWith("Bearer ")){
        return res.status(401).json({
            success:false,
            message:"Invalid Authorization format"
        });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
    return res.status(401).json({
        success: false,
        message: "Token missing"
    });
}
    try {

    const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
    );

console.log(decoded);

req.user = decoded;

next();

} catch (error) {

    return res.status(401).json({
        success: false,
        message: "Invalid Token"
    });

}


};
module.exports = authMiddleware ;