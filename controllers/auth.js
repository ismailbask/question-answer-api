const User=require("../models/User");//UserSchema yı ekledik
const CustomError=require("../helpers/error/CustomError");
const asyncErrorWrapper=require("express-async-handler");
const {sendJwtToClient} = require("../helpers/authorization/tokenHelpers");
const {validateUserInput,comparePassword}=require("../helpers/input/inputHelpers");
const sendEmail = require("../helpers/libraries/sendEmail");
//!KULLANICI OLUŞTURMA
const register=asyncErrorWrapper(async (req,res,next)=>{//asyncerrorwrapper hataları next ile expresse gönderecek, try catch içine yazmamıza gerek yok
    //*POST DATA
    // console.log(req.body);
    const {name,email,password,role}=req.body;
    const user=await User.create({
            // name:name,
            // email:email,
            // password:password
            //isimler aynı olduğu için aşağıdaki gibi daha modern kullan.
        name,
        email,
        password,
        role
        });
        sendJwtToClient(user,res);//*user ve res değerlerini sendJwtToClient'e yolladık.
        //KULLANICI OLUŞTURULDUKTAN SONRA
        // const token=user.generateJwtFromUser();
        // console.log(token);
        

        // res
        // .status(200)
        // .json({
        //     success:true,
        //     data:user
        // }) //!helprs klasörünün içierisnde authorization içerisinde sendjwttoclient dosyası oluşturduk ve orada yazdık.
    
    //async await register
    
});
//! LOGİN İŞLEMİ
const login=asyncErrorWrapper(async (req,res,next)=>{
    const {email,password}=req.body;//*login için gönderilen email ve passwordu aldık
    // console.log(email,password);
    if(!validateUserInput(email,password)){//*eğer bu password ve email var mı diye kontrol ettik.
        return next(new CustomError("Giriş yapabilimeniz için boş alan bırakmayınız!",400));
    }
    const user=await User.findOne({email}).select("+password");//*UserSchema daki giriş yapılmak isteyen kullanıcın mail adresinde kullanıcının bilgilerini çektik.
                                                                //*password gelmesin diye select:false dediğimiz için password gelmedi. onu da çekmek için select(password) kullandık
    // console.log(user);
    if(!comparePassword(password,user.password)){//* ilki formdan gelen ikinci hashlenmiş olan.
        return next(new CustomError("Lütfen kimlik bilgilerinizi kontrol ediniz!"));
    }
    sendJwtToClient(user,res);//* giriş doğruysa tokenı tekrardan access_tokena kaydediyoruz. token zamanı bitince bir daha giriş yapması gereksin.
});

//!LOGOUT İŞLEMİ
const logout =asyncErrorWrapper(async (req,res,next)=>{
    const {NODE_ENV}= process.env;
    return res.status(200)
    .cookie({
        httpOnly: true,
        expires:new Date(Date.now),//* cookie silinir.
        secure:NODE_ENV==="development" ? false:true
    })
    .json({
        success:true,
        message:"Çıkış başarılı bir şekilde gerçekleşti"
    })
})

