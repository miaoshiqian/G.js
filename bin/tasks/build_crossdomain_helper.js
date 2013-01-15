module.exports = function (grunt) {
    grunt.registerTask('build-crossdomain-helper', 'build test case', function () {
        grunt.file.write('public/crossdomain.html',
            grunt.file.read('src/crossdomain.html')
                .replace(/\{\{baseHost\}\}/g, grunt.config('baseHost'))
        );

        grunt.file.write('public/crossdomain.xml',
            grunt.file.read('src/crossdomain.xml')
                .replace(/\{\{baseHost\}\}/g, grunt.config('baseHost'))
        );
    });
};