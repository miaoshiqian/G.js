var path = require('path');
var fs   = require('fs');
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

module.exports = function (grunt) {
    grunt.registerTask('build-js', 'Compile define(fn) into define(ID, deps, fn).', function () {
        var config = grunt.config('build-js');

        var files   = config.files;
        var dest    = config.dest;
        var exclude = config.exclude;
        if (!Array.isArray(files)) {
            files = grunt.task.expandFiles(files).map(function (file) {
                return file.rel;
            });
        } else {
            var tmp = [];
            files.forEach(function (file) {
                if (file.indexOf('*') !== -1) {
                    tmp.concat(grunt.task.expandFiles(file).map(function (f) {
                        return f.rel;
                    }));
                } else {
                    tmp.push(file);
                }
            });
            files = tmp;
        }
        files.forEach(function (file) {
            var content = fs.readFileSync(file).toString();
            var uri = file.replace('src/', '');
            var stat = fs.statSync(file);
            var isExcluded = exclude.some(function (pattern) {
                return grunt.file.isMatch(pattern, file);
            });

            if (!isExcluded) {
                grunt.log.writeln('building: '+uri);
                if (content.substr(0, 6) === 'define') {
                    content = transport(content, uri);
                    grunt.file.write(dest + uri, grunt.helper('uglify', content));
                } else {
                    grunt.file.write(dest + uri, grunt.helper('uglify', content));
                }
            }

            grunt.config(['g-config', 'version', uri], stat.mtime/1000);
        });
    });
};