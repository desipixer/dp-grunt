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