var http = require("http");
var https = require("https");
var cheerio = require('cheerio');
var iconv = require('iconv-lite');


module.exports = function (url, cb) {
    if (typeof url !== 'string') return 'url error';
    if (url.indexOf('https') > -1) http = https;
    try {
        http.get(url, function (res) {
            res.setEncoding('binary');
            var source = "", $;
            res.on('data', function (data) {
                source += data;
            });
            res.on('end', function () {
                $ = cheerio.load(source);
                var meta = $('meta');
                var content, charset;
                meta.filter(function (i, el) {
                    var self = $(this);
                    try {
                        var c = self.attr('content').indexOf('charset');
                        if (c > -1) {
                            content = self.attr('content');
                        }
                    } catch (e) {
                        charset = self.attr('charset');
                    }

                });
                var buf = new Buffer(source, 'binary'), result;
                if (charset) {
                    result = iconv.decode(buf, charset);
                } else {
                    try {
                        var one = content.indexOf("charset=");
                        var two = content.indexOf(";", one);
                        if (two === -1) two = content.length;
                        charset = content.substr(one + 8, two);
                        console.log(charset);
                        result = iconv.decode(buf, charset);
                    } catch (e) {
                        console.log(e, 'error');
                        result = iconv.decode(buf, 'utf-8')
                    }
                }
                if (!result) return cb('此地址不能被解析');
                var transCoding = cheerio.load(result);
                return cb(transCoding('title').text());
            });
        });
    } catch (e) {
        console.log('fuck s');
        console.log(e);
        cb('此地址不能被解析');
    }

};
