app.controller('dpWordPressCtrl', ['$scope','service.sites','service.util','settings','$http', '$interval', 'service.post','service.url',
 function($scope,siteServ, utilServ, settings, $http, $interval, postService, urlService){
	$scope.title = "Wordpress Page";
	$scope.sites = siteServ.sites;
	$scope.startIndex = settings.startIndex;
	$scope.totalItems = 0;
	$scope.allEntries = [];
	//var wpBlodId = "109226478";
	//var wpBlogId = "121469346";
	//var wpBlogId = "123309558"; // desipixerz.wordpress.com --unused
	//var wpBlogId = "123360170"; //desipixercelebsnext.wordpress.com
	var wpBlogId = "123467412"; //desipixersblog.wordpress.com
	if(utilServ.sessionBlog.length > 0){
		$scope.entries = utilServ.sessionBlog;
	} else {
		utilServ.getEntries(null, settings.startIndex, settings.maxResults).success(function(obj){
			var processedObj = utilServ.processBlogObj(obj);
			$scope.entries = processedObj;
		}).error(function(err){
			console.log(err);
		});
	}

	$scope.selSiteChange = function(){
		utilServ.getEntries($scope.selSite, null, null).success(function(obj){
			$scope.totalEntries = obj.feed.entry.length;
			var processedObj = utilServ.processBlogObj(obj);
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
			$scope.totalItems = obj.posts.totalItems;
			//console.log(obj);
			$scope.selSiteChange();
			var blogObj = {
			    "blogId": obj.id,
			    "blogURL": $scope.txtSearchSite,
			    "category": 1
			};
			console.log(blogObj);

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

	$scope.getUniqueImages = function(arr){
		return _.uniq(arr);
	}

	$scope.shuffleArray = function(){
		utilServ.sessionBlog = $scope.entries = _.shuffle($scope.entries);
	}


	$scope.getWPAuth = function(){
		var authUrl = "https://public-api.wordpress.com/oauth2/authorize?client_id=51005&redirect_uri=https://desipixer.github.io/dp-grunt/dist&response_type=token";
		var postUrl = "https://public-api.wordpress.com/rest/v1/sites/"+wpBlogId+"/posts/new";

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

	function randomIntFromInterval(min,max)
	{
	    return Math.floor(Math.random()*(max-min+1)+min);
	}


	$scope.postAllToWordpress = function(allEntries){
		console.log("postAllToWordpress called");
		//check if limit posts is enabled or not
		if($scope.isLimitedPosts){
			var start = parseInt($scope.postStartIndex) || 0;
			var end = parseInt($scope.postEndIndex) || allEntries.length;
			$scope.allEntries = $scope.allEntries.slice(start, end + 1);
		}

		// get all images and post to wordpress
		var i= $scope.allEntries.length - 1;	
		var x = $scope.allEntries.length;

		setInterval(function() {

		    if (x > 0) {
		        postEntry($scope.allEntries[i--], i);
		    }

		    else return;

		    x--;
		}, randomIntFromInterval(400,500));


	}


	function postEntry(postObj, i){	
		//var bearerToken = "mja3FL5dcUVKeVF5!$u3IvE6SPZYuVfef)g9cr2Tm0is2F7FMvlCCs(PfWdI0&eP";
		//var bearerToken = "^pvzCZ%pm$QRIJ0BY2NnAJwCiWHPrCSPw*20DAhqV2zH&YWmx2txh*X!EecZ4Y%N";
		var bearerToken = "4BVRUrXrinfdjPqaLPBRkpWhkSTXas)5^$Wl3b50%kHj4SD85VZh&TXyNGKWtjYJ";
		var postUrl = "https://public-api.wordpress.com/rest/v1/sites/"+ wpBlogId+"/posts/new";
		var postTitle = postObj.title;
		var postContent = postService.generatePostHTML(postObj.images, postObj.title);
		// Ignore any posts with less than 2 images. Most probably it will be bogus/ spam
		//var randomNumber = randomIntFromInterval(800,1000);
		var randomNumber = randomIntFromInterval(3000,6000);
		if(postObj.images.length > 1){
			postWithRandomIntervals(randomNumber, postTitle, postContent, postUrl, bearerToken, i);
		}
	}

	function postWithRandomIntervals(seconds, title, content, postUrl, bearerToken, postCount){
		setTimeout(function(){
			console.log("Seconds "+ seconds);
				$http({
					method: 'POST',
					url : postUrl, 
					data : {
						title : title,
						content : content
					},
					headers : {
						"Authorization" : "Bearer "+ bearerToken
					}
				}).success(function(data){
					//$('#wp-status').css('color','green').fadeOut(1000);
					
					console.log("Posted Item :"+ postCount);
					console.log(data);
				}).error(function(err){
					console.log(err);
				})
			}, seconds);
		}


	$scope.postAll = function(){
		//get all posts from the blog and post to wordpress using bearer token of wordpress.

		//get total posts of the blog
		var entries = [];
		var tempStartIndex = 1;
		var totalItems = $scope.totalItems;
		console.log("selSite : "+ $scope.selSite);
		console.log("totalItems : "+ $scope.totalItems);
		getPostArray($scope.selSite, 1, totalItems, entries, true);

	}

	function getPostArray(blogId, startIndex, totalItems, entries, isPostAll){
		var feedUrl = urlService.urlForBlogFeed(blogId, startIndex, 500);
		$http.jsonp(feedUrl).success(function(obj){
			var entryArray = obj.feed.entry;
			entries = entries.concat(entryArray);
			if(startIndex < totalItems){
				// increment startIndex and call this function again
				startIndex += 500;
				console.log("startIndex : "+ startIndex);
				console.log("entries length : "+ entries.length)
				getPostArray(blogId, startIndex, totalItems, entries, isPostAll);
			} else {
				// this function is finished
				console.log(entries.length);
				console.log(entries[0]);
				// minor changes to $scope.entries, since it hangs the page.

				//$scope.entries = utilServ.processBlogEntries(entries);
				var allEntriesArray = $scope.allEntries = utilServ.processBlogEntries(entries);
				if(isPostAll == true){
					$scope.postAllToWordpress(allEntriesArray);
				}
				
			}
		}).error(function(err){
			console.log('err: '+ err)
		})
	}

	$scope.getAllPosts = function(){
		var entries = [];
		var totalItems = $scope.totalItems;
		getPostArray($scope.selSite, 1, totalItems, entries, false);
	}

	$scope.ran_col = function() { //function name
                var color = '#'; // hexadecimal starting symbol
                var letters = ['000000','FF0000','00FF00','0000FF','FFFF00','00FFFF','FF00FF','C0C0C0']; //Set your colors here
                color += letters[Math.floor(Math.random() * letters.length)];
                document.getElementById('page-title').style.background = color; // Setting the random color on your div element.
            }
	
	
}]);

	