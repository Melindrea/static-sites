'use strict';

var path = require('path'),
    merge = require('mixin-deep'),
    permalinks = require('assemble-permalinks'),
    getDest = require('./plugins/get-dest'),
    viewEvents = require('./plugins/view-events'),
    drafts = require('./plugins/drafts'),
    blog = require('./blog'),
    rss = require('./plugins/rss'),
    git = require('gulp-git'),
    bump = require('gulp-bump'),
    filter = require('gulp-filter'),
    tagVersion = require('gulp-tag-version'),
    gp = require('gulp-load-plugins')(),
    smoosher = require('gulp-smoosher'),
    config = require('./config'),
    assemble = require('assemble'),
    typogr = require('./plugins/typogr'),
    assets = require('./assets'),
    gallery = require('./plugins/gallery'),
    loadImages = require('./plugins/load-images'),
    collections = require('assemble-collections'),
    indexer = require('assemble-indexer'),
    app = assemble();

/**
 * Plugins
 */

app.use(viewEvents('permalink'));
app.use(permalinks());
app.use(getDest());
app.use(loadImages());
app.use(collections());

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

assets(app);
/**
 * Tasks for loading and rendering our templates
 */

app.task('load', function (cb) {
    app.partials('templates/includes/*.hbs');
    app.layouts('templates/layouts/*.hbs');
    app.pages('content/pages/**.hbs');
    app.posts('content/posts/*.md');
    app.use(drafts('posts'));

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



 /**
 * Build task
 */

app.task('build', ['load'], function (cb) {
    app.processImages(function(err) {
    if (err) {
        return cb(err);
    }

    app.use(rss('posts'))
        .use(blog('posts'))
        .use(gallery('posts'))
        .use(gallery('pages'))
        .toStream('pages')
        .pipe(app.toStream('archives'))
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
            // console.log(file.base);
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

app.task('default', ['jshint', 'assets', 'images-copy', 'build', 'modernizr', 'useref', 'sitemap'], function () {
  return app.src(buildDir + '/**/*').pipe(gp.size({title: 'build', gzip: true}));
});


/**
 * Expose your instance of assemble to the CLI
 */
module.exports = app;
