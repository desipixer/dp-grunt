app.controller('dpMainCtrl', ['$scope','service.sites','service.main', function($scope,siteServ, mainServ){
	$scope.sites = siteServ.sites;
	$scope.names = mainServ.names;

}]);

	