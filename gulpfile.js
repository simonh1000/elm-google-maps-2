var	gulp           = require('gulp'),
nodemon        = require('gulp-nodemon'),
concat         = require('gulp-concat'),
pug            = require('gulp-pug'),
browserSync    = require('browser-sync').create(),
sourcemaps     = require('gulp-sourcemaps'),
sass           = require('gulp-sass'),
elm            = require('gulp-elm'),
// production tools
runSequence    = require('run-sequence'),
gulpif         = require('gulp-if'),
cleanCss	   = require('gulp-clean-css'),      // use gulp-cssnano instead
uglify         = require('gulp-uglify');

var paths = {
	dist    : "dist",
	server  : 'server',
	pug     : ['src/index.pug'],
	copy    : ['src/index.html', 'src/**/*.js'],
	scss    : ['src/**/*.{scss, sass}'],
	elm     : "src/**/*.elm",
	elmMain : "src/Main.elm"
};

var production = false;

/*
* S E R V E R
*/
// gulp.task('serve', function(cb){
// 	var called = false;
// 	return nodemon({
// 		"script": 'server/bin/www',     // port 5000 by default
// 		"watch": paths.server,
// 		"ext": "js"
// 	})
// 	.on('start', function () {
// 		if (!called) {
// 			called = true;
// 			cb();
// 		}
// 	})
// 	.on('restart', function () {
// 		console.log('restarted!')
// 	})
// });

/*
* H T M L / C S S
*/

// runs jade on index.jade
gulp.task('pug', function() {
	return gulp.src(paths.pug)
	.pipe(pug({pretty: true}))
	.pipe(gulp.dest(paths.dist));
});

// Copies index.html over if it exists
gulp.task('copy', function() {
	return gulp.src(paths.copy)
	.pipe(gulp.dest(paths.dist));
});

gulp.task('sass', function() {
	return gulp.src(paths.scss)
	.pipe(sourcemaps.init())    // needs to be first
	.pipe(sass().on('error', sass.logError))
	.pipe(concat('styles.css'))
	.pipe( gulpif(production, cleanCss()) )    // minify in production
	.pipe(sourcemaps.write())   // puts them in wit the js
	.pipe(gulp.dest(paths.dist))
	.pipe(browserSync.stream()); 			// injects new styles without page reload!
});

gulp.task('compilation', ['pug', 'sass', 'copy']);

/*
* E L M
* elm-make --debug src/Main.elm --output=dist/Main.js
*/

gulp.task('elm-init', elm.init);

gulp.task('elm-compile', ['elm-init'], function() {
	// By explicitly handling errors, we prevent Gulp crashing when compile fails
	function onErrorHandler(err) {
		console.log(err.message);
	}
	return gulp.src(paths.elmMain)             // "./src/Main.elm"
	.pipe(elm())
	.on('error', onErrorHandler)
	.pipe( gulpif(production, uglify()) )   // uglify
	.pipe(gulp.dest(paths.dist));
})

/*
* D E V E L O P M E N T
*/

gulp.task('watch-server', ['serve'], function() {
	browserSync.init({
		proxy: 'localhost:5000',
	});

	gulp.watch(paths.pug, ['pug']);
	gulp.watch(paths.scss, ['sass']);
	gulp.watch(paths.elm, ['elm-compile']);
	gulp.watch(paths.dist+"/*.{js,html}").on('change', browserSync.reload);
});

gulp.task('watch', function() {
	browserSync.init({
		server: {
			baseDir: "./dist"
		}
	});
	console.log("Listening on port 3000");

	gulp.watch(paths.pug, ['pug']);
	gulp.watch(paths.scss, ['sass']);
	gulp.watch(paths.elm, ['elm-compile']);
	gulp.watch(paths.dist+"/*.{js,html}").on('change', browserSync.reload);
});

/*
* P R O D U C T I O N
* T B C
*/
var del = require('del');
gulp.task('del', function(cb) {
	del(['./dist/*'])
	.then( () => cb() );
});

/*
* A P I
* Build - create production assets
* Default - load with browserSync
*/

gulp.task('build', ['del'], function() {
	production = true;
	runSequence('compilation', 'elm-compile');
});

gulp.task('default', ['compilation', 'elm-compile', 'watch-server']);

gulp.task('serverless', ['compilation', 'elm-compile', 'watch']);

gulp.task('compile', ['compilation', 'elm-compile', 'watch']);
