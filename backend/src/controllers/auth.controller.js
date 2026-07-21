const register = async(req ,res)=>{
    res.status(200).json({
        success:true,
        message:"Register controller Working"
    });
};

const login = async (req, res)=>{
    res.status(200).json({
        success:true,
        message:"Login Controller working "
    });
};

module.exports={
    register,
    login
};