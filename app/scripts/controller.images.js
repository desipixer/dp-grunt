app.controller('dpImageCtrl', ["$scope","$stateParams", "service.util","service.post","$http", function($scope,$stateParams, utilService, postService, $http){

	var id = $stateParams.id !== undefined ? $stateParams.id : 'default';
	var postObj = _.filter(utilService.sessionBlog, function(obj) {
		return obj.id == id;
	});
	if(postObj.length > 0){
		postObj[0].images =  _.uniq(postObj[0].images);
	}
	$scope.postObj = postObj.length > 0 ? postObj[0] : [];

	$scope.postContent = postService.generatePostHTML($scope.postObj.images, $scope.postObj.title);

	$scope.publishPost = function(){
		// check for login information and post it to blogger site
		postService.login().then(function(data){
			postService.createPostRequest($scope.postObj, data).then(function(data){
				
				angular.element(document.querySelector('#divPostStatus')).text('POSTED');
				console.log(data);
			}, function(err){
				angular.element(document.querySelector('#divPostStatus')).text('ERROR');
				console.log(err);
			})
		}, function(err){
			console.log(err);
		})
	}

	$scope.goToUrl = function(){
		var url = $scope.postObj.link;
		var win = window.open(url, '_blank');
  		win.focus();
	}

	$scope.shareToGplus = function(){
		var url = "https://plus.google.com/share?url=".concat($scope.postObj.link);
		var win = window.open(url, '_blank', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=600,width=600');
		win.focus();
	}

	$scope.downloadAllImages = function(){
		$scope.postObj.images.forEach(function(value,index){
            var link = document.createElement('a');
            link.href = value;
            link.download = 'Download.jpg';
            document.body.appendChild(link);
            link.click();
		})
	}

	$scope.publishToWordpress = function(){
		// Change Bearer Token manually till you figure out the flow
		var bearerToken = "mja3FL5dcUVKeVF5!$u3IvE6SPZYuVfef)g9cr2Tm0is2F7FMvlCCs(PfWdI0&eP";

		var postUrl = "https://public-api.wordpress.com/rest/v1/sites/109226478/posts/new";
		var postTitle = $scope.postObj.title;
		var postContent = postService.generatePostHTML($scope.postObj.images, $scope.postObj.title);
		$http({
			method: 'POST',
			url : postUrl, 
			data : {
				title : postTitle,
				content : postContent
			},
			headers : {
				"Authorization" : "Bearer "+ bearerToken
			}
		}).success(function(data){
			//$('#wp-status').css('color','green').fadeOut(3000);
			console.log(data);
		}).error(function(err){
			console.log(err);
		})


	}

}]);		