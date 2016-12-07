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