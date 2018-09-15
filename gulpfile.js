var gulp =require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var browserSync = require('browser-sync');
var cssmin = require('gulp-clean-css');  //压缩css 支持sourcemaps
var autoprefixer = require('gulp-autoprefixer'); //自动添加css3 前缀
var imagemin = require('gulp-imagemin');
    pngquant = require('imagemin-pngquant');
    cache = require('gulp-cache');               //压缩图片
var spritesmith = require('gulp.spritesmith');
var runSequence = require('run-sequence');
var changed =require('gulp-changed');   
var postcss = require('gulp-postcss');
var sourcemaps = require('gulp-sourcemaps');
var cssnext = require("postcss-cssnext"); 
var plumber = require('gulp-plumber');
var reporter = require('postcss-reporter'); 
var stylelint = require('stylelint'); //规范css

var stylelintConfig = { 
	"rules": 
	{ 
		"color-no-invalid-hex": true,  //禁止无效的十六进制颜色
		"no-duplicate-selectors":true ,//不允许重复的选择器。
		"no-invalid-double-slash-comments": true //不允许双斜杠注释(/ /…)不支持CSS。
	} 
}
var processors = [
	stylelint(stylelintConfig), 
//	reporter({ clearMessages: true, throwError: true }) 
	reporter({ clearMessages: true}) 
];

gulp.task('test',function(){  //测试
	console.log('hello world');
})

gulp.task("lint-styles", function() { 
	return gulp.src("app/css/project/*.css") 
		.pipe(postcss(processors));
});

gulp.task('css',function(){
	return gulp.src(['app/css/index.css','app/css/*.css'])
			.pipe(plumber())
//			.pipe(changed('dist/css', {hasChanged: changed.compareSha1Digest}))
			.pipe(postcss(processors))
			.pipe(concat('index.css'))
			.pipe(sourcemaps.init())
			.pipe(postcss([cssnext({
				features: {
		            rem: false  //防止回退输出两次
		        }
			})]))
			.on('error',function(error){
			 	console.error(error.toString())
  			 	this.emit('end')
			})
//			.pipe(autoprefixer({
//		        browsers: ['last 2 versions', 'Android >= 4.0'],
//		        cascade: true, //是否美化属性值 默认：true 
//		        remove:true //是否去掉不必要的前缀 默认：true 
//		    }))
			.pipe(cssmin())
			.pipe(sourcemaps.write('../map'))
			.pipe(gulp.dest('dist/css'))
			.pipe(browserSync.reload({
				stream:true
			}))
});

/**
 * 合并雪碧图
 */
gulp.task('spritePhone', function () {
	return gulp.src("app/images/icons/*.*").pipe(spritesmith({
        imgName:'images/sprite.png', //合并后大图的名称
        cssName:'css/sprite-phone.css',
        padding:10,// 每个图片之间的间距，默认为0px
        cssTemplate:(data)=>{
        // data为对象，保存合成前小图和合成打大图的信息包括小图在大图之中的信息
           let arr = [],
                width = data.spritesheet.width/40+'rem',
                height = data.spritesheet.height/40+'rem',
                url =  data.spritesheet.image;
//              console.log(data.spritesheet);
            data.sprites.forEach(function(sprite) {
            	let _x =sprite.offset_x/40+'rem';
            	let _y =sprite.offset_y/40+'rem';
                arr.push(
                    ".icon-"+sprite.name+
                    "{"+
                        "background: url('"+url+"') "+
                        "no-repeat "+
                        _x+" "+_y+";"+
                        "background-size: "+ width+" "+height+";"+
                        "width: "+sprite.width/40+"rem;"+                       
                        "height: "+sprite.height/40+"rem;"+
                    "}\n"
                ) 
            });
            return arr.join("");
        }
    }))
    .pipe(gulp.dest("dist/"))
});
/**
 * 操作js，直接：gulp handleJS 合并初始化
 */
gulp.task('jsmin',function(){
	return gulp.src('app/js/*.js')
			.pipe(changed('dist/js', {hasChanged: changed.compareSha1Digest}))
			.pipe(uglify())
			.pipe(gulp.dest('dist/js'))
});	
gulp.task('venderJS',function(){
	return gulp.src('app/js/vender/*.js')
			// .pipe(concat('vender.min.js'))
			.pipe(uglify())
			.pipe(gulp.dest('dist/js'))
});
gulp.task('publicJS',function(){
	return gulp.src(['app/js/public/jquery.js','app/js/public/*.js']) //首先合并jquery
			.pipe(concat('public.min.js'))
			.pipe(uglify())
			.pipe(gulp.dest('dist/js'))
});
gulp.task('handleJS', function(callback) {
  runSequence('jsmin','venderJS', 'publicJS', callback);
});	

/**
 * 操作css，直接：gulp handleCSS 合并初始化
 */
gulp.task('cssmin',function(){
	return gulp.src('app/css/*.css')
			// .pipe(plumber())
			.pipe(changed('dist/css', {hasChanged: changed.compareSha1Digest}))
			.pipe(cssmin())
			.pipe(gulp.dest('dist/css'))
});	
gulp.task('venderCSS',function(){
	return gulp.src('app/css/vender/*.css')
			// .pipe(plumber())
			// .pipe(concat('vender.min.css'))
			.pipe(cssmin())
			.pipe(gulp.dest('dist/css'))
});
gulp.task('publicCSS',function(){
	return gulp.src(['app/css/public/common.css','app/css/public/*.css']) //首先合并common
			// .pipe(plumber())
			.pipe(concat('public.min.css'))
			.pipe(cssmin())
			.pipe(gulp.dest('dist/css'))
});
gulp.task('handleCSS',function(callback){
	return runSequence('venderCSS', 'publicCSS', callback);
});

gulp.task('browserSync',function(){
	browserSync.init({
	    server: {
	      baseDir: './',
	      directory: true,
	    },
	})
});

gulp.task('imagemin', function () {
  return gulp.src('app/images/*.*')
    .pipe(cache(imagemin({
    	interlaced: true,
        progressive: true,
        svgoPlugins: [{removeViewBox: false}],
        use: [pngquant()] //使用pngquant深度压缩png图片的imagesmin插件
    })))
    .pipe(gulp.dest('dist/images'))
    .pipe(browserSync.reload({
			stream:true
		}));
});
gulp.task('watch',['browserSync'],function(){
	gulp.watch('app/css/*.css',['css']);
	gulp.watch('app/js/**/*.js',['jsmin']);
	gulp.watch('app/images/*.*',['imagemin']);
	gulp.watch('app/images/icons/*.*',['spritePhone']);
	gulp.watch(['./html/*.html']).on("change", browserSync.reload);	
})

gulp.task('init', function(callback) {
	runSequence(['handleCSS','handleJS'], callback);
});

gulp.task('start', function(callback) {
  runSequence(['css','spritePhone'], 'watch', callback);
});

gulp.task('clear', function (done) {
  return cache.clearAll(done);
});

