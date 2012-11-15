var ApiServer = require('apiserver');

var apiServer = new ApiServer({ port: 8080 })
var config = require('../public/config.json');

apiServer.addModule('1', 'config', {
    config: {
        get: function (request, response) {
            var callback = request.querystring.callback || 'G.config';
            response.end(callback + '(' + JSON.stringify(config) + ')');
        }
    }
});

apiServer.router.addRoutes([
    ['/config', '1/config#config']
]);

apiServer.listen();