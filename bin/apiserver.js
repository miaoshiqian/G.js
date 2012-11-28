var ApiServer = require('apiserver');

var apiServer = new ApiServer({ port: 8080 })

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
            var fs = require('fs');
            var path = request.querystring.file;
            console.log(path);
            fs.readFile('../' + path, function (err, tpl) {
                if (err || !tpl) {
                    response.end('throw new Error("tpl not found");');
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
    }
});

apiServer.router.addRoutes([
    ['/config', '1/config#config'],
    ['/server/tpl', '1/server#tpl']
]);

apiServer.listen();