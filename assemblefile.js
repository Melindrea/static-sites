'use strict';

var path = require('path'),
    merge = require('mixin-deep'),
    permalinks = require('assemble-permalinks'),
    getDest = require('./plugins/get-dest'),
    viewEvents = require('./plugins/view-events'),
    drafts = require('./plugins/drafts'),
    rss = require('./plugins/rss'),
    git = require('gulp-git'),
    bump = require('gulp-bump'),
    robots = require('gulp-robots'),
    filter = require('gulp-filter'),
    tagVersion = require('gulp-tag-version'),
    browserSync = require('browser-sync'),
    gp = require('gulp-load-plugins')(),
    reload = browserSync.reload,
    smoosher = require('gulp-smoosher'),
    RevAll = require('gulp-rev-all'),
    config = require('./config'),
    assemble = require('assemble'),
    typogr = require('./plugins/typogr'),
    app = assemble();

/**
 * Plugins
 */

app.use(viewEvents('permalink'));
app.use(permalinks());
app.use(getDest());

app.onPermalink(/./, function (file, next) {
  file.data = merge({}, app.cache.data, file.data);
  next();
});

var buildDir = 'build',
    tempDir = '.tmp',
    deployDir = 'build/Release',
    siteData = config.site;

siteData.base = buildDir;

app.data({
  site: siteData,
  gtm: config.gtm,
  pkg: config.pkg
});

/**
 * Create views collection for our site pages and blog posts.
 * Posts will be written in markdown.
 */

app.create('pages');
app.create('posts', {
  pager: true,
  renameKey: function (key, view) {
    return view ? view.basename : path.basename(key);
  }
});

app.posts.use(
    permalinks(
        ':site.base/blog/:strip(filename)/index.html',
        {
            strip: function (filename) {
                return filename.substring(4);
            }
        }
    )
);
app.pages.use(
    permalinks(
        ':site.base/:permalink(filename)',
        {
            permalink: function (filename) {
                if (filename === 'index') {
                    return 'index.html';
                }

                return filename + '/index.html';
            }
        }
    )
);

/**
 * Register a handlebars helper for processing markdown.
 * This could also be done with a gulp plugin, or a
 * middleware, but helpers are really easy and provide
 * the most control.
 */

app.helper('markdown', require('helper-markdown'));
app.helper('moment', require('helper-moment'));
app.helpers('helpers/*.js');
app.helper('log', function (val) {
    console.log(val);
});
app.helpers(require('handlebars-helpers')());

/**
 * Tasks for loading and rendering our templates
 */

app.task('load', function (cb) {
    app.partials('templates/includes/*.hbs');
    app.layouts('templates/layouts/*.hbs');
    app.pages('content/pages/**.hbs');
    app.posts('content/posts/*.md');
    cb();
});

app.task('clean', require('del').bind(null, [tempDir, buildDir]));

function bumpAndTag(importance) {
    // get all the files to bump version in
    return app.src(['./package.json'], {layout: null})
        // bump the version number in those files
        .pipe(bump({type: importance}))
        // save it back to filesystem
        .pipe(app.dest('./'))
        // commit the changed version number
        .pipe(git.commit('Bump site version'))

        // read only one file to get the version number
        .pipe(filter('package.json'))
        // **tag it in the repository**
        .pipe(tagVersion());
}

app.task('patch', function () { return bumpAndTag('patch'); });
app.task('feature', function () { return bumpAndTag('minor'); });
app.task('release', function () { return bumpAndTag('major'); });

app.task('jshint', function () {
    return app.src(
            [
                'assets/scripts/**/*.js',
                '*.js',
                'helpers/**/*.js'
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
    // return app.src('assets/images/gallery/writing.jpg')
        .pipe(gp.cache(gp.imagemin({
            progressive: true,
            interlaced: true,
            // don't remove IDs from SVGs, they are often used
            // as hooks for embedding and styling
            svgoPlugins: [{cleanupIDs: false}]
        })))
        .pipe(app.dest(buildDir + '/assets/images'));
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
        .pipe(gp.modernizr())
        .pipe(app.dest('.tmp/assets/scripts'));
});

/**
 * Build task
 */

app.task('build', ['load'], function () {
  return app.use(drafts('posts'))
    .use(rss('posts'))
    .toStream('pages')
    .pipe(app.toStream('posts'))
    .on('error', console.log)
    .pipe(app.renderFile('md'))
    .on('error', console.log)
    .pipe(typogr())
    .pipe(smoosher({ // [todo] - can this be moved to assemble?
        base: '.'
    }))
    .pipe(app.dest(function (file) {
        file.path = file.data.permalink;
        file.base = path.dirname(file.path);
        file.extname = '.html';

        return file.base;
    }));
});

app.task('sitemap', function () {
    return app.src('build/**/*.html')
        .pipe(gp.sitemap({
                siteUrl: config.pkg.homepage
        })) // Returns sitemap.xml
        .pipe(app.dest(buildDir));
});

app.task('cache-busting', function () {
    var revAll = new RevAll({ dontRenameFile: [/^\/favicon$/g, '.html', '.xml', '.txt'] });

    return app.src(buildDir + '/**')
        .pipe(revAll.revision())
        .pipe(app.dest(deployDir))
        .pipe(revAll.manifestFile())
        .pipe(app.dest(buildDir));
});

app.task('default', ['jshint', 'assets', 'images', 'build', 'modernizr', 'useref', 'sitemap'], function () {
  return app.src(buildDir + '/**/*').pipe(gp.size({title: 'build', gzip: true}));
});


/**
 * Expose your instance of assemble to the CLI
 */
module.exports = app;
