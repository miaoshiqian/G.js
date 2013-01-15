
module.exports = function (grunt) {
    grunt.registerTask('build-css', 'Compile css.', function () {
        var config = grunt.config('build-css');

        var files   = config.files;
        var dest    = config.dest;

        if (!Array.isArray(files)) {
            files = grunt.task.expandFiles(files).map(function (file) {
                return file.rel;
            });
        } else {
            var tmp = [];
            files.forEach(function (file) {
                if (file.indexOf('*') !== -1) {
                    tmp.concat(grunt.task.expandFiles(file).map(function (f) {
                        return f.rel;
                    }));
                } else {
                    tmp.push(file);
                }
            });
            files = tmp;
        }

        files.forEach(function (file) {
            var content = grunt.file.read(file);
            grunt.file.write(dest+file.replace('src/', ''), content);
        });
    });
};