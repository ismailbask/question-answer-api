const express=require('express');
const answer =require("./answer");
const Question=require("../models/Question");
const {getAllQuestions,askNewQuestion,getSingleQuestion,editQuestion,deleteQuestion,likeQuestion,undoLikeQuestion}=require("../controllers/question");
const {checkQuestionExist}=require("../middlewares/database/databaseErrorHelpers");
const {getAccessToRoute,getQuestionOwnerAccess}=require("../middlewares/authorization/auth");
const questionQueryMiddleware =require("../middlewares/query/questionQueryMiddleware");
const answerQueryMiddleware =require("../middlewares/query/answerQueryMiddleware");
const router=express.Router();
router.get("/:id/like",[getAccessToRoute,checkQuestionExist],likeQuestion);
// router.get("/:id/undo_like",[getAccessToRoute,checkQuestionExist],undoLikeQuestion);
router.get("/",questionQueryMiddleware(Question,{//* biz questionQueryMiddleware e argüman da gönderebiliriz.
    population:{
        path:"user",
        select:"name profile_image"
    }
}),getAllQuestions);//*tüm soruları gösterme
router.get("/:id",checkQuestionExist,answerQueryMiddleware(Question,{
    population:[
        {
            path:"user",
            select:"name profile_image"
        },
        {
            path:"answers",
            select:"content"
        }
    ]
}),getSingleQuestion);//*tek soru çekme
router.post("/ask",getAccessToRoute,askNewQuestion);//*controllers altındaki question.js doyasına bak
router.put("/:id/edit",[getAccessToRoute,checkQuestionExist,getQuestionOwnerAccess],editQuestion);//*ilk başta giriş yapmalı,sonra öyle bir soru var mı diye kontrol edilecek, daha sonra soru varsa soru o kullanıcıya ait mi middlewarelere girecek. Hepsinden geçerse soruyu düzenleyebilecek.
router.delete("/:id/delete",[getAccessToRoute,checkQuestionExist,getQuestionOwnerAccess],deleteQuestion);//*ilk başta giriş yapmalı,sonra öyle bir soru var mı diye kontrol edilecek, daha sonra soru varsa soru o kullanıcıya ait mi middlewarelere girecek. Hepsinden geçerse soruyu silebilecek.

//*answer alanı
router.use("/:question_id/answers",checkQuestionExist,answer);//*question_id değişkeni answer e gitmedi.

module.exports=router;