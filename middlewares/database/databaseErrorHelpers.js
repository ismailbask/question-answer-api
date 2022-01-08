const User=require("../../models/User");
const Question=require("../../models/Question");
const Answer=require("../../models/Answer");
const CustomError=require("../../helpers/error/CustomError");
const asyncErrorWrapper=require("express-async-handler");
//* Kullanıcı var mı yok mu sorgusu-ARA KATMAN
const checkUserExist= asyncErrorWrapper(async (req,res,next)=>{
    const {id}=req.params;
    const user= await User.findById(id);
    if(!user){
        return next(new CustomError("Böyle bir kullanıcı bulunamadı",400));
    }
    req.data=user;//* req.dataya yüklüyoruz ki, bir daha veritabanı işlemi yapmayalım diye
    next();
});
const checkQuestionExist= asyncErrorWrapper(async (req,res,next)=>{
    const question_id=req.params.id||req.params.question_id;//*hem id hem de question_id gönderdiğimzde kabul etsin diye.
    const question= await Question.findById(question_id);
    if(!question){
        return next(new CustomError("Böyle bir soru bulunamadı",400));
    }
    req.data=question;
    next();
});
//*
const checkQuestionAndAnswerExist= asyncErrorWrapper(async (req,res,next)=>{
    const question_id=req.params.question_id;
    const answer_id=req.params.answer_id;
    const answer=await Answer.findOne({//*  _id: answer_id ve question:question_id eşit olanı bul
        _id: answer_id,
        question:question_id
    });
    if(!answer){
        return next(new CustomError("Böyle soru id'sine göre herhangi bir cevap bulunamadı!",400));
    }
    next();
});
module.exports={
    checkUserExist,
    checkQuestionExist,
    checkQuestionAndAnswerExist
}