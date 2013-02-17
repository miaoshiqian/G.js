module.exports = function(grunt) {
    var config = grunt.file.readJSON('config.json');
    grunt.initConfig(config);
    grunt.task.searchDirs.push(config.sourceDir);

    grunt.loadTasks('bin/tasks');
    grunt.registerTask('default', 'lint build');
};