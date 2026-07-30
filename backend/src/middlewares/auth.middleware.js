const authMiddleware = (req,res,next)=>{
    const authHeader = req.headers.authorization ;
    if(!authHeader){
        return res.status(401).json({
            success:false,
            message:"Authorization header missing"
        });
    }

    if(!authHeader.startsWith("Bearer")){
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
    console.log(authHeader);
};
module.exports = authMiddleware ;