var app = angular.module('dpApp',['ui.router']);

app.config(['$stateProvider','$urlRouterProvider', function(stateProvider, urlProvider){
	urlProvider.otherwise('/home');

	stateProvider
		.state('home', {
			url : '/home',
			templateUrl : 'pages/home.html',
			controller : 'dpHomeCtrl'
		})
		.state('404', {
			url : '/404',
			templateUrl : 'pages/404.html'
		})
		.state('membersList', {
			url : '/members-list',
			templateUrl : 'pages/members-list.html'
		})
		.state('aboutUs', {
			url : '/about-us',
			templateUrl : 'pages/about-us.html'
		})
		.state('images', {
			url : '/images/:id',
			templateUrl : 'pages/images.html',
			controller : 'dpImageCtrl'
		})
		.state('wordpress', {
			url : '/wordpress',
			templateUrl : 'pages/wordpress.html',
			controller : 'dpWordPressCtrl'
		})
}])
app.service('service.main', function(){
	var names = ["Senthil", "Kumar"];
	return {
		names : names
	}
})
//service.util.js
app.service('settings', function(){
	var publish = {
		sites : [
			{
				"blogId": "7833828309523986982",
				"blogURL": "http://www.desipixer.in/",
				"category": 1
			}
		]
	}
	return {
		maxResults : 400,
		maxApiFeedResults : 500,
		startIndex : 1,
		blogName : "http://www.dp.in",
		blogId : "7833828309523986982",
		publish : publish
	}
});
//service.util.js
app.service('service.auth', ["$q", function($q){

	// contains method for authentication
	var authKey = "AIzaSyAb3tFTPvsduIR2xopIVpYhwKMQ5ac_5Po";
	var clientSecret = "215192364453-1vbjuf6f3r0vka9b5q0hj2mqj212dr9o.apps.googleusercontent.com";

	var getAuthKey = function(){
		return authKey;
	}

	var deferred = $q.defer();

	var blogger = {
		getKey : function(){
			return authKey;
		},
		getClientSecret : function(){
			return clientSecret;
		},
		logMeIn : function(){
			var key = this.getKey();
			var parameters = {
				client_id : this.getClientSecret(),
				immediate : false, 
				response_type : "token",
				scope : "http://www.blogger.com/feeds/"
			};
			gapi.auth.authorize(parameters,this.callbackFn);
		},
		callbackFn : function(data){
			this.accessToken = data.access_token;
			deferred.resolve(data);
		},
		getToken : function(){
			this.logMeIn();
			return deferred.promise;
		},
		getAuthToken : function(data){
			if(data != null){
				return "Bearer ".concat(data.access_token);
			} else {
				return null;
			}
		},
		accessToken : null
	}

	var wordpressKeys = function(){
		var keyArray = [
			{
				"k" : "n75l%!FgW4QYGo(d)txM(vET*x)Vz&4#eOiA$&Bu2dESBF6SYJXA$a3LAmmD*6Fd",
				"id" : "123529464",
				"url" : "http://desipixer4all.wordpress.com"
			},
			{
				"k" : "563pl9%SbhQxr!1cF*fBffoY(7uVLbnhqaD39EEd^qxLNBZ9@S$$2yH3(M4dHqH(",
				"id" : "123532018",
				"url" : "http://p4pixer.wordpress.com"
			}
		];
		return keyArray;
	}	

	return {
		getAuthKey : getAuthKey,
		blogger : blogger,
		wpKeys : wordpressKeys
	}
}]);
//service.util.js
app.service('service.url', ['$http', "service.auth","settings", function(http, authService, settings){

	var objToString = function(obj){
		if(obj == null){
			return;
		}
		var str = "?";
		Object.keys(obj).forEach(function(value,index){
			str += value.concat("=").concat(obj[value]).concat("&");
		})
		return str.substring(0, str.length - 1);
	}

	// construct url to get blog id if URL is given as input
	var urlForBlogDetails = function(id){
		id = id !== null ? id : settings.blogId;
		return "https://www.googleapis.com/blogger/v3/blogs/".concat(id).concat("/posts?fetchImages=true&key=").concat(authService.getAuthKey());
	}

	var	urlForBlogFeed = function(id ,startIndex, maxResults){
		startIndex = startIndex !== null ? startIndex : settings.startIndex;
		maxResults = maxResults !== null ? maxResults : settings.maxResults;
		id = id !== null ? id : settings.blogId;
		var qs = {
			"start-index" : startIndex,
			"max-results" : maxResults,
			"alt" : "json",
			"callback" : "JSON_CALLBACK"
		}
		return "https://www.blogger.com/feeds/".concat(id).concat("/posts/default").concat(objToString(qs));
	}

	var urlForBlogId = function(blogName){
		var qs = {
			key : authService.getAuthKey(),
			url : blogName
		}
		return "https://www.googleapis.com/blogger/v3/blogs/byurl".concat(objToString(qs));
	}

	var urlForSearchText = function(id, startIndex, maxResults, keyword){
		if(keyword == undefined || keyword == ""){
			return urlForBlogFeed(id, startIndex,maxResults);
		}
		startIndex = startIndex !== null ? startIndex : settings.startIndex;
		maxResults = maxResults !== null ? maxResults : settings.maxResults;
		id = id !== null ? id : settings.blogId;
		var qs = {
			"start-index" : startIndex,
			"max-results" : maxResults,
			"q" : keyword,
			"alt" : "json",
			"callback" : "JSON_CALLBACK"
		}
		return "https://www.blogger.com/feeds/".concat(id).concat("/posts/default").concat(objToString(qs));
	}

	var getPostUrl = function(blogId){
		return "https://www.googleapis.com/blogger/v3/blogs/".concat(blogId).concat("/posts");
	}

	var getApiFeedUrl = function(blogId, pageToken){
		blogId = blogId || "7833828309523986982";
		var baseUrl = "https://www.googleapis.com/blogger/v3/blogs/"+ blogId +"/posts";
		if(pageToken){
			var qs = {
				fetchImages : true,
				key : authService.getAuthKey(),
				maxResults : settings.maxApiFeedResults,
				pageToken : pageToken
			}
			return baseUrl.concat(objToString(qs));
		} 
		var apiFeedUrl = "https://www.googleapis.com/blogger/v3/blogs/"+ blogId +"/posts?fetchImages=true&key=AIzaSyBZvR46qyUilZ6Fl5vn9oPnLZtYHnqSknE&maxResults=500";
		return apiFeedUrl;
	}

	return {
		urlForBlogId : urlForBlogId,
		urlForBlogFeed : urlForBlogFeed,
		getApiFeedUrl : getApiFeedUrl,
		urlForBlogDetails : urlForBlogDetails,
		urlForSearchText : urlForSearchText,
		objToString : objToString,
		getPostUrl : getPostUrl
	}
}]);
//service.util.js
app.service('service.util', ['$http','settings','service.url', function(http, settings, urlService){

	 this.sessionBlog = [];
	// filter images from HTML content and return as array
	var filterImages = function(htmlContent){
		var imgArray = [];
        var imgTags = htmlContent.match(/<img\s[^>]*?src\s*=\s*['\"]([^'\"]*?)['\"][^>]*?>/g);
        if(imgTags != undefined && imgTags.length > 0){
            imgTags.forEach(function(value,index){
            	var imgURL = value.match(/(https?:\/\/.*\.(?:png|jpg))/ig);
            	if(imgURL != undefined && imgURL.length > 0){

            	    /* get large images if it is a blogger site images */
            	    if(imgURL[0].indexOf("blogspot.com") !== -1){
            	        var imgSplit = imgURL[0].split('/');
            	        var imgRes = imgSplit.splice(imgSplit.length - 2,1);
            	        largeIMG = imgURL[0].replace(imgRes,"s1600");
            	        
            	        imgArray.push(largeIMG);
            	    }
            	}
            });
        }
        return imgArray;
	}

	

	var processBlogObj = function(obj, category){
		if(obj == undefined){
			return;
		}
		
		category = category || 1;
		if(category == 1){
			if(obj.hasOwnProperty('feed')){
				if(obj.feed.hasOwnProperty('entry')){
					// print number of entries
					console.log("Entries : "+ obj.feed.entry.length);
					// start processing individual entries
					var resultArr = [];
					var entryArr = obj.feed.entry;
					entryArr.forEach(function(value,index){
						var obj = {};
						obj.title = (value.title.$t !== undefined) ? value.title.$t : null;
						obj.link = (value.link !== undefined) ? value.link[value.link.length - 1].href : null;
						obj.id = (value.id.$t !== undefined) ? value.id.$t.match(/\d+/g)[1].concat("-").concat(value.id.$t.match(/\d+/g)[2]) : null;
						obj.images = (value.content.$t !== undefined) ? filterImages(value.content.$t) : [];
						obj.thumb = (obj.images.length !== 0) ? obj.images[0].replace('s1600','s480') : [];
						obj.published = value.published.$t;
						obj.updated = value.published.$t;

						resultArr.push(obj);
					});
					this.sessionBlog = resultArr;
					return resultArr;
				}
			}
		} else if (category == 2){
			//console.log(obj);
			var resultArr = [];
			// process feed api obj
			var entryArr = obj.items;
			console.log("Entries : "+ obj.items.length);
			// from feed api
			entryArr.forEach(function(value,index){
				if(value != undefined){
					//console.log(value);
					var obj = {};
					obj.title = value.title;
					obj.images = filterImages(value.content);
					obj.thumb = JSON.parse(JSON.stringify(obj.images).replace(/s1600/g,"s480"))[0]; //can be memory intensive
					obj.id = value.id;
					obj.published = (new Date(value.published)).getTime();
					obj.updated = (new Date(value.updated)).getTime();
					obj.link = value.url;
					
					resultArr.push(obj);
				}
			});
			
			this.sessionBlog = resultArr;
			return resultArr;
		}
		
		return [];
	}

	var processBlogEntries = function(entryArr, category){
		var resultArr = [];
		if(entryArr.length == 0){
			return [];
		}
		if(entryArr == undefined){
			return [];
		}
		category = category || 1;
		if(category == 1){
			entryArr.forEach(function(value,index){
				if(value !== undefined){
					var obj = {};
					obj.title = (value.title.$t !== undefined) ? value.title.$t : null;
					obj.link = (value.link !== undefined) ? value.link[value.link.length - 1].href : null;
					obj.id = (value.id.$t !== undefined) ? value.id.$t.match(/\d+/g)[1].concat("-").concat(value.id.$t.match(/\d+/g)[2]) : null;
					obj.images = (value.content.$t !== undefined) ? filterImages(value.content.$t) : [];
					obj.thumb = (obj.images.length !== 0) ? obj.images[0].replace('s1600','s480') : [];
					obj.published = value.published.$t;
					obj.updated = value.published.$t;

					resultArr.push(obj);
				}
				
			});
		} else if(category == 2){
			// from feed api
			if(value != undefined){
				var obj = {};
				obj.title = value.title;
				obj.images = filterImages(value.content);
				obj.thumb = JSON.parse(JSON.stringify(obj.images).replace(/s1600/g,"s320")); //can be memory intensive
				obj.id = value.id;
				obj.published = (new Date(value.published)).getTime();
				obj.updated = (new Date(value.updated)).getTime();
				obj.link = value.url;
				return obj;

				resultArr.push(obj);
			}
			
		}
		
		this.sessionBlog = resultArr;
		return resultArr;
	}

	var searchSite = function(blogUrl){
		return http.get(urlService.urlForBlogId(blogUrl));
	}

	var searchText = function(blogId, keyword){
		//debugger;
		var reqUrl = urlService.urlForSearchText(blogId, null, null, keyword);
		return http.jsonp(reqUrl);
	}

	var getEntries = function(blogId, startIndex, maxResults, category){
		category = category || 1;
		if(category == 1){
			var reqUrl = urlService.urlForBlogFeed(blogId, startIndex, maxResults);
			return http.jsonp(reqUrl);
		}
		else if (category == 2){
			var reqUrl = urlService.getApiFeedUrl(blogId, null);
			return http.get(reqUrl);
		}
	}

	return {
		getEntries : getEntries,
		processBlogObj : processBlogObj,
		searchSite : searchSite,
		searchText : searchText,
		sessionBlog : this.sessionBlog,
		processBlogEntries : processBlogEntries
	}
}]);
app.service('service.sites', function(){
	/* returns default list of sites */
	var sites = [
		{
		    "blogId": "7833828309523986982",
		    "blogURL": "http://www.desipixer.in/",
		    "category": 1
		},
		{
		    "blogId": "3079987222818050451",
		    "blogURL": "http://movies.cinema65.com/",
		    "category": 1
		},
		{
		    "blogId": "4846859112009281783",
		    "blogURL": "http://rockingfunimages.blogspot.com/",
		    "category": 1
		},
		{
		    "blogId": "719302156971941098",
		    "blogURL": "http://hq-bollywood.blogspot.com/",
		    "category": 1
		},
		{
		    "blogId": "1579799827781024268",
		    "blogURL": "http://www.telugupeopleadda.com/",
		    "category": 1
		},
		{
		    "blogId": "5935905342569794143",
		    "blogURL": "http://sabhothimages.blogspot.com/",
		    "category": 1
		},
		{
		    "blogId": "3293309843232706023",
		    "blogURL": "http://www.searchtamilmovies.com/",
		    "category": 1
		},
		{
		    "blogId": "2951969169923408846",
		    "blogURL": "http://fultohot.blogspot.com/",
		    "category": 1
		},
		{
		    "blogId": "4846859112009281783",
		    "blogURL": "http://www.celebsnext.com/",
		    "category": 2
		},
		{blogId: "4040041419446016295", blogURL: "http://cinewaaradhi.blogspot.com", category: 1},
		{blogId: "2222622162581355396", blogURL: "http://www.tufan9.com/", category: 1},
		{blogId: "5338625676592862668", blogURL: "http://cinytown.blogspot.com/", category: 1},
        {blogId: "3430584311590741572", blogURL: "http://tollywoodboost.blogspot.com/", category: 1},
        {blogId: "5186853171678363994", blogURL: "https://latestmovieimagess.blogspot.com", category: 1},
        {blogId: "4758457913364204558", blogURL: "http://cinestargallery.blogspot.com/", category: 1},
        {blogId: "3512841850294928870", blogURL: "http://bollywoodtadkamasala.blogspot.com/", category: 2}
	];

	return {
		sites : sites
	}
});
app.service('service.post', ["service.auth", "service.util", "service.url", "$http", "$q", "settings", function(auth, utilService, urlService, $http, $q, settings){
	//post service

	var generatePostHTML = function(imgArray, title){
		var htmlStr = "";
		if(imgArray.length > 0){
			var imgTitle = title;
			htmlStr = "<div>";
			imgArray.forEach(function(value,index){
				htmlStr = htmlStr.concat("<img src='").concat(value).concat("' title='").concat(imgTitle).concat("' class='desipixer' />");
			});
			htmlStr += "</div>";
		}
		return htmlStr;
	}

	var login = function(){
		console.log('called login service');
		return auth.blogger.getToken();
	}

	var loggedIn = function(){
		return auth.blogger.accessToken();
	}

	var createPostRequest = function(postObj, accessToken){
		var title = postObj.title;
		var imgArray = postObj.images;	
		var htmlStr = generatePostHTML(imgArray, title);

		return getPostObj(htmlStr, title, accessToken);
	}

	var getPostObj = function(htmlStr, title, accessToken){
		var blogId = settings.publish.sites[0].blogId;
		var url = urlService.getPostUrl(blogId);
		var ajaxData = {
			"content" : htmlStr,
			"title" : title
		};

		var data = "";

		var config = {
			headers : {
				'Authorization' : auth.blogger.getAuthToken(accessToken)
			}
		}

		return publishPost(url, ajaxData, config);
	}

	var publishPost = function(url, data, config){
		var deferred = $q.defer();
		$http.post(url,data,config).success(function(data,status){
			deferred.resolve(data);
		}).error(function(err){
			console.log(err);
		});
		return deferred.promise;
	}


	return {
		getPostObj : getPostObj,
		createPostRequest : createPostRequest,
		loggedIn : loggedIn,
		login : login,
		publishPost : publishPost,
		generatePostHTML : generatePostHTML
	}

}])
//third party libraries implementations

var clipboard = new Clipboard('.btn');


document.onkeydown = function(event){
	if(event.keyCode == 8  && (e.target.tagName != "TEXTAREA") && (e.target.tagName != "INPUT")) { 
		event.preventDefault();
		history.back(-1);
	}	

}
app.directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.ngEnter);
                });
 
                event.preventDefault();
            }
        });
    };
});



