module.exports = function (grunt) {
    grunt.registerTask('build-test', 'build test case', function () {
        grunt.helper('build-test-index-page');
    });

    grunt.registerHelper('build-test-index-page', function () {
        var content = grunt.file.read('src/test/index.html');
        content = content.replace(/\{\{baseHost\}\}/g, grunt.config('baseHost'))
                         .replace(/\{\{baseUrl\}\}/g, grunt.config('baseUrl'));

        grunt.file.write('public/test/index.html', content);
    });
};