var fs = require('fs');

module.exports = function (grunt) {
    grunt.registerTask('build-config', 'load all configure for future compiling', function () {
        var config = grunt.config('build-config');
        grunt.config(['update-list', 'config'], []);

        var prevConfig;
        try {
            prevConfig = grunt.file.readJSON(config.dest);
        } catch (ex){
            prevConfig = {};
        }

        var files = grunt.task.expandFiles(config.files);

        prevConfig.version = prevConfig.version || {};
        files.forEach(function (file) {
            var stat = fs.statSync(file.abs);
            if (prevConfig.version[file.rel] !== stat.mtime/100) {
                grunt.config(['update-list', 'config']).push(file);
            }
        });

    });
};