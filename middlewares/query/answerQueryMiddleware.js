const {populateHelper,paginationHelper}=require("./queryMiddlewareHelpers");
const asyncErrorWrapper=require("express-async-handler");

const answerQueryMiddleware=function(model,options){
    return asyncErrorWrapper( async function(req,res,next){
        const {id}=req.params;//*sourunun idsini aldık
        const arrayName="answers";
        const total=(await model.findById(id))["answerCount"];//* bir soruya her yorum geldiğine answerCount içine eklemiştik. oradan bu değeri çektik. direkt model olarak yollarsak o tarafta counta kısmında sıkıntı çıkıyor.
        const paginationResult=await paginationHelper(total,undefined,req);//*sort ve population işlemlerine tabi tutulup geri döndürülen query değerine burada ihtiyacımız yok. çünkü biz burada 
        const startIndex=paginationResult.startIndex;
        const limit=paginationResult.limit;
        //* query.skip metodunu kullanamıyoruz burada. bizim answers isimli bir arrayımız var orada cevaplar tutuluyor.
        //* arryayı parçalayacağız.
        let queryObject={};
        queryObject[arrayName]={$slice:[startIndex,limit]}//* arrayı startIndex ve limit e göre parçaladık slice özelliği ile
        let query=model.find({_id:id},queryObject);//*sorunun idsine göre bulup queryObject e göre cevapları getirecek
        query=populateHelper(query,options.population);
        const queryResult=await query;
        res.queryResults={
            success:true,
            pagination:paginationResult.pagination,
            data:queryResult
        }
        next();

    });
};

module.exports=answerQueryMiddleware;