const mongoose=require('mongoose');
const Schema=mongoose.Schema;
const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");
const crypto=require("crypto");
const Question=require("./Question");
const UserSchema=new Schema({
    name:{
        type:String,
        required:[true,"isim boş bırakılmaz"],
    },
    email:{
        type:String,
        required:[true,"email alanı boş bırakılmaz"],
        unique:true,
        match:[
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            "Lütfen email adresinizi kontrol ediniz"
        ]
    },
    role:{
        type:String,
        default:"user",
        enum:["user","admin"]
    },
    password:{
        type:String,
        minlength:[6,"Şifre minimum 6 haneli olmalıdır"],
        required:[true,"Şifrenizi kontrol ediniz"],
        select:false //password alanın görülmemesi için
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
    title:{
        type:String
    },
    about:{
        type:String
    },
    place:{
        type:String
    },
    website:{
        type:String
    },
    profile_image:{
        type:String,
        default:"default.jpg"
    },
    blocked:{//admin kullanıcı bloklaması
        type:Boolean,
        default:false
    },
    resetPasswordToken:{
        type:String
    },
    resetPasswordExpire:{
        type:Date
    }
});
//User Schema methods
//*Yeni token oluşturma
UserSchema.methods.generateJwtFromUser=function(){
    const {JWT_SECRET_KEY,JWT_EXPIRE}=process.env;
    const payload={
        id:this.id,
        name:this.name,
        email:this.email
        }
        const token=jwt.sign(payload,JWT_SECRET_KEY,{
            expiresIn:JWT_EXPIRE
        });
        return token
    };
    
//*Forgot password için string token oluşturduk
UserSchema.methods.getResetPasswordTokenFromUser=function(){
    const randomHexString=crypto.randomBytes(15).toString("hex");
    // console.log(randomHexString);
    const {RESET_PASSWORD_EXPIRE}=process.env;
    //*Token oluşturma
    const ResetPaswordToken = crypto
    .createHash("SHA256")
    .update(randomHexString)
    .digest("hex");
    console.log(ResetPaswordToken);
    this.resetPasswordToken=ResetPaswordToken;
    this.resetPasswordExpire=Date.now()+parseInt(RESET_PASSWORD_EXPIRE);
    return ResetPaswordToken;
}

//*KAYDEDİLMEDEN ÖNCE ŞİFRE HASHLEME
//*mongoose sitesinde "pre" başlığında kod örneklerine göre bakılıp yapıldı.
UserSchema.pre("save",function(next){//*kayıt işlemi gerçekleşmeden evvel  yapılacaklar pre hooksu ile yapılır
    // console.log("Pre Hooks: Save");
    // console.log(this.password);
    //*User güncelleme işlemleri sırasında parola değişmediği durumda buranın çalışmasını istemiyoruz.
    if(!this.isModified("password")){//*isModified içindeki öğrenin değişip değişmediğini true yada false ile geri döndürür
        //*değişmemeişse
        next();//*bu bloktan komple çıkar. değişmişse direkt alta girer.
    }
    bcrypt.genSalt(10,(err, salt)=> {
        if(err) next(err);//*hata varsa next ile customErrorHandler a gönder
        bcrypt.hash(this.password, salt,(err, hash)=> {
            if(err) next(err);
            this.password=hash;//*haslenmiş parolayı passworde yükledik
            next();//*kayıt işlemini bitir
        });
    });
});
//*Delete question user silinince gelip ona ait soruları da siliyoruz.
UserSchema.post("remove",async function(){
    await Question.deleteMany({//*admin.js dosyasında user silme işlemi yapılıyor. kullanıcı silindikten sonra yapılacaklar.
        user:this._id//* silnmesi istenen kullanıcı ile sahip olduğu questionların silinmesi(user değeri şuanki id olursa questionu sil)
    })
})
module.exports=mongoose.model("User",UserSchema);//schemayı mongoose kaydettik 