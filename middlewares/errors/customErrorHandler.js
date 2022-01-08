const CustomError=require('../../helpers/error/CustomError');
const customErrorHandler=(err,req,res,next)=>{
    let customError2=err;
    console.log(err);
    // console.log(err);//*eğer bir hata alınırsa console.log(err) diyerek hatanın ayrıntılarını görebilirsin.
    if(err.name==="SyntaxError"){
        customError2=new CustomError("Beklenmedik syntax hatası",400);
    }
    if(err.name==="ValidationError"){
        customError2=new CustomError(err.message,400);//mongoose da bir mesaj gelir
    }
    //aynı email adresi ile kaydolunursa mongoservererror hatasını yakaladık.
    if(err.code===11000){
        customError2=new CustomError("Aynı email adresi zaten var!",400);
    }
    //* id ile kullanıcı getirme de default id den farklı bir id gelirse hatayı yakaladık
    if(err.name==="CastError"){
        customError2=new CustomError("Lütfen girmiş olduğunuz id'yi kontrol ediniz.",400);
    }
    // console.log(customError.message,customError.status);//error içersine extends ettiğimiz status ve messageyi buradan çektik
    res.status(customError2.status||500).json({
        success:false,
        message:customError2.message
    })
};
module.exports=customErrorHandler;