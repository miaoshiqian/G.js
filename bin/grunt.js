var Path   = require('path');
var src  = Path.resolve('../src') + "/";
var dist = Path.resolve('../dist') + "/";
var pub  = Path.resolve('../public') + "/";

var gruntConfig = {
    lint: {
        all: [
            src + 'core/boot.js',
            src + 'core/deferred.js',
            src + 'core/loader.js',
            src + 'core/util.js',
            src + 'util/**/*.js'
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
        "g.js": {
            src: [
                src + 'core/boot.js',
                src + 'core/es5-safe.js',
                src + 'core/json2.js',
                src + 'core/util.js',
                src + 'core/deferred.js',
                src + 'core/loader.js'
            ],
            dest: src + 'g.js'
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
        },
        "public/g.js": {
            src: [
                src + 'core/boot.js',
                src + 'core/es5-safe.js',
                src + 'core/util.js',
                src + 'core/deferred.js',
                src + 'core/loader.js'
            ],
            dest: pub + 'g.js'
        }
    },
    build_js: {
        dest: pub,
        src: src,
        files: src+"**/*.js"
    },
    build_cmb_js: {
        'hello': '1'
    },
    build_css: {}
};

module.exports = function(grunt) {
    grunt.loadTasks('tasks');
    grunt.initConfig(gruntConfig);
    grunt.registerTask('default', 'load-config lint concat min build_js');
};