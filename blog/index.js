'use strict';

/**
 * Expose `plugin`.
 */


/**
 * Assemble plugin to remove files marked as `draft` from a collection.
 *
 * @return {Function}
 */
var tags = {};
function processTag(tag) {
    if (tag in tags) {
        tags[tag]++;
    } else {
        tags[tag] = 1;
    }
}
function blog(name) {
    return function(app) {
        // console.log(app.cache.data.images);
        var path = require('path'),
            config = require('./../config'),
            blog = config.blog,
            permalinks = require('assemble-permalinks'),
            files = app.getViews(name),
            tagsArray = [],
            tagUrls = [],
            collection,
            data,
            content;

        app.create('archives');

        app.archives
            .use(permalinks(
                blog.permalink,
                {
                    permalink: function (filename) {
                        var name = filename.substr(5),
                            folder;

                        if (name === 'index') {
                            return 'index.html';
                        }

                        folder = name.replace('::', '/');

                        return folder + '/index.html';
                    }
                }
            ));

        for (var key in blog.indices) {
            data = blog.indices[key];
            content = blog.templates.header + '{{> ' + data.list + ' }}';

           app.archive('blog-' + key + '.hbs', {
                content: content,
                data: data
            });
        }

        for (key in blog.taxonomies) {
            var taxonomyType = blog.taxonomies[key];

            for (var taxonomyKey in taxonomyType) {
                data = taxonomyType[taxonomyKey];
                content = blog.templates.header + '{{> posts-by-' + key + ' }}';

                data.pageTitle = data.name;
                if (key === 'categories') {
                    data.subTitle = 'Category';
                    data.title = data.title + ' / Category';
                    data.type = 'category';
                } else if (key === 'tags') {
                    data.subTitle = 'Tag';
                    data.title = data.title + ' / Tag';
                    data.type = 'tag';
                }

                app.archive('blog-' + key + '::' + taxonomyKey + '.hbs', {
                    content: content,
                    data: data
                });
            }
        }

        collection = app.archives;
        for (key in collection.views) {
            var view = collection.getView(key),
                link = path.dirname(view.dest).replace(app.cache.data.pkg.config.buildDir, '') + '/';

            tagUrls[view.data.name] = link;
        }

        for (var file in files) {
            files[file].data.tags.forEach(processTag);
        }

        for (var tag in tags) {
            if (tagUrls[tag]) {
                tagsArray.push({
                    tagName: tag,
                    count: tags[tag],
                    tagUrl: tagUrls[tag]
                });
            }
        }
        app.data({tags: tagsArray});
        app.helpers(blog.helpers);
    };
}

module.exports = blog;
