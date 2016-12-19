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