app.controller('dpWpPublishCtrl', ['$scope','service.publish', function($scope, publishService){

    $scope.getWordpressFeed = function(){
        var url = $scope.wordpressUrl;
        if(url){
            publishService.getUrl(url);
        } else {
            console.log("Invalid Url, getting default Url");
            publishService.getUrl();
        }
    }
}])