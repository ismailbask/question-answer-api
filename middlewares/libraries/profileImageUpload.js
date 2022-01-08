const multer=require("multer");
const path=require("path");
const CustomError=require("../../helpers/error/CustomError");

const storage=multer.diskStorage({
    destination:function(req,file,cb){//*cb callback fonksiyonu
        const rootDir=path.dirname(require.main.filename);//*main dosyası yani server.js dosyasının yolunu verir
        cb(null,path.join(rootDir,"/public/uploads"));//*cb hata mesajı alır null verdik.
    },
    filename:function(req,file,cb){
        //*File - Mimetype - image/png
        const extension=file.mimetype.split("/")[1];//* ikiye bölüp png kısmını aldık
        req.savedProfileImage=`image_${req.user.id}.${extension}`//*yüklenecek resimin id adersine göre uzantısını ayarladık.
        cb(null,req.savedProfileImage);
    }
});

const fileFilter =(req,file,cb)=>{
    let allowedMimeTypes=["image/jpg", "image/gif","image/jpeg","image/png"];
    if(!allowedMimeTypes.includes(file.mimetype)){
        return cb(new CustomError("Lütfen geçerli bir resim dosyası giriniz",400),false);//*false dosyayı kaydetme anlamında
    }
    return cb(null,true);//*hata yoksa dosyayı kaydet true  
};

const profileImageUpload=multer({storage,fileFilter});//*middleware oluşturduk ve fonksiyonları verdik.
module.exports=profileImageUpload;