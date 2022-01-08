const User=require("../models/User");
const CustomError=require("../helpers/error/CustomError");
const asyncErrorWrapper=require("express-async-handler");
//* id e göre kullanıcıyı getirme
const getSingleUser=asyncErrorWrapper(async (req,res,next)=>{
    // const {id}=req.params;//* postmandan id verisini aldık.
    // const user= await User.findById(id);
    const user=req.data; //*veritabanından hem arakatmandan hem de buradan aramak yerine, arakatmanda req.dataya koyup burada kullanabiliriz.
    // if(!user){//*bu bize 5-6 saniye kazandırmış oldu. 
    //     return next(new CustomError("Böyle bir kullanıcı bulunamadı",400));
    // } //* user var mı kontrolünü burda yazmak yerine middlewares arakatman yazarak sorguladık. databaseErrorHelpers
    return res.status(200)
    .json({
        success:true,
        data:user
    });
});

//*Tüm kullanıcıları alma
const getAllUsers=asyncErrorWrapper(async (req,res,next)=>{
    // const users=await User.find();//*User schema içindeki tüm userları getirecek
    // return res.status(200)
    // .json({
    //     success:true,
    //     data:users
    // })

    //*artık isme göre arama yapıldığı için burayı kullanacağız
    res.status(200).json(res.queryResults);
});
module.exports={
    getSingleUser,
    getAllUsers
}