const express=require("express");
const dotenv=require("dotenv");//Enviroment  Variables her taraftan erişilebilmesini sağlam için config dosyası gereksinimi.
const connectDatabase=require("./helpers/database/connectDatabase");
const customErrorHandler=require("./middlewares/errors/customErrorHandler");
const path=require("path");
//router işlemi
const routers=require("./routers/index");
//Enviroment  Variables
dotenv.config({
    path:"./config/env/config.env"//yolu gösterdik 
})
//MongoDb Connection
connectDatabase();

const app=express();
//Express Body-Middleware
app.use(express.json());
const PORT=process.env.PORT;//5000 yada kullanıcalak ortamdaki port olabilir.

//Routers middleware
app.use("/api",routers)//api requesti gelince git routersa(index.js) bak. 

//ERRO HANDLER
app.use(customErrorHandler);


//* Static dosyaların tanımlanması
// console.log(__dirname);
app.use(express.static(path.join(__dirname,"public")));//*

app.listen(PORT,()=>{
    console.log(`App started on ${PORT} : ${process.env.NODE_ENV}`);
})
