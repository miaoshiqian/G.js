module.exports = function (grunt) {
    var builders = grunt.config('builder');
    grunt.registerTask('build', 'The Builder', function () {
        var files = [].slice.call(arguments);
        var tasks = {};

        if (!files.length) {
            var src = grunt.config('src');
            files = grunt.task.expandFiles(src + '**/*').map(function (file) {
                return file.rel;
            }).map(function (file) {
                return file.replace(src, '');
            });
        }

        files.forEach(function (file) {
            var stack = [];
            for (var i = 0; i < builders.length; i++) {
                if (grunt.file.isMatch(builders[i][0], file)) {
                    stack = builders[i].slice(1);
                    break;
                }
            }

            if (stack.length) {
                grunt.task.run(stack.map(function (task) { return task + ':' + file; }).join(' '));
            }
        });
    });
};