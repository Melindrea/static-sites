'use strict';

module.exports = function () {
    return function (app) {
        var gp = require('gulp-load-plugins')(),
            robots = require('gulp-robots'),
            config = require('./../config'),
            browserSync = require('browser-sync'),
            reload = browserSync.reload,
            RevAll = require('gulp-rev-all'),
            buildDir = config.pkg.config.buildDir,
            deployDir = config.pkg.config.deployDir;

        app.task('jshint', function () {
            return app.src(
                    [
                        'assets/scripts/*.js',
                        '*.js',
                        'helpers/**/*.js',
                        'plugins/**/*.js',
                        'assets/*.js',
                        'blog/**/*.js'
                    ]
                )
                .pipe(reload({stream: true, once: true}))
                .pipe(gp.jsvalidate())
                .pipe(gp.jshint())
                .pipe(gp.jshint.reporter('jshint-stylish'))
                .pipe(gp.if(! browserSync.active, gp.jshint.reporter('fail')));
        });

        app.task('fonts', function () {
            return app.copy('assets/fonts/**/*', 'build/assets/fonts');
        });

        app.task('favicon', function () {
            return app.copy('assets/favicon/**/*', 'build/assets/favicon');
        });

        app.task('favicon2', function () {
            return app.copy('assets/favicon.ico', 'build');
        });

        app.task('well-known', function () {
            return app.copy('assets/well-known/**', 'build/.well-known');
        });

        app.task('resources', function () {
            return app.copy('assets/resources/**', 'build/assets/resources');
        });

        app.task('images-copy', function () {
            return app.copy('processed/images/**/**.{jpg,jpeg,png}', 'build/assets/images');
        });

        app.task('robots', function () {
            return app.src('build/index.html')
                .pipe(robots({
                    useragent: '*',
                    sitemap: 'https://antoniusm.se/sitemap.xml'
                }))
                .pipe(app.dest('build'));
        });

        app.task('assets', ['fonts', 'favicon', 'favicon2', 'robots', 'styles', 'well-known']);

        app.task('images', function () {
            return app.src('assets/images/**/**.{jpg,jpeg,png}')
                .pipe(gp.cache(gp.imagemin({
                    progressive: true,
                    interlaced: true,
                    // don't remove IDs from SVGs, they are often used
                    // as hooks for embedding and styling
                    svgoPlugins: [{cleanupIDs: false}]
                })))
                .pipe(app.dest(function (file) {
                    app.logDebug(file.path);
                    file.path = file.path.replace('.jpg', '.jpeg');
                    return 'processed/images';
                }));
        });

        app.task('styles', function () {
            return app.src('assets/styles/main.scss')
                .pipe(gp.sourcemaps.init())
                .pipe(gp.sass({
                        outputStyle: 'expanded',
                        precision: 10,
                        includePaths: ['.', './bower_components']
                    }).on('error', gp.sass.logError)
                )
                .pipe(gp.pleeease({browsers: ['last 1 version']}))
                .pipe(gp.sourcemaps.write())
                .pipe(app.dest('.tmp/assets/styles'))
                .pipe(reload({stream: true}));
        });

        app.task('useref', function () {
            return app.src('build/**/**.html')
                .pipe(gp.useref({searchPath: ['.tmp', 'assets', '.']}))
                .pipe(gp.if('*.js', gp.jsvalidate()))
                .pipe(gp.if('*.js', gp.uglify()))
                .pipe(gp.if('*.css', gp.csso()))
                .pipe(app.dest('build'));
        });

        app.task('modernizr', function () {
            return app.src(['assets/**/**.{js,scss}', 'build/**/**.html'])
                .pipe(gp.modernizr(config.data.modernizr))
                .pipe(app.dest('.tmp/assets/scripts'));
        });


        app.task('cache-busting', function () {
            var revAll = new RevAll({ dontRenameFile: [/^\/favicon$/g, '.html', '.xml', '.txt'] });

            return app.src(buildDir + '/**')
                .pipe(revAll.revision())
                .pipe(app.dest(deployDir))
                .pipe(revAll.manifestFile())
                .pipe(app.dest('data'));
        });
    };
};
