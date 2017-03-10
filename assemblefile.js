'use strict';

var assemble = require('assemble'),
    path = require('path'),
    merge = require('mixin-deep'),
    permalinks = require('assemble-permalinks'),
    gp = require('gulp-load-plugins')(),
    smoosher = require('gulp-smoosher'),
    inlineCss = require('gulp-inline-css'),
    Navigation = require('assemble-navigation'),

    // Configurations
    config = require('./config'),
    customPermalinks = require('./plugins/custom-permalinks'),

    getDest = require('./plugins/get-dest'),
    viewEvents = require('./plugins/view-events'),
    drafts = require('./plugins/drafts'),
    wordCount = require('./plugins/word-count'),
    blog = require('./blog'),
    rss = require('./plugins/rss'),
    typogr = require('./plugins/typogr'),
    assets = require('./assets'),
    media = require('./plugins/media'),
    revision = require('./plugins/revision'),
    logger = require('./lib/logger'),
    sprintf = require('sprintf-js').sprintf,

    app = assemble();

/**
 * Plugins
 */
var navigation = new Navigation(config.data.site.nav);

app.use(logger());
app.use(viewEvents('permalink'));
app.use(permalinks());
app.use(customPermalinks());
app.use(getDest());
app.use(media());
app.use(blog());
app.use(rss());
app.use(assets());
app.use(revision());

app.onPermalink(/./, function (file, next) {
  file.data = merge({}, app.cache.data, file.data);
  next();
});

var buildDir = config.pkg.config.buildDir,
    tempDir = '.tmp',
    siteData = config.data.site;
siteData.base = buildDir;

app.data({
  site: siteData,
  gtm: config.gtm,
  pkg: config.pkg
});


/**
 * Create views collection for our site pages
 */

app.create('pages');

// After the collections are created
app.pages.onLoad(/./, navigation.onLoad());
app.pages.preRender(/./, navigation.preRender());

app.posts.onLoad(/./, navigation.onLoad());
app.posts.preRender(/./, navigation.preRender());
app.pages.use(
    permalinks(
        ':site.base/:permalink(filename)',
        {
            permalink: app.pagePermalink
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
app.helpers(require('handlebars-helpers')());

/**
 * Tasks for loading and rendering our templates
 */
app.task('load', function (cb) {
    navigation.clearMenus();

    app.partials(config.data.global.paths.includes + '/*.hbs');
    app.partials(config.data.global.paths.includes + '/' + config.site + '/*.hbs');
    app.layouts(config.data.global.paths.layouts + '/*.hbs');
    app.layouts(config.data.global.paths.layouts + '/' + config.site + '/*.hbs');
    app.pages(sprintf(
        config.data.global.paths.content.pages,
        config.data.global.paths.content.base,
        config.site
    ) + '/**/*.hbs');

    app.posts(sprintf(
        config.data.global.paths.content.posts,
        config.data.global.paths.content.base,
        config.site
    ) + '/**/*.md');

    app.use(drafts('posts'));
    app.use(wordCount('posts'));

    app.createArchives();

    cb();
});

app.task('newsletters', ['load'], function () {
    app.src('content/newsletters/**/*.md', {layout: 'email'})
        .pipe(typogr())
        .pipe(inlineCss())
        .pipe(app.renderFile('md'))
        .pipe(app.dest(function (file) {
            file.extname = '.html';
            return 'newsletters';
        }));
});

app.task('clean', require('del').bind(null, [tempDir, buildDir]));

 /**
 * Build task
 */

app.task('build', ['load'], function (cb) {
    app.processImages(function (err) {
        if (err) {
            return cb(err);
        }

        app.loadWidgets('posts');
        app.createRSSFile('posts');
        app.loadImages();

        app.toStream('pages')
            .pipe(app.toStream('archives'))
            .pipe(app.toStream('posts'))
            .on('error', app.logError)
            .pipe(app.renderFile('md'))
            .on('error', app.logError)
            .pipe(typogr())
            .pipe(smoosher({
                base: '.'
            }))
            .pipe(app.dest(function (file) {
                file.path = file.data.permalink;
                file.base = path.dirname(file.path);
                file.extname = '.html';
                // app.logDebug(file.path);
                return file.base;
            }))
            .on('end', cb);
    });
});

app.task('sitemap', function () {
    return app.src('build/**/*.html')
        .pipe(gp.sitemap({
                siteUrl: config.data.site.url
        })) // Returns sitemap.xml
        .pipe(app.dest(buildDir));
});

app.task('default', ['jshint', 'assets', 'images-copy', 'resources', 'build', 'modernizr', 'useref', 'sitemap'], function () {
  return app.src(buildDir + '/**/*').pipe(gp.size({title: 'build', gzip: true}));
});


/**
 * Expose your instance of assemble to the CLI
 */
module.exports = app;
