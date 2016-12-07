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
        var path = require('path'),
            config = require('./../config'),
            permalinks = require('assemble-permalinks'),
            paginationator = require('paginationator'),
            blog = config.blog,
            files = app.getViews(name),
            tagsArray = [],
            tagUrls = [],
            collection,
            data,
            content, list, pages, groups, slug,
            List = app.List;

        app.create('archives');

        app.archives
            .use(permalinks(
                blog.permalink,
                {
                    permalink: function (filename) {
                        var bits = filename.substr(5).split('&&'),
                            folder,
                            name = bits[0];
                        if (name === 'index') {
                            if (bits.length > 1 && bits[1] > 1) {
                                return bits[1] + '/index.html';
                            }
                            return 'index.html';
                        }

                        folder = name.replace('::', '/');

                        if (bits.length > 1 && bits[1] > 1) {
                            return folder + '/' + bits[1] + '/index.html';
                        }
                        return folder + '/index.html';
                    }
                }
            ));

        app.helpers(blog.helpers);

        function createPageKey(key, index)
        {
            return 'blog-' + key + '&&' + index + '.hbs';
        }

        function createPage(page)
        {
            var pageData = JSON.parse(JSON.stringify(data));
                pageData.posts = page.items;
                pageData.index = page.idx;

            var pager = {};

            if (page.current !== page.last) {
                pager.next = {
                    key: createPageKey(slug, page.next),
                    data: {
                        title: 'Older posts'
                    }
                };
            }

            if (page.current !== page.first) {
                var pageNumber = 'Page ' + page.current;
                pageData.pageTitle += ' (' + pageNumber + ')';
                pageData.title += ' / ' + pageNumber;
                pager.prev = {
                    key: createPageKey(slug, (page.prev)),
                    data: {
                        title: 'Newer posts'
                    }
                };
            }

            pageData.pager = pager;

            app.archive(createPageKey(slug, page.current), {
                content: content,
                data: pageData
            });
        }

        for (var key in blog.indices) {
            data = blog.indices[key];
            content = blog.templates.header + '{{> ' + data.list + ' }}' + blog.templates.footer;

            if (data.list === 'posts') {
                list = new List(app.posts);
                list = list.sortBy('data.posted', {reverse: true});
            }

            pages = list.paginate({limit: blog['list-limit']});
            slug = key;
            pages.forEach(createPage);
        }

        list = new List(app.posts);
        list = list.sortBy('data.posted', {reverse: true});

        for (key in blog.taxonomies) {
            var taxonomyType = blog.taxonomies[key];

            for (var taxonomyKey in taxonomyType) {
                pages = false;
                data = taxonomyType[taxonomyKey];
                content = blog.templates.header + '{{> posts }}' + blog.templates.footer;

                data.pageTitle = data.name;
                if (key === 'categories') {
                    groups = list.groupBy('data.category');
                    data.subTitle = 'Category';
                    data.title = data.title + ' / Category';
                    data.type = 'category';
                } else if (key === 'tags') {
                    groups = list.groupBy('data.tags');
                    data.subTitle = 'Tag';
                    data.title = data.title + ' / Tag';
                    data.type = 'tag';
                }

                for (var groupKey in groups) {
                    if (groupKey === data.name) {
                        pages = paginationator(groups[groupKey], {limit: blog['list-limit']});
                        break;
                    }
                }
                slug = key + '::' + taxonomyKey;
                if (pages) {
                    pages.pages.forEach(createPage);
                } else {
                    console.log(key, ':', taxonomyKey);
                }

            }
        }

        // Widget-creating
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
    };
}

module.exports = blog;
