var File = require('file');
var Path   = require('path');
var Promise = require('node-promise');
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
    build_cmb_js: {},
    build_css: {}
};

var compileConfigs = []
File.walkSync(src + "util/storage", function (path, dirs, files) {
    files && files.forEach(function (file) {
        if (Path.basename(file) === 'compile.config.json') {
            compileConfigs.push(Path.normalize(path + '/' + file));
        }
    });
});

compileConfigs.forEach(function (config) {
    var config = require(config);
    config.combine && Object.keys(config.combine).forEach(function (cmb) {
        gruntConfig.build_cmb_js[cmb] = {
            src: config.combine[cmb].map(function (file){ return src + file; }),
            dest: pub + cmb,
            separator: "\n;"
        }
    });
});

module.exports = function(grunt) {
    grunt.loadTasks('tasks');
    grunt.initConfig(gruntConfig);
    grunt.registerTask('default', 'lint concat min build_js');
};