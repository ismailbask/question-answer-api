const express=require('express');
const {getAccessToRoute}=require("../middlewares/authorization/auth");
const {register,login,getUser,logout,imageUpload,forgotPassword,resetPassword,editDetails}=require('../controllers/auth');
const profileImageUpload = require('../middlewares/libraries/profileImageUpload');
//api/auth
const router=express.Router();
// router.get("/",(req,res)=>{
//     res.send("Auth Home Page");
// })
router.post("/register",register)//controllers altındaki auth.js klasörüne bak.
router.post("/login",login)
router.get("/profile",getAccessToRoute,getUser);
router.get("/logout",getAccessToRoute,logout);//!loguot işlemi bir kullanıcı giriş yapmış eğer logut yapabilir. onun için giriş yapmış mı diye kontrol ediyoruz.
router.post("/forgotpassword",forgotPassword);
router.post("/upload",[getAccessToRoute,profileImageUpload.single("profile_image")],imageUpload);//! profile_image postmanda oluşturduğum keydir. bu keye göre yolluyoruz.
router.put("/resetpassword",resetPassword);
router.put("/edit",getAccessToRoute,editDetails);
module.exports=router;