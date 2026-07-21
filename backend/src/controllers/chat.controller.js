const getChats =  async(req ,res)=>{
   res.json({
    message:"All Chats"
   });
};

const createChat = async(req ,res)=>{
    res.json({
        message:"Chat Created"
    });
};

module.exports={
    getChats,
    createChat
};