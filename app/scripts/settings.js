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
		maxResults : 500,
		maxApiFeedResults : 500,
		startIndex : 1,
		blogName : "http://www.dp.in",
		blogId : "7833828309523986982",
		publish : publish
	}
});