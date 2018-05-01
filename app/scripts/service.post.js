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

	var generateForumContent = function(imgArray, title){
		var str = "";
		if(imgArray.length > 0){
			imgArray.forEach((v,i) => {
				str += `[IMG]${v}[/IMG]`;
			});
		}
		return str;
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
		generatePostHTML : generatePostHTML,
		generateForumContent : generateForumContent
	}

}])