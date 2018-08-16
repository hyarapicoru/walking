$(document).ready(function(){   
    var urlPrm = new Object;
    var urlSearch = location.search.substring(1).split("&");
    for(i=0;urlSearch[i];i++){
        var kv = urlSearch[i].split('=');
        urlPrm[kv[0]] = kv[1];
    }

    var count = parseInt(urlPrm.count);
    if(urlPrm.count < 20){
        $("#header").text("ポンコツ(笑)");    
    }else if(urlPrm.count < 30){
        $("#header").text("普通");  
    }else if(urlPrm.count < 40){
        $("#header").text("まあまあ");  
    }else if(urlPrm.count < 50){
        $("#header").text("すごい");
    }else if(urlPrm.count > 50){
        $("#header").text("神");
    }
});