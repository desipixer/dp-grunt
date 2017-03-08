/**
 * @desc contains all logic related publishing to wordpress site.
 */

app.service('service.publish', ['settings', '$http', function(settings,$http) {
    

    var yqlParser = function(xmlSource){
        return yqlURL = [
            "http://query.yahooapis.com/v1/public/yql",
            "?q=" + encodeURIComponent("select * from xml where url='" + xmlSource + "'"),
            "&format=xml&callback=?"
         ].join("");
    }

    var x2js = new X2JS();

    //function to get XML feeds from wordpress site 
    var getXMLFeedsFromWordPress = function(url){
        url = url || 'https://p0pixer.wordpress.com/feed/atom/?paged=1';
        // try to get the feed using jquery api
        $.ajax({
            url : yqlParser(url),
            type : 'GET',
            dataType : 'json',
            success : function(obj){
                console.log(obj);
                var xmlText = obj.results[0];
                var resultJSON = x2js.xml_str2json(xmlText);
                console.log(resultJSON);
            },
            error : function(err){
                console.log(err);
            }
        })
    }




    return {
        getUrl : getXMLFeedsFromWordPress
    }
}]);