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

apiServer.router.addRoutes([
    ['/config', '1/config#config']
]);

apiServer.listen();