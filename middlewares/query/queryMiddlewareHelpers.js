const searchHelper=(searchKey,query,req)=>{
    if(req.query.search){//*?search=mongodb şeklindeki url var mı? yani search e karşılık gelen filtreleme sözcüğü var mı?
        const searchObject={};

        const regex=new RegExp(req.query.search,"i");//*javascript regex yazıp dökümanlardan baktık. i büyük küçük harfe duyarsız anlamına geliyor.
        searchObject[searchKey]=regex;//*  regex değeri searchObject içine "title" (yani searchKey'e) başlığına attık.
        return query=query.where(searchObject);//*titlea göre arama yaptık. yani title da regex değeri var mı? query içierinsde searchObject değeri var mı?
    }
    return query;
};
const populateHelper=(query,population) => {
    return query.populate(population);
}
const questionSortHelper=(query,req)=>{
     //*Sıralama işlemleri Sort : req.params.sortBy most-answered most-liked
    const sortKey=req.query.sortBy;
    if(sortKey==="most-answered"){//*en fazla cevabı olanı getirir eğer cevap saysı aynı olan varsa onu da güncel olana göre sıralar
        return query.sort("-answerCount");//*büyükten küçüğe en fazla cevabı olan soruları sırala.
    }
    if(sortKey==="most-liked"){
        return query.sort("-likeCount")//*büyükten küçüğe en fazla like olan soruları sırala. eğer like saysı aynı olan varsa onu da güncel olana göre sıralar
    }
        return query.sort("-createdAt");//* en güncel soruya göre sırala
    
}
const paginationHelper=async function(totalDocuments,query,req){
    const page=parseInt(req.query.page)||1;//*sayfa verilmişse alıyoruz verilmemişse 1 default ayarı giriyoruz.
    const limit=parseInt(req.query.limit)||5;//*1 sayfada sadece 5 tane soru göstereceğiz default olarak. limit girildiyse limit kadar.
    //*mongodb veri tabanında ;
    //* skip ve limit metodları vardır. skip kaç tane atlayacağını limit ise kaç tane getireceğini belirler.
    const startIndex=(page-1)*limit;//* diyelim ki 3. sayfadayız ve biz limiti 5 yaptık. 3-1=2*5=10 olur. biz bu değeri skip içine atacağız ki bize 10 dan sonraki değerleri getirsin.
    const endIndex=page*limit;//*bir nevi hangi sayfadaysa limite göre o sayfaya kadar toplam kaç soru getirdiğini biliyoruz.
    const pagination={};
    const total=totalDocuments;//*question içinde kaç tane soru olduğunu getirir.
    if(startIndex>0){
        pagination.previus={
            page:page-1,
            limit:limit
        }
    }
    if(endIndex<total){//*endIndex toplam sorulardan küçükse sonraki sayfa değerlini göster.
        pagination.next={
            page:page+1,
            limit:limit
        }
    }
    return {
        query:query===undefined?undefined: query.skip(startIndex).limit(limit),//*veritananında skip ve limite uygun olarak soruları getir.query undefined ise return undefined değilse : ten sonrasını dön
        pagination:pagination,
        startIndex,//*bunlar answerQueryMiddlewaresi için burada bunları gönderiyoruz. answerQueryMiddleware'de arrayı parçaladığımızda lazım edecek.
        limit
    };


    //*1 2 3 4 5 6 7 8 9 10 10 adet sorumuz olsun
    //*page=2, limit=5- startIndex=5, endIndex=10 endIndex toplam soru sayısından küçükse gösterilecek soru var demektir. startIndex 0 dan büyükse önceki sayfa var demektir.



}
module.exports={
    searchHelper,
    populateHelper,
    questionSortHelper,
    paginationHelper
}