var config = {
    "g-old.js": [
        "src/core/es5-safe.js",
        "src/core/json2.js",
        "src/core/boot.js",
        "src/core/util.js",
        "src/core/deferred.js",
        "src/core/loader.js"
    ],
    "g.js": [
        "src/core/boot.js",
        "src/core/util.js",
        "src/core/deferred.js",
        "src/core/loader.js"
    ]
};

module.exports = function (grunt) {
    grunt.registerTask('build-g-js', 'Build G.js.', function () {
        var files, content, dest;
        for (dest in config) {
            files = config[dest];

            content = grunt.helper('concat', files, {separator: '\n'});
            if (grunt.config('minify')) {
                content = grunt.helper('uglify', content);
            }
            console.log(grunt.config('dest') + dest);
            grunt.file.write(grunt.config('dest') + dest, content);
        }
    });
};