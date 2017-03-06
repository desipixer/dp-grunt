

module.exports = function(grunt) {
	/*grunt.registerTask('compile', function() {
		console.log("I am compiling");s	
	});

	grunt.registerTask('default', function(){
		console.log("DP : default task loaded");
	})*/

	grunt.initConfig({
		concat : {
			basic : {
				src : [
				'app/scripts/app.js',
				'app/scripts/service.main.js',
				'app/scripts/settings.js',
				'app/scripts/service.auth.js',
				'app/scripts/service.url.js',
				'app/scripts/service.util.js',
				'app/scripts/service.sites.js',
				'app/scripts/service.post.js',
				'app/scripts/service.copy.js',
				'app/scripts/directive.enter.js',
				'app/scripts/controller.main.js',
				'app/scripts/controller.home.js',
				'app/scripts/controller.wordpress.js',
				'app/scripts/controller.wpimg.js',
				'app/scripts/controller.images.js'
				],
				dest : 'dist/js/scripts.js'		
			},
			extras : {
				src : [
				'app/lib/js/angular.min.js',
				'app/lib/js/angular-ui-router.min.js',
				'app/lib/js/underscore-min.js',
				'app/lib/js/clipboard.min.js',
				'app/lib/js/jquery-3.1.1.min.js'
				],
				dest : 'dist/scripts/vendor.js'
			}
			
		},
		watch : {
				files : ['app/**/*.js', 'app/**/*'],
				tasks : ['concat','uglify', 'copy']	
		},
		uglify : {
			options : {
				mangle : true
			},
			target : {
				files : {
					'dist/scripts/scripts.min.js' : ['dist/js/scripts.js']
				}
			}
		},
		copy : {
			main : {
				files : [
				{
				src : ["app/index.html"],
				dest : "dist/index.html",
				isFile : true
				},
				{
					src : ["css/*", "lib/fonts/*", "lib/css/*"],
					dest : "dist/",
					cwd : 'app/',
					expand : true
				},
				{
				expand : true,
				src : ["pages/*"],
				dest : "dist",
				cwd : 'app/'
				}
				]
		}
	}
	})

	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.registerTask('default', ['concat','copy','uglify']);

};	