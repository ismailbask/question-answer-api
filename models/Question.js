const mongoose=require("mongoose");
const slugify=require("slugify");
const Schema=mongoose.Schema;
const QuestionSchema=new Schema({
    title:{
        type:String,
        required:[true,"Başlık alanı boş bırakılamaz!"],
        minlength:[10,"Başlık alanı 10 karakaterden küçük olamaz!"],
        unique:true,
    },
    content:{
        type:String,
        required:[true,"İçerik alanı boş bırakılmaz"],
        minlength:[20,"Başlık alanı 10 karakaterden küçük olamaz!"]
    },
        //* başlık: bu bir sorudur şeklindeyse biz url olarak bu-bir-sorudur şeklinde ayarlayabiliriz.
    slug:String,
    createdAt:{
        type:Date,
        default:Date.now
    },
    user:{
        type:mongoose.Schema.ObjectId,
        required:true,
        ref:"User"//* soruları ve kullanıcıları birbirine bağladık referans vererek. 
    },
    likeCount:{
        type:Number,
        default:0
    },
    likes:[
        {
            type:mongoose.Schema.ObjectId,
            ref:"User"
        }
    ],
    answerCount:{
        type:Number,
        default:0
    },
    answers:[
        {
            type:mongoose.Schema.ObjectId,
            ref:"Answer"
        }
    ]
});
QuestionSchema.pre("save",function(next){
    if(!this.isModified("title")){//*title değişmişse yeni slug yap
        next();//*değişmemiş demektir
    }
    this.slug=this.makeSlug();//*değişmiş
    next();
});

QuestionSchema.methods.makeSlug=function(){
    return slugify(this.title,{
        replacement:'-',
        remove:/[*+~.()'"!:@]/g,
        lower:true
    });
}
module.exports=mongoose.model("Questions",QuestionSchema);