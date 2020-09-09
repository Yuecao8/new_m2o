/**
 * gulp 配置
 */

'use strict';

require('./initial');

const path = require('path');
const gulp = require('gulp');
const gutil = require('gulp-util');
const del = require('del');
const notifier = require('node-notifier');
const chalk = require('chalk');
const $ = require('gulp-load-plugins')();

    $.locale = require('./gulp-locale');
    $.if = require('gulp-if');

let src = {
    ejs: './views/ejs/**/*.ejs',
    html: './views/html/**/*.html',
    sass: './assets/scss/mxu/**/*.scss',
    locale: `./main/locale/src/${process.env.LANG}/*.json`,
    index: ['./main/index.ejs', process.env.FUSION ? 'fusionindex.ejs' : 'index.ejs'],
    js: './main/scripts/mxu/**/*.js',
    es6: './main/scripts/mxu-es6/**/*.js',
    img: './assets/images/**',
    min: './main/index.ejs'
};
let dest = {
    ejs: './views/mxu',
    html: './views/mxu',
    sass: './assets/styles',
    locale: './main/locale/dist',
    // index: './main',
    index: '.',
    js: './main/scripts/mxu',
    img: './assets/images',
    min: './main'
};
if (process.env.NODE_ENV === 'production') {
    for (let key in dest) {
        dest[key] = path.join('./dist', dest[key]);
    }
}

function notifyErr(type) {
    return function (err) {
        if (err && err.message) {
            console.error(chalk.red(err.message) + '\n');
        } else {
            console.error(err);
        }
        notifier.notify({
            title: 'gulp',
            message: 'error in the task of ${type}'
        });
        this.emit('end');
    }
}
// 清除文件
function clean(done) {
    del.sync('./dist/**');
    done();
}

function cleanBundle(done) {
    del.sync('./main/scripts/bundle/**');
    done();
}

// https://github.com/kangax/html-minifier
const options = {
    removeComments: true, // 清除HTML注释
    collapseWhitespace: true, // 压缩HTML
    collapseBooleanAttributes: true, // 省略布尔属性的值 <input checked="true"/> ==> <input checked/>
    removeEmptyAttributes: true, // 删除所有空格作属性值 <input id="" /> ==> <input />
    removeScriptTypeAttributes: true, // 删除<script>的type="text/javascript"
    removeStyleLinkTypeAttributes: true, // 删除<style>和<link>的type="text/css"
    minifyJS: true, // 压缩页面JS
    minifyCSS: true // 压缩页面CSS
};
// 编译ejs
function ejs() {
    return gulp.src(src.ejs)
        .pipe($.ejs({ edition: process.env.EDITION}).on('error', /*gutil.log*/notifyErr('ejs')))
        .pipe($.rename({ extname: '.html' }))
        .pipe($.htmlmin(options))
        .pipe(gulp.dest(dest.ejs))
        .pipe($.livereload())
}

function html() {
    return gulp.src(src.html)
        .pipe($.cached('html'))
        .pipe($.htmlmin(options))
        .pipe(gulp.dest(dest.html))
        .pipe($.livereload())
}

//编译sass
function sass() {
    return gulp.src(src.sass, { base: 'assets/scss' })
        .pipe($.cached('sass'))
        .pipe($.sourcemaps.init()) // 添加sourcemap
        .pipe($.sass().on('error', notifyErr('sass'))) // 编译scss
        .pipe($.autoprefixer({browsers: 'last 2 Chrome versions', remove: false})) //添加前缀
        .pipe($.cleanCss()) //压缩样式文件
        .pipe($.sourcemaps.write('./maps'))
        .pipe(gulp.dest(dest.sass))
        .pipe($.livereload())
}

// locale
function locale() {
    return gulp.src(src.locale)
        .pipe($.locale({
            fileName: `locale-${process.env.LANG}.js`,
            exportName: 'window.translate'
        }))
        .pipe(gulp.dest(dest.locale))
        .pipe($.livereload())
}

// index
function index() {
    return gulp.src(src.index, {base: '.'})
        .pipe($.ejs({
            LANG: process.env.LANG,
            TRANS: require(`./main/locale/src/${process.env.LANG}/login`)
        }).on('error', /*gutil.log*/notifyErr('index')))
        .pipe($.replace('{{VERSION}}', process.env.VERSION))
        .pipe($.rename({ extname: '.html', basename: 'index' }))
        .pipe(gulp.dest(dest.index))
        .pipe($.livereload())
}
// 提取首页标签
function min() {
    return gulp.src(src.min)
        .pipe($.ejs({
            LANG: process.env.LANG
        }).on('error', /*gutil.log*/notifyErr('min')))
        .pipe($.replace('{{VERSION}}', process.env.VERSION))
        .pipe($.rename({ extname: '.html' }))
        .pipe($.useref())
        .pipe($.if('*.js', $.uglify()))
        .pipe($.if('*.css', $.cleanCss()))
        .pipe(gulp.dest(dest.min));
}
// js
function js() {
    return gulp.src(src.js)
        // .pipe($.sourcemaps.init())
        .pipe($.babel({ presets: ['env', 'stage-2'] }))
        .pipe($.stripDebug())
        .pipe($.uglify())
        // .pipe($.sourcemaps.write('.'))
        .pipe(gulp.dest(dest.js))
}

