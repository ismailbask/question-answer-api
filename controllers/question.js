const Question=require("../models/Question");
const CustomError=require("../helpers/error/CustomError");
const asyncErrorWrapper=require("express-async-handler");

//* Yeni soru ekleme
const askNewQuestion=asyncErrorWrapper(async (req,res,next)=>{
    const info=req.body;
    const question=await Question.create({
        // title:info.title,
        // content:info.content,
        //*ya da "...info" şeklinde verilebilir sadece info ile görmüyor.
        ...info,
        user:req.user.id
    });
    res.status(200)
    .json({
        success: true,
        data: question
    })
});
//*Tüm soruları çekme
const getAllQuestions=asyncErrorWrapper(async (req,res,next)=>{

    // //* arama filtreleme işlemi yapıyoruz artık. Question.find demek yerine,req.query.search ten gelen değere göre arama yapıyoruz.
    // //* arama filtreleme için kullanacağız. son ders içerikleri
    // let query= Question.find();//* tüm soruları getirdik
    // const populate=true;
    // const populateObject={
    //     path:"user",
    //     select:"name profile_image"
    // };
    // //*search
    
    // //*populate
    // if(populate){
    //     query=query.populate(populateObject);
    // }
    // //*pagination
    
    
    
    // const question=await query;
    // const questions=await Question.find();//*.where({title:"Questions 2 - Title"});//*tüm soruları veritabanından çekme
    return res.status(200)
    .json(res.queryResults);
});
//* Tek bir soru çekme
const getSingleQuestion=asyncErrorWrapper(async (req,res,next)=>{
    // const question=req.data;//*veritabanından hem arakatmandan hem de buradan aramak yerine, arakatmanda req.dataya koyup burada kullanabiliriz.
    // const baslık=req.data.title;
    // const icerik=req.data.content;

    return res.status(200)
    .json(res.queryResults);
});
//*Soru Düzenleme
const editQuestion=asyncErrorWrapper(async (req,res,next)=>{
    // const {id}=req.params;
    const {title,content}=req.body;
    // console.log(title,content);
    // let question=await Question.findById(id);
    let question=req.data//* await Question.findById(id); bir daha veritabanında arama yapmamak için,getQuestionOwnerAccess arakatmanında arama yaptığımız soruyu buraya çektik
    question.title=title;
    question.content=content;
    question=await question.save();//* editlenen soru save ile veritabanına kaydedilecek. sonra biz bunu res ile geri döndüreceğimiz için questiona eşitledik.
    res.status(200)
    .json({
        success:true,
        data:question
    })
});
const deleteQuestion=asyncErrorWrapper(async (req,res,next)=>{
    const {id}=req.params;
    await Question.findByIdAndDelete(id);
    res.status(200)
    .json({
        success: true,
        message:"Soru silme işlemi başarılı"
    });
});
const likeQuestion=asyncErrorWrapper(async (req,res,next)=>{
    const {id}=req.params;//*sorunun idsi alındı
    const question=await Question.findById(id);//*soru veritabnında bulundu
    //* like etmişse
    if(!question.likes.includes(req.user.id)){//* user id likes arayin in içinde varsa kullanıcı bu soruyu like etmiştir 
        question.likes.push(req.user.id);//* yoksa eğer bu user idyi arraya ekliyoruz
        question.likeCount=question.likes.length;
        await question.save();
        res.json({
            info:"bu soruyu beğendiniz",
            data:question
        });
        
    }
    else{
        const index=question.likes.indexOf(req.user.id);//* soeuyu like etmişse user id nin olduğu indexi bul
        question.likes.splice(index,1);//*siplice ile o indexe git ve sil
        question.likeCount=question.likes.length;
        await question.save();
        res.json({
            info:"bu soruyu beğenmekten vazgeçtiniz",
            data:question
        }); 
    }
    // question.likes.push(req.user.id);//* yoksa eğer bu user idyi arraya ekliyoruz
    // await question.save();
    // return res.status(200)
    // .json({
    //     success:true,
    //     data:question
    // });
});
// const undoLikeQuestion=asyncErrorWrapper(async (req,res,next)=>{
//     const {id}=req.params;//*sorunun idsi alındı
//     const question=await Question.findById(id);
//     if(!question.likes.includes(req.user.id)){//* soruyu like etmemişse
//         return next(new CustomError("Bu soruyu zaten beğenmediniz"),400);

//     }
//     const index=question.likes.indexOf(req.user.id);//* soeuyu like etmişse user id nin olduğu indexi bul
//     question.likes.splice(index,1);//*siplice ile o indexe git ve sil
//     await question.save();
//     return res.status(200)
//     .json({
//         success:true,
//         data:question
//     })
// })
module.exports={
    askNewQuestion,
    getAllQuestions,
    getSingleQuestion,
    editQuestion,
    deleteQuestion,
    likeQuestion,
    // undoLikeQuestion
}