'use strict';

var through = require('through2'),
    path = require('path'),
    entries = [];
module.exports = function (type, newFileName, dest, config) {
    return through.obj(function (file, enc, cb) {
        var fp = file.path,
            matter = require('gray-matter'),
            frontMatter = matter(file._contents.toString()),
            extname = path.extname(fp),
            filename = path.basename(fp, extname),
            link = path.dirname(fp).replace(
                process.cwd() + '/content/pages', config.pkg.homepage
            ) + '/' + filename + '/',
            parsedFile = {};

        parsedFile.twitter = frontMatter.data.tweetables || [];
        parsedFile.facebook = frontMatter.data.facebookables || [];
        parsedFile.frontMatter = frontMatter.data;
        parsedFile.content = frontMatter.content;
        parsedFile.link = link.replace('/index/', '/');
        parsedFile.created = file.stat.birthtime;
        parsedFile.changed = file.stat.mtime || file.stat.birthtime;

        entries.push(parsedFile);
        cb();
    },
    function (cb) {
        var RSS = require('rss'),
            _s = require ('underscore.string'),
            File = require('vinyl'),
            // bufferConfig = require('../data/buffer.json'),
            moment = require('moment'),
            xmlEscape = require('xml-escape'),
            // bufferSecrets = require('../secrets.json').BufferApp,
            request = require('request'),
            sprintf = require('sprintf-js').sprintf,
            file,
            feed,
            rssEntries,
            content;

        if (type === 'rss') {
            entries.sort(function (a, b) {
                return b.created - a.created;
            });

            rssEntries = entries.slice(0, 16);

            feed = new RSS({
                title: xmlEscape(config.site.site.title),
                description: xmlEscape(config.pkg.description),
                feed_url: config.pkg.homepage + '/rss.xml',
                site_url: config.pkg.homepage,
                // image_url: config.pkg.homepage + '/icon.png',
                managingEditor: config.pkg.author.email,
                webMaster: config.pkg.author.email,
                copyright: config.site.site.copyright,
                language: config.site.site.language,
                pubDate: rssEntries[15].created,
                ttl: '60'
            });


            rssEntries.forEach(function (entry) {
                var title = (entry.frontMatter.parent) ? _s.capitalize(entry.frontMatter.parent) + ': ' + entry.frontMatter.title : entry.frontMatter.title;

                feed.item({
                    title: xmlEscape(title),
                    description: xmlEscape(entry.frontMatter.excerpt),
                    url: entry.link, // link to the item
                    date: entry.created//, any format that js Date can parse.
                });
            });

            content = feed.xml({indent: true});
        } /*else if (type === 'buffer') {
            entries.sort(function (a, b) {
                return b.changed - a.changed;
            });
            var bufferTypes = Object.keys(bufferConfig.log),
                logs = bufferConfig.log,
                numberOfEntries = {},
                maxEntries = 10,
                now = moment(),
                earliestDate = moment().subtract(7, 'days');

            bufferTypes.forEach(function (key) {
                var keyLog = logs[key],
                    priorLogs = Object.keys(keyLog).sort(),
                    lastLog,
                    daysSince,
                    validEntries,
                    priorTexts = {},
                    workingEntries = [];

                priorLogs.forEach(function (date) {
                    if (moment(date) >= earliestDate) {
                        keyLog[date].forEach(function (logItem) {
                            if (! (logItem.url in priorTexts)) {
                                priorTexts[logItem.url] = [];
                            }

                            priorTexts[logItem.url].push(logItem.text);
                        });
                    }
                });

                if (priorLogs.length === 0) {
                    numberOfEntries[key] = maxEntries;
                } else {
                    lastLog = priorLogs.pop();
                    daysSince = now.diff(moment(lastLog), 'days');

                    numberOfEntries[key] = Math.min(daysSince * bufferConfig[key].daily, maxEntries);
                }

                 validEntries = entries.filter(function (entry) {
                    var link = entry.link;

                    entry.validTexts = entry[key].filter(function (item) {
                        var properLength = (item.length >= bufferConfig[key].min && item.length <= bufferConfig[key].max),
                            unused = true;

                        if (link in priorTexts) {
                            unused = (priorTexts[link].indexOf(item) === -1);
                        }

                        return properLength && unused;
                    });

                    return entry.validTexts.length > 0;
                });

                 validEntries.forEach(function (entry) {
                    var text = entry.validTexts[Math.floor(Math.random() * entry.validTexts.length)];
                    workingEntries.push({ url: entry.link, text: text});
                 });

                workingEntries = workingEntries.slice(0, numberOfEntries[key] - 1);

                if (workingEntries.length > 0) {
                    // Do stuff to send it to buffer
                    var endpoint = 'https://api.bufferapp.com/1/updates/create.json',
                        bufferData = {
                            // text: "This%20is%20an%20example%20update",
                            profile_ids: [
                                bufferSecrets.profiles[key]
                            ],
                            access_token: bufferSecrets.token
                        };

                    workingEntries.forEach(function (item) {
                        var entryData = JSON.parse(JSON.stringify(bufferData)),
                            pattern;

                        switch (key) {
                            case 'twitter':
                                pattern = '%s %s #smaty';
                                break;
                            case 'facebook':
                                pattern = '%s %s';
                                break;
                            default:
                                return;
                        }
                        entryData.text = sprintf(pattern, item.text, item.url);

                        request.post(endpoint).form(entryData);
                    });
                    keyLog[now.format('YYYY-MM-DD')] = workingEntries;
                }
            });
            content = JSON.stringify(bufferConfig, null, 4);
        } */

        file = new File({
            cwd: process.cwd(),
            base: '/' + dest +  '/',
            path: '/' + dest +  '/' + newFileName,
            contents: new Buffer(content)
        });
        this.push(file);
        cb();
    });
};