/*// img
function img() {
   return gulp.src(src.img)
       // .pipe($.imagemin({ optimizationLevel: 3, progressive: true, interlaced: true }))
       .pipe(gulp.dest(dest.img))
}*/

// copy
function copy() {
    return gulp.src([
        './assets/**/*', '!./assets/scss', '!./assets/styles', '!./assets/scss/**', '!./assets/styles/**',
        './libs/**/*', '!./libs/mxu/**/*.map',
        './views/layout/*', './views/blocks/*','./magic/**/*','./template/**/*'
    ], {base: '.'})
        .pipe(gulp.dest('./dist'))
}

/**
 * task of webpack
 */
const webpack = require("webpack");
// var WebpackDevServer = require("webpack-dev-server");
const webpackConfig = require("./webpack.config.js");
const merge = require('webpack-merge');
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');

function webpackProd(done) {
    const config = merge(webpackConfig, {
        // devtool: '#source-map',
        output: {
            path: path.join(__dirname, 'dist/main/scripts/bundle'),
            // filename: utils.assetsPath('js/[name].[chunkhash].js'),
            // chunkFilename: utils.assetsPath('js/[id].[chunkhash].js')
        },
        plugins: [
            new webpack.DefinePlugin({
                'process.env': {
                    NODE_ENV: '"production"'
                }
            }),
            new webpack.optimize.UglifyJsPlugin({
                compress: {
                    warnings: false,
                    drop_debugger: true,
                    drop_console: true
                },
                sourceMap: true
            })
        ]
    });

    webpack(config, function(err, stats) {
        if (err || stats.hasErrors()) {
            notifier.notify({
                title: 'webpack:build-prod',
                message: 'error in the task of webpack:build-prod'
            });
            done();
            return;
        }
        // 打印 webpack 模块信息
        gutil.log("[webpack:production]", stats.toString({
            colors: true
        }));
        done();
    });
}

const devConfig = merge(webpackConfig, {
    // devtool: '#cheap-module-eval-source-map',
    devtool: 'source-map',
    plugins: [
        new webpack.DefinePlugin({
            'process.env': '"development"'
        }),
        // https://github.com/glenjamin/webpack-hot-middleware#installation--usage
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
        new FriendlyErrorsPlugin()
    ]
});
const devCompiler = webpack(devConfig);

function webpackDev(done) {
    devCompiler.run((err, stats) => {
        if (err || stats.hasErrors()) {
            notifier.notify({
                title: 'webpack:build-dev',
                message: 'error in the task of webpack:build-dev'
            });
            done();
            return;
        }
        // gutil.log("[webpack:build-dev]", stats.toString({
        //     colors: true
        // }));
        $.livereload.reload();
        done();
    });
}

function watch() {
    $.livereload.listen();

    gulp.watch(src.ejs, ejs);
    gulp.watch(src.html, html);
    gulp.watch(src.sass, sass);
    gulp.watch(src.locale, locale);
    gulp.watch(src.index, index);
    // gulp.watch(src.js, webpackDev);
    // gulp.watch(src.es6, webpackDev);
    gulp.watch('./main/scripts/**/*.js', webpackDev);
}
/**
 * default task
 */
gulp.task('dev', gulp.series(
    cleanBundle,
    gulp.parallel(ejs, html, sass, locale, index, webpackDev),
    watch
));

/**
 * production build task
 */
gulp.task('build', gulp.series(
    clean,
    gulp.parallel(ejs, html, sass, locale, index, js, copy, webpackProd),
    min,

    function notify(done) {
        del.sync('./dist/assets/styles/maps/**');
        console.log(chalk.white.bgGreen('\nbuild success\n'));
        done();
    }
));



//编译global-sass
gulp.task('global', () => {
    const srcs = ['assets/global/scss/app.scss', 'assets/global/scss/app.rtl.scss', 'assets/bootstrap-rtl/scss/bootstrap-rtl.scss'];
    const dests = ['assets/global/dist', 'assets/global/dist', 'assets/bootstrap-rtl/dist'];
    const tasks = srcs.map((src, index) => {
        return gulp.src(src)
            .pipe($.sass().on('error', /*$.sass.logError*/notifyErr('global-sass')))
            .pipe(gulp.dest(dests[index]))
            .pipe($.cleanCss())
            .pipe($.rename({ suffix: '.min' }))
            .pipe(gulp.dest(dests[index]))
    });
    return $.merge(tasks);
});
