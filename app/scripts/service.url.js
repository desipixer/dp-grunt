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