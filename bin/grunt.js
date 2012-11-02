module.exports = function(grunt) {
    var src = '../src/';
    var dist = '../dist/';
    // Project configuration.
    grunt.initConfig({
        lint: {
            all: [
                src + 'core/boot.js',
                src + 'core/deferred.js',
                src + 'core/loader.js',
                src + 'core/util.js',
                src + 'util/storage/*'
            ]
        },
        jshint: {
            options: {
                browser: true,
                scripturl: true
            }
        },
        concat: {
            "g-debug.js": {
                src: [
                    src + 'core/boot.js',
                    src + 'core/es5-safe.js',
                    src + 'core/json2.js',
                    src + 'core/util.js',
                    src + 'core/deferred.js',
                    src + 'core/loader.js'
                ],
                dest: dist + 'g-debug.js'
            },
            "g-mobil.js": {
                src: [
                    src + 'core/boot.js',
                    src + 'core/util.js',
                    src + 'core/deferred.js',
                    src + 'core/loader.js'
                ],
                dest: dist + 'g-mobil.js'
            },
            "core/g.js": {
                src: [
                    src + 'core/boot.js',
                    src + 'core/es5-safe.js',
                    src + 'core/json2.js',
                    src + 'core/util.js',
                    src + 'core/deferred.js',
                    src + 'core/loader.js'
                ],
                dest: src + 'core/g.js'
            }
        },
        min: {
            "g-min.js": {
                src: [
                    src + 'core/boot.js',
                    src + 'core/es5-safe.js',
                    src + 'core/util.js',
                    src + 'core/deferred.js',
                    src + 'core/loader.js'
                ],
                dest: dist + 'g-min.js',
                separator: "\n"
            }
        }
    });
    grunt.registerTask('default', 'lint concat min');
};