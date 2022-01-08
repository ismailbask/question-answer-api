const express=require('express');
const {getAccessToRoute,getAdminAccess}=require('../middlewares/authorization/auth');
const {blockUser,deleteUser}=require("../controllers/admin");
const {checkUserExist}=require("../middlewares/database/databaseErrorHelpers");
const router=express.Router();
//*Block user
router.use([getAccessToRoute,getAdminAccess]);//* sadece bir yerde değil, bu sayfada yazılan tüm req işlemlerinde bu middlewareler çalışacak. token var mı? ve admin mi? arakatmanları
router.get("/block/:id",checkUserExist,blockUser);
router.delete("/user/:id",checkUserExist,deleteUser);

//*Delete user
module.exports=router;