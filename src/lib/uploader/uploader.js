define(function (require, exports, module) {
    var $       = require('jquery');
    var Events  = require('lib/event/event.js');
    var Promise = require('Promise');

    function Uploader (config) {
        var self = this;

        config = $.extend({
            $el              : '',
            uploadTo         : '',
            debug            : true,
            maxNum           : 5,     // 最多上传文件数
            type             : 'gif,jpg,jpeg,png,bmp',

            height           : 0,
            width            : 0,
            button_image_url : 'http://sta.ganji.com/src/image/icon/upload.png',    // 按钮图片

            uploadedFiles    : [],    // 已上传的文件
            postParams       : {      // 随着文件上传时附带的数据
                maxSize          : 0,  // 设为0则按控件默认行为控制文件大小限制{ swf: 10mb, html: 10mb, ajax: 2mb}
                resizeImage      : true,
                resizeWidth      : 600,
                resizeHeight     : 600,
                resizeCutEnable  : false,

                createThumb      : false,
                thumbWidth       : 80,
                thumbHeight      : 80,
                thumbCutEnable   : true,

                minWidth         : 0,
                minHeight        : 0
            }
        }, config);

        var $el = config.$el = $(config.$el);
        self.$el   = $el;
        self.files = [];

        Events.mixTo(self);

        self.ready = Promise.defer().done;

        self.ready(function (type) {
            self.trigger('ready', type)
        });

        self
            .on('upload.success', function (file) {
                self.files.push(file);
            });

        require.async(['./flash_uploader.js'], function (FlashUploader) {
            var uploader = new FlashUploader(config);
            uploader.ready(function () {
                self.ready();
            })
            uploader
                .on('upload.start', function (file) {
                    self.trigger('upload.start', file)
                })
                .on('upload.success', function (file) {
                    self.trigger('upload.success', file);
                })
                .on('upload.cancel', function (file) {
                    self.trigger('upload.cancel', file);
                })
                .on('upload.error', function (file) {
                    self.trigger('upload.error', file);
                })
                .on('encode.progress', function (file, load, total) {
                    self.trigger('encode.progress', file, load, total);
                })
                .on('upload.progress', function (file, load, total) {
                    self.trigger('upload.progress', file, load, total);
                })
                .on('upload.complete', function (file) {
                    self.trigger('upload.complete', file);
                });
        });
    }

    Uploader.prototype.toJSON = function () {
        return JSON.stringify(this.files);
    }

    module.exports = Uploader;
});