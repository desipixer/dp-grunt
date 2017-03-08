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
		.state('wpimg', {
			url : '/wpimg',
			templateUrl : 'pages/wpimg.html',
			controller : 'dpWpImgCtrl'
		})
		.state('wpPublish', {
			url : '/publish',
			templateUrl : 'pages/publish.html',
			controller : 'dpWpPublishCtrl'
		})
}])