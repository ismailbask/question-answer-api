const User=require("../models/User");//UserSchema yı ekledik
const CustomError=require("../helpers/error/CustomError");
const asyncErrorWrapper=require("express-async-handler");

const blockUser=asyncErrorWrapper (async (req,res,next)=>{
    const {id}=req.params;
    const user=await User.findById(id);
    user.blocked=!user.blocked;//*True ise false, false ise true yapıyor.
    await user.save();
    return res.status(200)
    .json({
        success:true,
        messages:"Block- Unblock Successfull"
    });
});
const deleteUser=asyncErrorWrapper (async (req,res,next)=>{
    const {id}=req.params;
    const user=await User.findById(id);
    await user.remove();//* user remove yaparken aynı zamanda o usera ait tüm soruları silmemiz gerekiyor.
    return res.status(200)
    .json({
        success:true,
        messages:"Silme işlemi başarılı"
    });
});
module.exports={
    blockUser,
    deleteUser
}