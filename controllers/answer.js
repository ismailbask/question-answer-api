const Question=require("../models/Question");
const Answer=require("../models/Answer");
const CustomError=require("../helpers/error/CustomError");
const asyncErrorWrapper=require("express-async-handler");
const addNewAnswerToQuestion=asyncErrorWrapper(async(req,res,next)=>{
    const {question_id}=req.params;
    const user_id=req.user.id;
    const info=req.body;
    const answer = await Answer.create({
        ...info,//* answer alanında oluşturduğum content alanına eklenir.
        question:question_id,//* aynı zamanda bunu answerin sorusunun idsi vardır.
        user:user_id//* bu soruyu soran user id si var.
    });
    return res.status(200)
    .json({
        success:true,
        data:answer
    });
});
//* Bir soruya gelen tüm cevapları alma
const getAllAnswersByQuestion=asyncErrorWrapper(async(req,res,next)=>{
    const {question_id}=req.params;
    const question=await Question.findById(question_id).populate("answers");//* question şemasındaki answers alanın içindeki ref alanına işaret eden answer şemasındaki cevapları getir.
    const answers=question.answers;//* question içindeki answers alanını answers içine at
    // const answers_content=question.anserwers.content;
    // console.log(answers.content);
    return res.status(200).json({
        success:true,
        count:answers.length,
        data:answers
    })
});
const getSingleAnswer =asyncErrorWrapper(async(req,res,next)=>{
    const {answer_id}=req.params;
    const answer=await Answer.findById(answer_id)
    .populate({
        path:"question",
        select:"title",
        model:Question//* bu saçma şeyi göstermeden olmadı. Question şeması kaydedilmedi gibi bir hata verdi. şemanın ismini verince düzeldi.
    })
    .populate({
        path:"user",
        select:"name profile_image"
    });
    return res.status(200)
    .json({
        success:true,
        data:answer
    })
});
const editAnswer =asyncErrorWrapper(async(req,res,next)=>{
    const {answer_id}=req.params;
    const {content}=req.body;
    let answer=req.data;//*middlewares teki authorization içindeki auth.js de yazdığımız sorguyu tekrardan yapmamk için
    answer.content=content;
    await answer.save();
    return res.status(200)
    .json({
        success:true,
        data:answer
    })
});
//*cevabı siliyoruz.
const deleteAnswer =asyncErrorWrapper(async(req,res,next)=>{
    const {answer_id}=req.params;
    const {question_id}=req.params;
    await Answer.findByIdAndRemove(answer_id);//*cevabı siliyoruz veritabanından.
    const question=await Question.findById(question_id);//* aynı zamanda soruya eklediğimiz bu cevabın idsini silmemiz gerekiyor. hookslarala yapabilirdik. userı silince sorularını sildiğimiz gibi. burada başka bir yöntem denedik.
    question.answers.splice(question.answers.indexOf(answer_id),1);//*soruya ait cevabı sil
    question.answerCount=question.answers.length;
    await question.save();//* güncellenen soruyu kaydediyoruz.
    return res.status(200).json({
        success: true,
        message:"Cevap başarılı bir şekilde silindi"
    });
});
const likeAnswer=asyncErrorWrapper(async (req,res,next)=>{
    const {answer_id}=req.params;//*cevabın idsi alındı
    const answer=await Answer.findById(answer_id);//*cevap Answer şemasında veritabnında bulundu
    //* like etmişse
    if(!answer.likes.includes(req.user.id)){//* user id likes arayin in içinde varsa kullanıcı bu soruyu like etmiştir 
        answer.likes.push(req.user.id);//* yoksa eğer bu user idyi arraya ekliyoruz
        await answer.save();
        res.json({
            info:"bu cevabı beğendiniz",
            data:answer
        });
        
    }
    else{
        const index=answer.likes.indexOf(req.user.id);//* soeuyu like etmişse user id nin olduğu indexi bul
        answer.likes.splice(index,1);//*siplice ile o indexe git ve sil
        await answer.save();
        res.json({
            info:"bu cevabı beğenmekten vazgeçtiniz",
            data:answer
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
module.exports={
    addNewAnswerToQuestion,
    getAllAnswersByQuestion,
    getSingleAnswer,
    editAnswer,
    deleteAnswer,
    likeAnswer
}