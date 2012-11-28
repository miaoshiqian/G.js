module.exports = function(grunt) {
    grunt.task.searchDirs.push('.');
    var config = grunt.file.readJSON('config.json');
    grunt.loadTasks('bin/tasks');
    grunt.initConfig(config);
    grunt.registerTask('default', 'lint concat min build-js');
};