//!PROFİL REQ OLURSA KULLANICI BİLGİLERİNİ GETİR.
const getUser=(req,res,next)=>{
    res.json({
        success:true,
        // messages:"welcome" 
        data:{//req.user ile gönderilen requesti aldık
            id:req.user.id,
            name:req.user.name,
            email:req.user.email
        }
    })
};
//! YÜKLENEN RESİMİN VERİTABANINDA KAYDEDİLMESİ İŞLEMİ
const imageUpload= asyncErrorWrapper(async (req,res,next)=>{
    const user=await User.findByIdAndUpdate(req.user.id,{//*req.user.id ile çektiğim id den findByIdAndUpdate fonksiyonuyla güncellemek istediğimiz kullanıcıyı buluyoruz.
        "profile_image":req.savedProfileImage//* profile_image bölümünü profileImageUpload.js deki req içine aldığımız savedProfileImage'deki resim uzantısını verdik 
    },{
        new:true, //* kullanıcı güncellenmesi
        runValidators:true
    })
    res.status(200)
    .json({
        success:true,
        message:"Image uploaded successfull",
        data:user//* yukarda güncellediğim kullanıcıyı verdik.
    })
});
//!FORGOT PASSWORDS
const forgotPassword=asyncErrorWrapper(async (req,res,next)=>{
    const resetEmail=req.body.email;//*emaili postmanden aldık
    const user=await User.findOne({email:resetEmail});//* böyle bir emaili veritabanından çektik
    if(!user){//*eğer böyle bir email yoksa hata ile fırlattık.
        return next(new CustomError("Böyle bir emaile bağlı bir kullanıcı bulunamadı",400));
    }
    const resetPasswordToken= user.getResetPasswordTokenFromUser();//*tokeni getResetPasswordTokenFromUser fonksiyonu ile oluşturup resetPasswordToken a attık
    
    await user.save();//*userı veritabınına kaydeddik. userda resetPasswordToken ve resetPasswordExpire oluştu

    //*Gönderilecek mailin hangi urlye gideceği ayarlandı
    const resetPasswordUrl=`http://localhost:5000/api/auth/resetpassword?resetPasswordToken=${resetPasswordToken}`;
    const emailTemplate=`
    <h3>Reset your password:</h3>
    <p>This <a href='${resetPasswordUrl}'target='_blanck'>link</a>Will expire in 1 hour</p>
    `;
    try{
        await sendEmail({//*mailoptions
            from:process.env.SMTP_USER,
            to:resetEmail,
            subject:"Reset your password",
            html:emailTemplate
        });
        return res.status(200).json({
            success:true,
            message:"Token email adresinize gönderilmiştir.",
            
        });
    }
    catch(err){//*hata varsa token ve expires alanları silmemiz gerekiyor.
        user.resetPasswordToken=undefined;
        user.resetPasswordExpire=undefined;
        await user.save(); //*kaydet
        return next(new CustomError("Eposta gönderilemedi",500));
    }
});

//*RESET PASSWORD
const resetPassword=asyncErrorWrapper(async (req,res,next)=>{
    const {resetPasswordToken}=req.query;//*postmanda reauest query parameterelerinden tokeni aldık
    const {password}=req.body;//*değişen şifreyi aldık
    if(!resetPasswordToken){
        return next(new CustomError("Please provide a valid token"),400);
    }
    let user=await User.findOne({
        resetPasswordToken:resetPasswordToken,//*resetPasswordToken göre aradık
        resetPasswordExpire:{$gt:Date.now()} //*resetPasswordExpire Date.now()(şimdiki zamandan büyükse getir.-gt- great than)
    });
    //* token güncel değilse veya geçerli değilse durumu kontrolü
    if(!user){//* eğer güncel veya doğru değilse user oluşmaz
        return next(new Error('Invalid Token  or Session Expired',400))
    }

    //*password güncelleme
    user.password=password;
    user.resetPasswordToken=undefined;
    user.resetPasswordExpire=undefined;

    await user.save();//*veritabanına kaydettik

    return res.status(200)
    .json({
        success:true,
        message:"Şifre yenileme işlemi başarılı"
    });
});

//* Kullanıcı bilgilerini güncelleme işlemi
const editDetails=asyncErrorWrapper(async (req,res,next)=>{
    const editInfo=req.body;
    const user=await User.findByIdAndUpdate(req.user.id,editInfo,{//* id'ye göre güncellenmesi istenen alanları güncelle 
    //* req.user.id ye nasıl erişiyoruz? routers klasöründen buraya gelmeden önce "getAccessToRoute" middleware' gittik, kullanıcı var mı diye kontrol ettik. varsa kullanıcı bilgilerini req ile aldık.
    //* req.user.id ye bu şekilde erişmiş oluyoruz.    
        new:true,
        runValidators:true
    });
    return res.status(200)
    .json({
        success:true,
        data:user
    })
    
});
module.exports = {
    register,
    login,
    getUser,
    logout,
    imageUpload,
    forgotPassword,
    resetPassword,
    editDetails
    

} 