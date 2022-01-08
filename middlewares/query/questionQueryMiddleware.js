const {searchHelper,populateHelper,questionSortHelper,paginationHelper}=require("./queryMiddlewareHelpers");
const asyncErrorWrapper=require("express-async-handler");
const questionQueryMiddleware=function(model,options){
    return asyncErrorWrapper( async function(req,res,next){
        let query=model.find();//*gönderilen model yani question modelinden tüm soruları aldık.
        //*Search  biz searchi burada yaazabiliriz fakat diğer middlewarelarda kullanmak için helpers fonksiyon şeklinde yazdık
        query=searchHelper("title",query,req);//*searchHelper fonk. 3 adet arguman yolladık. title a göre arama yaptık
        if(options&&options.population){//*options varsa ve optionsun içinde population varsa
            query=populateHelper(query,options.population);

        }
        //*Soruları sıralama işlemleri
        query=questionSortHelper(query,req);

        //*Pagination,
        const total= await model.countDocuments();
        const paginationResult=await paginationHelper(total,query,req);//* burada query değeri sıralamadır, population işlemidir gibi değerlerden geçip return edilen değerdir.
        query=paginationResult.query;
        const pagination=paginationResult.pagination;
        const queryResults=await query;//*queryden dönen sonuçları aldık.
        res.queryResults={
            success:true,
            count:queryResults.length,
            pagination:pagination,
            data:queryResults
        };
        next();

    });
};

module.exports=questionQueryMiddleware;
