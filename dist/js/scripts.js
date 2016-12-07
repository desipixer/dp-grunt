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
		maxResults : 100,
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

	return {
		getAuthKey : getAuthKey,
		blogger : blogger
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

	return {
		urlForBlogId : urlForBlogId,
		urlForBlogFeed : urlForBlogFeed,
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

	var processBlogObj = function(obj){
		if(obj == undefined){
			return;
		}
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
		return [];
	}

	var searchSite = function(blogUrl){
		return http.get(urlService.urlForBlogId(blogUrl));
	}

	var searchText = function(blogId, keyword){
		debugger;
		var reqUrl = urlService.urlForSearchText(blogId, null, null, keyword);
		return http.jsonp(reqUrl);
	}

	var getEntries = function(blogId, startIndex, maxResults){
		var reqUrl = urlService.urlForBlogFeed(blogId, startIndex, maxResults);
		return http.jsonp(reqUrl);
	}

	return {
		getEntries : getEntries,
		processBlogObj : processBlogObj,
		searchSite : searchSite,
		searchText : searchText,
		sessionBlog : this.sessionBlog
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
        {blogId: "4758457913364204558", blogURL: "http://cinestargallery.blogspot.com/", category: 1}
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

	
app.controller('dpHomeCtrl', ['$scope','service.sites','service.util','settings', function($scope,siteServ, utilServ, settings){
	$scope.title = "Home Page";
	$scope.sites = siteServ.sites;

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
			var processedObj = utilServ.processBlogObj(obj);
			$scope.entries = processedObj;
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
		settings.startIndex -= settings.maxResults;
		var blogId = $scope.selSite.blogId !== undefined ? $scope.selSite.blogId : $scope.selSite ;
		utilServ.getEntries(blogId, settings.startIndex, settings.maxResults).success(function(obj){
			var processedObj = utilServ.processBlogObj(obj);
			$scope.entries = processedObj;
		}).error(function(err){
			console.log(err);
		});
	}

	$scope.getNextPosts = function(){
		settings.startIndex += settings.maxResults;
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
	
}]);

	
app.controller('dpImageCtrl', ["$scope","$stateParams", "service.util","service.post", function($scope,$stateParams, utilService, postService){

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

}]);		