module.exports = function (grunt) {
    grunt.registerTask('build-test', 'build test case', function () {
        grunt.helper('build-test-index-page');
    });

    grunt.registerHelper('build-test-index-page', function () {
        var from = grunt.config('sourceDir');
        var to   = grunt.config('buildDir');

        var content = grunt.file.read(from + 'test/index.html');
        content = content.replace(/\{\{baseHost\}\}/g, grunt.config('baseHost'))
                         .replace(/\{\{baseUrl\}\}/g, grunt.config('baseUrl'));

        grunt.file.write(to + 'test/index.html', content);
    });
};