app.controller('dpMainCtrl', ['$scope','service.sites','service.main', function($scope,siteServ, mainServ){
	$scope.sites = siteServ.sites;
	$scope.names = mainServ.names;

}]);

	
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

	
app.controller('dpWordPressCtrl', ['$scope','service.sites','service.util','settings','$http', '$interval', 'service.post','service.url', 'service.auth',
 function($scope,siteServ, utilServ, settings, $http, $interval, postService, urlService, authService){
	$scope.title = "Wordpress Page";
	$scope.sites = siteServ.sites;
	$scope.startIndex = settings.startIndex;
	$scope.totalItems = 0;
	$scope.allEntries = [];
	var wpSettings = {
		errCount : 10
	}
	var wordpressKeys = authService.wpKeys();
	console.log(wordpressKeys);
	//var wpBlodId = "109226478";
	//var wpBlogId = "121469346";
	//var wpBlogId = "123309558"; // desipixerz.wordpress.com --unused
	//var wpBlogId = "123360170"; //desipixercelebsnext.wordpress.com
	//var wpBlogId = "123467412"; //desipixersblog.wordpress.com
	var targetBlog = wordpressKeys[1];
	var wpBlogId = targetBlog.id;
	var bearerToken	= targetBlog.k;

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
		//var i= $scope.allEntries.length - 1;	
		//var x = $scope.allEntries.length;

		/*setInterval(function() {

		    if (x > 0) {
		        postEntry($scope.allEntries[i--], i);
		    }

		    else return;

		    x--;
		}, randomIntFromInterval(600,1000));*/

		console.log("TOTAL ENTRIES TO POST : "+ allEntries.length);
		/** Go with Synchronous posting, since they are blocking the site */
		syncPostToWP(allEntries, 0, allEntries.length - 1);
	}


	function postEntry(postObj, i){	
		var postUrl = "https://public-api.wordpress.com/rest/v1/sites/"+ wpBlogId+"/posts/new";
		var postTitle = postObj.title;
		var postContent = postService.generatePostHTML(postObj.images, postObj.title);
		// Ignore any posts with less than 2 images. Most probably it will be bogus/ spam
		var randomNumber = randomIntFromInterval(5000,7000);
		if(postObj.images.length > 1){
			postWithRandomIntervals(randomNumber, postTitle, postContent, postUrl, bearerToken, i);
		}
	}

	/** Synchronously post to wordpress blog */
	function syncPostToWP(entries,startIndex, endIndex){
		if(entries.length < 0){
			console.log("syncPostToWP() >> Entries are empty");
			return;
		}
		/** If array is sorted, then sort the entire array based on title and return to user */
		if($scope.isSorted){
			console.log("syncPostToWP() >> sorting Entires array");
			entries = _.sortBy(entries, function(obj){
				return obj.title;
			})
		}

		/** check if start and end index are greater than 0 */
		if(startIndex !== undefined && endIndex !== undefined){
			console.log("PROCESSING SYNCHRONOUS POSTING");
			postEntriesSync(entries, startIndex, endIndex);
		}
	}

	/** actual http request will be made here */
	function postEntriesSync(entries, start, end){
		var i = end;
		if(i < start){
			return;
		}
		var postUrl = "https://public-api.wordpress.com/rest/v1/sites/"+ wpBlogId +"/posts/new";
		var postTitle = entries[i].title;
		var postContent = postService.generatePostHTML(entries[i].images, entries[i].title);
		// make sync http requests 
		$http({
			method : 'POST',
			url : postUrl,
			data : {
				title : postTitle,
				content : postContent
			},
			headers : {
				"Authorization" : "Bearer "+ bearerToken
			}
		}).success(function(obj){
			console.log("postEntriesSync() >> POSTED : "+ i);
			console.log(obj);
			postEntriesSync(entries, start, --end);
		}).error(function(err){
			++wpSettings.errCount;
			console.log("postEntriesSync() >> ERROR :"+ err);
			// Allow only max of 10 errors in code
			if(wpSettings.errCount < 15 ){
				postEntriesSync(entries, start, --end);
			}
			
		});

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