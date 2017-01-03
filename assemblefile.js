'use strict';

var path = require('path'),
    merge = require('mixin-deep'),
    permalinks = require('assemble-permalinks'),
    getDest = require('./plugins/get-dest'),
    viewEvents = require('./plugins/view-events'),
    drafts = require('./plugins/drafts'),
    wordCount = require('./plugins/word-count'),
    blog = require('./blog'),
    rss = require('./plugins/rss'),
    gp = require('gulp-load-plugins')(),
    smoosher = require('gulp-smoosher'),
    config = require('./config'),
    assemble = require('assemble'),
    typogr = require('./plugins/typogr'),
    inlineCss = require('gulp-inline-css'),
    assets = require('./assets'),
    media = require('./plugins/media'),
    revision = require('./plugins/revision'),
    customPermalinks = require('./plugins/custom-permalinks'),
    doctoc = require('gulp-doctoc'),
    Navigation = require('assemble-navigation'),
    app = assemble();

/**
 * Plugins
 */
var navigation = new Navigation(config.site.nav);
// app.onLoad(/./, navigation.onLoad());
// app.preRender(/./, navigation.preRender());

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
    siteData = config.site;

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
app.helper('log', function (val) {
    console.log(val);
});
app.helpers(require('handlebars-helpers')());


var minimist = require('minimist');

var knownOptions = {
    string: ['env', 'site'],
    default: {
        env: process.env.NODE_ENV || 'local',
        site: 'antoniusm.se'
    }
};

var options = minimist(process.argv.slice(2), knownOptions);

/**
 * Tasks for loading and rendering our templates
 */
app.task('load', function (cb) {
    navigation.clearMenus();

    app.partials('templates/includes/*.hbs');
    app.partials('templates/includes/' + options.site + '/*.hbs');
    app.layouts('templates/layouts/*.hbs');
    app.layouts('templates/layouts/' + options.site + '/*.hbs');
    app.pages('content/' + options.site + '/pages/**.hbs');
    app.posts('content/' + options.site + '/posts/**/*.md');
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
            .on('error', console.log)
            .pipe(app.renderFile('md'))
            .on('error', console.log)
            .pipe(typogr())
            .pipe(smoosher({
                base: '.'
            }))
            .pipe(app.dest(function (file) {
                file.path = file.data.permalink;
                file.base = path.dirname(file.path);
                file.extname = '.html';
                // console.log(file.base);
                console.log(file.path);
                return file.base;
            }))
            .on('end', cb);
    });
});

app.task('sitemap', function () {
    return app.src('build/**/*.html')
        .pipe(gp.sitemap({
                siteUrl: config.pkg.homepage
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
