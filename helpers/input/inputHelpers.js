const bcrypt=require("bcryptjs");
const validateUserInput=(email,password)=>{
    return email&&password;//* email ve password varsa true yoksa false döner 
}
const comparePassword=(password,hashedPassword)=>{//* giriş yapılmak istelinen kullanıcı şifresinin kayıtlı olan hashlenmiş şifresini decode edildi.
    return bcrypt.compareSync(password,hashedPassword);//*aynı ise true değilse false döner
}
module.exports ={
    validateUserInput,
    comparePassword
} 