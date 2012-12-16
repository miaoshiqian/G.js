var ApiServer = require('apiserver');

var apiServer = new ApiServer({ port: 8080 });
var fs = require('fs');
var path = require('path');

apiServer.addModule('1', 'config', {
    config: {
        get: function (request, response) {
            var config = require('../public/config.json');

            var callback = request.querystring.callback || 'G.config';
            response.end(callback + '(' + JSON.stringify(config) + ')');
        },
        post: function (request, response) {
            var config = require.resolve('../public/config.json');
            delete require.cache[config];
            response.end('{"ok": 1 }');
        }
    }
});

apiServer.addModule('1', 'server', {
    tpl: {
        get: function (request, response) {
            var Hogan = require('./lib/hogan/hogan');
            var file = request.querystring.file;
            fs.readFile('../' + file, function (err, tpl) {
                if (err || !tpl) {
                    response.end('throw new Error("tpl not found: ' + file + '");');
                }
                tpl = tpl.toString().replace(/'/g, "\\'").split('\n').join('\\n');
                response.end(
                    'define(function (require, exports, module) {\n'+
                    '    var Hogan = require("lib/hogan/hogan.js");\n'+
                    '    module.exports = Hogan.compile(\''+tpl+'\');\n'+
                    '});'
                );
            });
        }
    },
    js: {
        get: function (request, response) {
            var file = request.querystring.file;
            response.setHeader('Content-Type', 'application/x-javascript');
            console.log(path.resolve(file));
            if (request.querystring.test) {
                file = '' + file;
            } else {
                file = 'src/' + file;
            }
            fs.readFile(file, function (err, js) {
                if (err || !js) {
                                console.log(require('path').resolve(file), 'not found');

                    response.end('throw new Error("js not found: ' + file + '");');
                    return;
                }
                js = js.toString();
                if (js.substr(0, 6) === 'define') {
                    var id = '';
                    if (request.querystring.test) {
                        id = "http://gjs.com/" + file.replace('../', '');
                    } else {
                        id = file.replace('src/', '');
                    }
                    response.end(transport(js, id));
                } else {
                    response.end(js);
                }
            });
        }
    }
});

apiServer.router.addRoutes([
    ['/config', '1/config#config'],
    ['/server/tpl', '1/server#tpl'],
    ['/server/js', '1/server#js']
]);

apiServer.listen();

function transport(str, id) {
    /*jshint evil:true */
    function define(factory) {
        var deps = "[]";
        if (arguments.length === 1) {
            if (typeof factory === 'object') {
                factory = JSON.stringify(factory);
            } else {
                factory = factory.toString();
                deps = JSON.stringify(getDepsFromFnStr(factory));
            }
            return 'define("' + id + '", ' + deps + ', ' + factory + ')';
        }
    }

    return eval(str);
}

var REQUIRE_RE = /[^.]\s*require\s*\(\s*(["'])([^'"\s\)]+)\1\s*\)/g;
function getDepsFromFnStr(fnStr) {
    var deps = [];
    REQUIRE_RE.lastIndex = 0;
    while((match = REQUIRE_RE.exec(fnStr))) {
        deps.push(match[2]);
    }
    return deps;
}