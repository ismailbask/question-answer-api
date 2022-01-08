const CustomError=require("../../helpers/error/CustomError");
const {isTokenIncluded,getAccessTokenFromHeader}=require("../../helpers/authorization/tokenHelpers");
const User=require('../../models/User');
const Question=require('../../models/Question');
const Answer=require("../../models/Answer");
const asyncErrorWrapper=require("express-async-handler");

const jwt=require("jsonwebtoken");
//*Giriş yapılmış mı? ya da token zamanı geçmiş mi
const getAccessToRoute=(req,res,next)=>{
    //token
    const {JWT_SECRET_KEY}=process.env;
    //*token kontrol edilecek
    // console.log(req.headers.authorization);
    if(!isTokenIncluded(req)){//Token var mı?
        //!401, 403
        //!401 Unauthorized(giriş yapmadan belli bir sayfaya erişmeye çalışıyor demek)
        //*403 Forbidden (giriş yapılsa bile yetkinin olmadığı bir alana giriş yapılmaya çalışıyor demek)
        return next(new CustomError("Giriş yapmadan bu sayfaya erişemezsiniz!",401));
    }
    const accessToken =getAccessTokenFromHeader(req);//*access_tokeni çektik
    jwt.verify(accessToken,JWT_SECRET_KEY,(err,decoded)=>{//*tokenen zamanı geçmişse err ile geçmemişse decoded ile döner
        if(err){
            return next(new CustomError("Giriş yapmadan bu sayfaya erişemezsiniz",401));
        }
        req.user={
            id:decoded.id,
            name:decoded.name,
            email:decoded.email,
        }
        // console.log(decoded);//*oluşturmuş olduğumuz tokena göre decod eder ve orada oluşturulan bilgileri tutar.

        next();
    });
};

//* İlk başta token kontrol ediliyor yukarda. eğer giriş yapılmışsa user vardır ve user'ı kullanabiliriz.
const getAdminAccess=asyncErrorWrapper (async (req,res,next)=>{
    const {id}=req.user;
    const user=await User.findById(id);
    if(user.role!=="admin"){
        return next(new Error("Sadece adminlerin erişebileceği bir adrese erişmeye çalşıyorsunuz.",403))
    }
    next();
});

//*Soruyu soran ve user aynı kişi mi?
const getQuestionOwnerAccess=asyncErrorWrapper (async (req,res,next)=>{
    const userId=req.user.id;//*getAccessToRoute a girdiği için user kullanabiliriz.
    const questionId=req.params.id;
    const question=await Question.findById(questionId);
    // console.log(question.user)
    if(question.user!=userId) {//* soru soran user ile soruyu düzenlemek isteyen user aynı kişi mi?
        return next(new CustomError("Size ait olmayan bir soruyu düzenlemeye çalışıyorsunuz. Bu mümkün değil!",403));
    }
    req.data=question;//*bir daha veritabanında arama yapmamak için,req.data ile aranan soruyu yolladık
    next();
});
//*cevabı düzenlemek isteyene ait mi?
const getAnswerOwnerAccess=asyncErrorWrapper (async (req,res,next)=>{
    const userId=req.user.id;//*getAccessToRoute a girdiği için user kullanabiliriz.
    const answerId=req.params.answer_id;
    const answer=await Answer.findById(answerId);
    // console.log(question.user)
    if(answer.user!=userId) {//* soru soran user ile soruyu düzenlemek isteyen user aynı kişi mi?
        return next(new CustomError("Size ait olmayan bir cevabı düzenlemeye çalışıyorsunuz. Bu mümkün değil!",403));
    }
    req.data=answer;//*bir daha veritabanında arama yapmamak için,req.data ile aranan cevabı yolladık
    next();
});


module.exports={
    getAccessToRoute,
    getAdminAccess,
    getQuestionOwnerAccess,
    getAnswerOwnerAccess
}