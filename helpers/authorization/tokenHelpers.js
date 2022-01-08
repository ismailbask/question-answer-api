//!Token ürettik ve şimdi bunu cookie kaydetmemiz gerekiyor.
const sendJwtToClient=(user,res)=>{
    const token=user.generateJwtFromUser();//token'ı oluşturmuş olduğumuz user üzerinden çekiyoruz.
    const {JWT_COOKIE,NODE_ENV}=process.env;
    return res
    .status(200)
    .cookie("access_token",token,{ //*cookie ismi ve ona karşılık gelen "token" ve options değerler
        httpOnly:true,
        expires:new Date(Date.now()+parseInt(JWT_COOKIE)*1000*60), //*10*60 10 dakika sonlanma süresi
        secure:NODE_ENV ==="development"?false:true
    })
    .json({
        success:true,
        access_token:token,
        data:{
            name:user.name,
            email:user.email
        }
    });
}
//*Token yerleştirilimiş mi? diye kontrol ettik ilk önce. undefined olarak da dönebilir.
const isTokenIncluded=(req)=>{
    return req.headers.authorization && req.headers.authorization.startsWith('Bearer:');
    //* eğer authorization varsa ve başlığı bearer şeklinde ise true dön değilse false
}
const getAccessTokenFromHeader=(req)=>{//*access_tokenı çekip yollamamız lazım decode etmek için
    const authorization=req.headers.authorization;
    const access_token=authorization.split(" ")[1]//*split boşuğa göre parçaladı. ve access_token ı aldık
    // console.log(access_token)
    return access_token;
}
module.exports={
    sendJwtToClient,
    isTokenIncluded,
    getAccessTokenFromHeader
};