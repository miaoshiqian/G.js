var path = require('path');
var fs   = require('fs');
var uglifyjs = require('uglify-js');
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

function minifyCode(code) {
    var jsp = uglifyjs.parser;
    var pro = uglifyjs.uglify;

    var ast = jsp.parse(code); // parse code and get the initial AST
    ast = pro.ast_mangle(ast); // get a new AST with mangled names
    ast = pro.ast_squeeze(ast); // get an AST with compression optimizations
    return pro.gen_code(ast); // compressed code here
}

module.exports = function (grunt) {
    grunt.registerTask('build_js', 'Compile define(fn) into define(ID, deps, fn).', function () {
        grunt.helper('build_js', grunt.config('build_js'));
    });
    grunt.registerHelper('build_js', function(config) {
        var files = grunt.task.expandFiles(path.relative(__dirname, config.files));
        var dest = config.dest;
        var src = config.src;
        files.forEach(function (file) {
            var f = fs.readFileSync(file.abs).toString();

            if (f.substr(0, 6) === 'define') {
                content = transport(f, file.abs.replace(src, ''));
                grunt.file.write(dest + file.abs.replace(src, ''), minifyCode(content));
            }
        });
    });
}