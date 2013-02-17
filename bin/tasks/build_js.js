var REQUIRE_RE = /[^.]\s*require\s*\(\s*(["'])([^'"\s\)]+)\1\s*\)/g;

module.exports = function (grunt) {
    var minify  = grunt.config('minify');
    var from    = grunt.config('src');
    var to      = grunt.config('dest');

    grunt.registerTask('build-js', 'Transport js files', function () {
        var files = [].slice.call(arguments);

        files.forEach(builder);
    });

    function builder (id) {
        grunt.log.writeln('Building JS:'+id);
        try {
            var content = grunt.file.read(from + id);

            if (grunt.helper('uglify', content).substr(0, 6) === 'define') {
                content = transport(content, id);
                grunt.file.write(to + id, minify ? grunt.helper('uglify', content) : content);
            } else {
                grunt.file.write(to + id, minify ? grunt.helper('uglify', content) : content);
            }
        } catch (ex) {
            grunt.log.error(id);
        }
        grunt.log.ok(id);
    }

    function transport (content, id) {
        /*jshint evil:true */
        function define(factory) {
            var deps = "[]";
            if (arguments.length === 1) {
                if (typeof factory === 'object') {
                    factory = JSON.stringify(factory);
                } else {
                    factory = factory.toString();
                    deps = [];
                    REQUIRE_RE.lastIndex = 0;

                    while((match = REQUIRE_RE.exec(factory))) {
                        deps.push(match[2]);
                    }

                    deps = JSON.stringify(deps);
                }
                return 'define("' + id + '", ' + deps + ', ' + factory + ')';
            }
        }

        return eval(content);
    }
};