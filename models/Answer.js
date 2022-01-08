const mongoose=require('mongoose');
const Question=require("./Question");

const Schema=mongoose.Schema;

const AnswerSchema=new Schema({
    content:{
        type:String,
        required:[true,"Lütfen cevap için içerik alanını doldurunuz"],
        minlength:[10,"İçerik alanı minimum 10 karakterli olmalıdır"]
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
    likes:[
        {
            type:mongoose.Schema.ObjectId,
            ref:"User"
        }   
    ],
    user:{
        type:mongoose.Schema.ObjectId,
        ref:"User",
        required:true
    },
    question:{
        type:mongoose.Schema.ObjectId,
        ref:"Question",
        required:true
    }
});
AnswerSchema.pre("save", async function(next){//*kaydedilmeden hemen önce
    if(!this.isModified("user")) return next();//*user alanı değişmemişse return et.
    try{
        //*eğer değişmişse yani yeni bir answer eklemişsek;
        const question=await Question.findById(this.question);//* hemen kaydetmeden önce olduğu için controllers daki answer.js içindeki addNewAnswerToQuestion fonksiyonunda question:question_id, işlemine işaret ettik 
        question.answers.push(this._id);//*question alanındaki answers bölümüne answerın id sini ekliyoruz.
        question.answerCount=question.answers.length;
        await question.save();//* veritabanına ekle 
        next();
    }
    catch(err){
        return next(err);
    }
    
});
module.exports=mongoose.model("Answer",AnswerSchema);