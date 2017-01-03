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
            blog = config.data.blog,
            sprintf = require('sprintf-js').sprintf,
            argv = require('yargs')
                .argv;

        app.task('createPost', function () {
            var prompt = require('prompt');

            prompt.start();

            prompt.get(
                [
                    {
                        name: 'permalink',
                        description: 'The permalink for the post',
                        required: true
                    }, {
                        name: 'parent',
                        description: 'Permalink for a parent-post'
                    }, {
                        name: 'title',
                        description: 'Title'
                    }, {
                        name: 'pageTitle',
                        description: 'Page title'
                    }, {
                        name: 'category',
                        description:'Category'
                    }, {
                        name: 'tags',
                        description: 'Tags (comma-separated)'
                    }, {
                        name: 'featuredImage',
                        description: 'Featured Image'
                    }
                ],
                function (err, result) {
                    var path = require('path'),
                        fs = require('fs'),
                        YAML = require('json2yaml'),
                        slugify = require('underscore.string/slugify'),
                        metadata, dir = process.cwd() + '/' + sprintf(
                            config.data.site.paths.content.posts,
                            config.data.site.paths.content.base,
                            config.site
                        ),
                        filename, text;
                    if (err) {
                        return app.logError(err);
                    }

                    result.tags = result.tags.split(',').map(function (tag) {
                        return tag.trim();
                    });

                    metadata = {
                        draft: true,
                        title: result.title,
                        pageTitle: result.pageTitle,
                        layout: 'post',
                        posted: '',
                        article: true,
                        metaType: 'article',
                        excerpt: '',
                        category: result.category,
                        tags: result.tags,
                        featuredImage: result.featuredImage
                    };

                    if (result.parent) {
                        dir += '/' + slugify(result.parent);
                        if (! fs.existsSync(dir)) {
                            fs.mkdirSync(dir);
                        }
                    }
                    filename = dir + '/' + slugify(result.permalink) + '.md';
                    text = YAML.stringify(metadata);
                    text += '---\n';
                    if (fs.existsSync(filename)) {
                        app.logError('The file with name ' + filename + ' already exists');
                    } else {
                        fs.writeFile(filename, text, function (err) {
                            if (err) {
                                return app.logError(err);
                            }
                            app.logSuccess('Created new post at ' + filename);
                        });
                    }
                }
            );
        });
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
                            app.logWarning(key + ':' + taxonomyKey);
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
