module.exports = function(grunt) {
    var src = '../src/';
    var dist = '../dist/';
    // Project configuration.
    grunt.initConfig({
        lint: {
            all: [
                src + 'core/deferred.js',
                src + 'core/g.js',
                src + 'core/loader.js',
                src + 'core/util.js',
                src + 'util/storage/*'
            ]
        },
        jshint: {
            options: {
                browser: true
            }
        },
        concat: {
            "g.js": {
                src: [
                    src + 'core/g.js',
                    src + 'core/es5-safe.js',
                    src + 'core/util.js',
                    src + 'core/deferred.js',
                    src + 'core/loader.js'
                ],
                dest: dist + 'g-debug.js'
            }
        },
        min: {
            "g.js": {
                src: [
                    src + 'core/g.js',
                    src + 'core/es5-safe.js',
                    src + 'core/util.js',
                    src + 'core/deferred.js',
                    src + 'core/loader.js'
                ],
                dest: dist + 'g.js',
                separator: "\n"
            }
        }
    });
    grunt.registerTask('default', 'lint concat min');
};