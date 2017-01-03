'use strict';

/**
 * Expose `plugin`.
 */


/**
 * Assemble plugin to remove files marked as `draft` from a collection.
 *
 * @return {Function}
 */
module.exports = function () {
    return function(app) {
        var permalinks = require('assemble-permalinks'),
            path = require('path'),
            config = require('./../config'),
            blog = config.blog;


        app.create('posts', {
          pager: true,
          renameKey: function (key, view) {
            return view ? view.basename : path.basename(key);
          }
        });

        app.posts.use(
            permalinks(
                blog.permalink.post,
                {
                    permalink: app.postPermalink
                }
            )
        );

        app.define(
            'createArchives',
            function ()
            {
                var paginationator = require('paginationator'),
                    data,
                    content, list, pages, groups, slug,
                    List = app.List;

                app.create('archives');

                app.archives
                    .use(permalinks(
                        blog.permalink.archive,
                        {
                            permalink: app.archivePermalink
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
            }
        );

        app.define(
            'loadWidgets',
            function (name)
            {
                var tags = {};
                function processTag(tag) {
                    if (tag in tags) {
                        tags[tag]++;
                    } else {
                        tags[tag] = 1;
                    }
                }
                var path = require('path'),
                    files = app.getViews(name),
                    tagsArray = [],
                    tagUrls = [],
                    collection = app.archives;
                for (var key in collection.views) {
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
           }
        );
    };
};
