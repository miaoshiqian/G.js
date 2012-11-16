var path = require('path');
var fs   = require('fs');
function transport(str, id) {
    return eval(str);
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
    grunt.registerTask('build_js', 'Compile define(fn) into define(ID, deps, fn).', function () {
        var config = grunt.config('build_js');

        var files  = grunt.task.expandFiles(path.relative(__dirname, config.files));
        var dest   = config.dest;
        var src    = config.src;

        files.forEach(function (file) {
            var f = fs.readFileSync(file.abs).toString();
            var uri = file.abs.replace(src, '');
            var stat = fs.statSync(file.abs);

            if (f.substr(0, 6) === 'define') {
                content = transport(f, uri);
                grunt.file.write(dest + uri, grunt.helper('uglify', content));
                grunt.log.writeln(uri, 'updated');
            }
            grunt.config(['g-config', 'version', uri], stat.mtime/1000);
        });
    });}