const express=require('express');
const {getAccessToRoute,getAnswerOwnerAccess}=require('../middlewares/authorization/auth');
const {addNewAnswerToQuestion,getAllAnswersByQuestion,getSingleAnswer,editAnswer,deleteAnswer,likeAnswer}=require('../controllers/answer');
const {checkQuestionAndAnswerExist}=require('../middlewares/database/databaseErrorHelpers');
const router=express.Router({mergeParams:true});
// router.get("/",(req,res,next)=>{
//      console.log(req.params);//* Boş değer döndü çünkü biz bir üst routerda bir alt routerı çağırdık.
//     res.send("Answer Route")
// })
router.post("/",getAccessToRoute,addNewAnswerToQuestion);
router.get("/",getAllAnswersByQuestion);
router.get("/:answer_id",checkQuestionAndAnswerExist,getSingleAnswer);
router.get("/:answer_id/like",[checkQuestionAndAnswerExist,getAccessToRoute],likeAnswer);
// router.get("/:answer_id/undo_like",[checkQuestionAndAnswerExist,getAccessToRoute],undoLikeAnswer);
router.put("/:answer_id/edit",[checkQuestionAndAnswerExist,getAccessToRoute,getAnswerOwnerAccess],editAnswer);//*önce soru var mı diye bak,sonra kullanıcı girişi yapılmış mı diye bak, en sonunda kullanıcıya ait olup olmadığına bak
router.delete("/:answer_id/delete",[checkQuestionAndAnswerExist,getAccessToRoute,getAnswerOwnerAccess],deleteAnswer);//*önce soru var mı diye bak,sonra kullanıcı girişi yapılmış mı diye bak, en sonunda kullanıcıya ait olup olmadığına bak



module.exports=router;