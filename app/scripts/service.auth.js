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
				"k" : "!ZTen(MhUi@H88AUTRgN$Flo%ihcp6UQKr5V!Z1c%CyL@ww0FT9Yv1EAgyx95Svq",
				"id" : "125064500",
				"url" : "http://p9pixer.wordpress.com"
			},{
				"k" : "An%QTst2!ZXhN5WmKSQpzlxtMY9Uz1QEA3l97DcBfvj9fOFkr@mUBXl)$eq!3l9P",
				"id" : "125169089",
				"url" : "http://p10pixer.wordpress.com"
			},{
				"k" : "AsaG&73bWRNm5%s2QT3PLEwRA34c#JRXVxImzZKOOWZ^*Q4WJAMXb3QpVS1%WoJn",
				"id" : "125295464",
				"url" : "http://p11pixer.wordpress.com"
			}
		];
		return keyArray;
	}	

	var obseleteKeys = [
		{
			"k" : "n75l%!FgW4QYGo(d)txM(vET*x)Vz&4#eOiA$&Bu2dESBF6SYJXA$a3LAmmD*6Fd",
			"id" : "123529464",
			"url" : "http://desipixer4all.wordpress.com"
		},
		{
			"k" : "563pl9%SbhQxr!1cF*fBffoY(7uVLbnhqaD39EEd^qxLNBZ9@S$$2yH3(M4dHqH(",
			"id" : "123532018",
			"url" : "http://p4pixer.wordpress.com"
		},
		{
			"k" : "3lfaVOM2Exp*7lHRzd1Itg2CsR6ZdgHYfe8qJAY#^jxA#)lV26jXBP^AKFJNG!8X",
			"id" : "123584701",
			"url" : "http://p1pixer.wordpress.com"
		},
		{
			"k" : "KiaJ52r1&LYzcXv!IKw!r^z6*r&oR&KyA0SYs9aM%$Hu^gWed2PQP25z@Pzf#8@j",
			"id" : "123589156",
			"url" : "http://p2pixer.wordpress.com"
		},
		{
			"k" : "ooqaYu5!1NAR@JKR0Nmh%EBDoOThmESBqYSuEPY2MtzY#ZzO$9rDJg9a@eeVk1Nk",
			"id" : "123997120",
			"url" : "http://p3pixer.wordpress.com"
		},
		{
			"k" : "uz956XTL!N!dS5)&Ym^I@0kl#@&!bp!9ZjxjMd*Mjp!vnQPOi%HZyt#W9R!M!)2u",
			"id" : "124016517",
			"url" : "http://p5pixer.wordpress.com"
		},
		{
			"k" : "nh(r%rMY&26F8l!&rP4^P0GhrK@0O^N(FG0TvmwA0fxcS529dUu(Xcgcc#CHdNZm",
			"id" : "124210679",
			"url" : "http://p6pixer.wordpress.com"
		},
		{
			"k" : "wENBN7RDts1AaQC0HaItfwb3a5L1wu24aSrqIEptF3qmekJiCyLa*WGElnlvn3c&",
			"id" : "124264068",
			"url" : "http://p7pixer.wordpress.com"
		},
		{
			"k" : "Q*0DCC!dk9j56U#ZK3GO2xmwB68o9GN1o1h!l(G2&)NJfXmO67mAww$PzaZlXTk#",
			"id" : "124315189",
			"url" : "http://p0pixer.wordpress.com"
		}
	];

	//var wpBlodId = "109226478";
	//var wpBlogId = "121469346";
	//var wpBlogId = "123309558"; // desipixerz.wordpress.com --unused
	//var wpBlogId = "123360170"; //desipixercelebsnext.wordpress.com
	//var wpBlogId = "123467412"; //desipixersblog.wordpress.com
	
	return {
		getAuthKey : getAuthKey,
		blogger : blogger,
		wpKeys : wordpressKeys
	}
}]);