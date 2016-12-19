app.controller('dpHomeCtrl', ['$scope','service.sites','service.util','settings','$http', '$interval', 'service.post', function($scope,siteServ, utilServ, settings, $http, $interval, postService){
	$scope.title = "Home Page";
	$scope.sites = siteServ.sites;
	$scope.startIndex = settings.startIndex;

	if(utilServ.sessionBlog.length > 0){
		$scope.entries = utilServ.sessionBlog;
	} else {
		utilServ.getEntries(null, settings.startIndex, settings.maxResults).success(function(obj){
			var processedObj = utilServ.processBlogObj(obj, 1);
			$scope.entries = processedObj;
		}).error(function(err){
			console.log(err);
		});
	}

	$scope.selSiteChange = function(){
		var category = _.filter(siteServ.sites, function(site){
			
			return site.blogId == $scope.selSite;
		});
		if(category){
			category = category[0].category;
		}
		console.log("blog category "+ category);

		utilServ.getEntries($scope.selSite, null, null, category).success(function(obj){
			
			
			//$scope.totalEntries = obj.feed.entry !== undefined ? obj.feed.entry.length || 0;;
			var processedObj = utilServ.processBlogObj(obj, category);
			$scope.entries = processedObj;	
			//console.log($scope.entries);
		}).error(function(err){
			console.log(err);
		});
	}

	$scope.searchSite = function(){
		utilServ.searchSite($scope.txtSearchSite).success(function(obj){
			//console.log(obj);
			$scope.selSite = obj.id;
			$scope.selSiteChange();
			var blogObj = {
			    "blogId": obj.id,
			    "blogURL": $scope.txtSearchSite,
			    "category": 1
			};
			console.log(blogObj.toString());

		}).error(function(err){
			console.log("Error during searching site : "+ err);
		})
	}

	$scope.searchKeyWords = function(){
		var blogId = $scope.selSite.blogId !== undefined ? $scope.selSite.blogId : $scope.selSite ;
		utilServ.searchText(blogId, $scope.txtSearch).success(function(obj){
			var processedObj = utilServ.processBlogObj(obj);
			$scope.entries = processedObj;
		});
	}

	$scope.getPreviousPosts = function(){
		if(settings.startIndex <= 1){
			return;
		}
		$scope.startIndex= settings.startIndex -= settings.maxResults;
		var blogId = $scope.selSite.blogId !== undefined ? $scope.selSite.blogId : $scope.selSite ;
		utilServ.getEntries(blogId, settings.startIndex, settings.maxResults).success(function(obj){
			var processedObj = utilServ.processBlogObj(obj);
			$scope.entries = processedObj;
		}).error(function(err){
			console.log(err);
		});
	}

	$scope.getNextPosts = function(){
		$scope.startIndex = settings.startIndex += settings.maxResults;
		var blogId = $scope.selSite.blogId !== undefined ? $scope.selSite.blogId : $scope.selSite ;
		utilServ.getEntries(blogId, settings.startIndex, settings.maxResults).success(function(obj){
			var processedObj = utilServ.processBlogObj(obj);
			$scope.entries = processedObj;
		}).error(function(err){
			console.log(err);
		});
	}

	$scope.titleSort = function(){
		utilServ.sessionBlog = $scope.entries =  _.sortBy($scope.entries, function(obj){
			return obj.title;
		});
	}

	$scope.shuffleArray = function(){
		utilServ.sessionBlog = $scope.entries = _.shuffle($scope.entries);
	}


	$scope.getWPAuth = function(){
		var authUrl = "https://public-api.wordpress.com/oauth2/authorize?client_id=51005&redirect_uri=https://desipixer.github.io/dp-grunt/dist&response_type=token";
		var postUrl = "https://public-api.wordpress.com/rest/v1/sites/109226478/posts/new";

		$http({
			method: 'POST',
			url : postUrl, 
			data : {
				title : "Hi-Title-New"
			},
			headers : {
				"Authorization" : "Bearer mja3FL5dcUVKeVF5!$u3IvE6SPZYuVfef)g9cr2Tm0is2F7FMvlCCs(PfWdI0&eP"
			}
		}).success(function(data){
			console.log(data);
		}).error(function(err){
			console.log(err);
		})
		//window.location = authUrl;
	}


	$scope.postAllToWordpress = function(){
		// get all images and post to wordpress
		var entryArray = $scope.entries;
		var i= $scope.entries.length - 1;	
		var x = $scope.entries.length;

		setInterval(function() {

		    if (x > 0) {
		        postEntry($scope.entries[i--], i);
		    }

		    else return;

		    x--;
		}, 200);


	}


	function postEntry(postObj, i){	
		var bearerToken = "mja3FL5dcUVKeVF5!$u3IvE6SPZYuVfef)g9cr2Tm0is2F7FMvlCCs(PfWdI0&eP";
		var postUrl = "https://public-api.wordpress.com/rest/v1/sites/109226478/posts/new";
		var postTitle = postObj.title;
		var postContent = postService.generatePostHTML(postObj.images, postObj.title);
		// Ignore any posts with less than 2 images. Most probably it will be bogus/ spam
		if(postObj.images.length > 1){
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
				//$('#wp-status').css('color','green').fadeOut(1000);
				
				console.log("Posted Item :"+ i);
				console.log(data);
			}).error(function(err){
				console.log(err);
			})
		}
		
	}

	$scope.shareToGplus = function(postObj){
		console.log(postObj);
		var url = "https://plus.google.com/share?url=".concat(postObj.link);
		var win = window.open(url, '_blank', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=600,width=600');
		win.focus();
	}

	//angular.element(document.getElementsByClassName('.thumb-img')).css('width', '100px');
	
	
}]);

	