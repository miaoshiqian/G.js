var config = {
    "lint": {
        "files": [
            "src/core/boot.js",
            "src/core/deferred.js",
            "src/core/loader.js",
            "src/core/util.js",
            "src/util/**/*.js",
            "src/app/**/*.js",
            "bin/tasks/*.js"
        ]
    },
    "jshint": {
        "options": {
            "browser": true,
            "scripturl": true
        }
    },
    "concat": {
        "dist/g.js": {
            "src": [
                "src/core/es5-safe.js",
                "src/core/json2.js",
                "src/core/boot.js",
                "src/core/util.js",
                "src/core/deferred.js",
                "src/core/loader.js"
            ],
            "dest": "dist/g.js"
        },
        "dist/g-mobil.js": {
            "src": [
                "src/core/boot.js",
                "src/core/util.js",
                "src/core/deferred.js",
                "src/core/loader.js"
            ],
            "dest": "dist/g-mobil.js"
        },
        "src/g.js": {
            "src": [
                "src/core/es5-safe.js",
                "src/core/json2.js",
                "src/core/boot.js",
                "src/core/util.js",
                "src/core/deferred.js",
                "src/core/loader.js"
            ],
            "dest": "src/g.js"
        }
    },
    "build-config": {
        "files": "src/**/config.json",
        "dest": "public/config.json"
    },
    "build-js": {
        "files"  : "src/**/*.js",
        "dest"   : "public/",
        "exclude": ["src/core/*.js"]
    }
};

module.exports = function(grunt) {
    grunt.task.searchDirs.push('.');
    grunt.loadTasks('bin/tasks');
    grunt.initConfig(config);
    grunt.registerTask('default', 'lint concat build-js');
};