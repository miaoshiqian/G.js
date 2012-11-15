var path = require('path');
var fs = require('fs');

var src = '../../src/';
var absSrc = path.normalize(path.dirname(__filename) + "/../../src/");
var absPub = path.normalize(path.dirname(__filename) + "/../../public/");

module.exports = function (grunt) {
    grunt.registerTask('build-config', 'load all configure for future compiling', function () {
        var configs = grunt.task.expandFiles(src+"/**/compile.config.json");
        configs.forEach(function (config) {
            var url = config.abs.replace(absSrc, '');
            var dir = path.dirname(config.abs);
            dir = dir.replace(absSrc, '');
            var files = grunt.task.expandFiles(src + dir + '/**/*.js');
            config = require(config.abs);
            config.version = {};
            files.forEach(function (file) {
                var stat = fs.statSync(file.abs);
                var url = file.abs.replace(absSrc, '');
                var version = stat.mtime/1000;
                config.version[url] = version;
                grunt.config(['g-config', 'version', url], version);
            });
            grunt.config(['g-config', 'config', url.replace('/compile.config.json', '')], config);
            if (config.combine) {
                Object.keys(config.combine).forEach(function (cmb) {
                    grunt.config(['build_cmb_js', cmb], config.combine[cmb]);
                });
            }
        });

        grunt.file.write(absPub + '/config.json', JSON.stringify(grunt.config('g-config'), null, 4));
    });
}