module.exports = function (grunt) {
    grunt.registerTask('build-cmb-js', 'combine javascript files', function () {
        var files      = grunt.config(['update-list', 'config']);
        var prevConfig = grunt.config('prev-config');
        var updateList = [];
        files.forEach(function (file) {
            var config = grunt.config(['g-config', 'config', file]);
            var combine = config.combine || {};
            var prop, list;

            list = Object.keys(combine).filter(function (cmbFile) {
                var prevSetting = prevConfig.config[cmbFile];
                if (!prevSetting) {
                    return true;
                }
                for (var i = 0; i < cmbFile.length; i++) {
                    if (cmbFile[i] !== prevSetting[i]) {
                        return true;
                    }
                }
                return false;
            });

            updateList.concat(list);
        });
    });
};