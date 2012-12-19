define(function (require, exports, module) {
    var Uploader = require('lib/uploader/uploader.js');
    var $ = require('jquery');
    var EventEmitter = require('lib/event/event.js');

    function ImageUploader (config) {
        var self = this;
        EventEmitter.mixTo(self);

        this.$el    = $(config.$el);
        this.config = config;

        this.$message     = this.$el.find('.js-message');
        this.$input       = this.$el.find('.js-input');
        this.$list        = this.$el.find('.js-img-list');
        this.fileEls      = {};

        this.setMessage = function (msg) {
            this.$message.html(msg);
        };
        this.fileEls = {};
        this.files = [];
        this.setMessage('正在载入上传控件...');

        var uploader = self.uploader = new Uploader($.extend({}, config, {$el: this.$el.find('.js-btn-container')}));

        uploader.ready(function () {
            self.setMessage('上传控件载入成功');
        });

        uploader
            .on('upload.start', function (file) {
                self.onStart(file);
            })
            .on('upload.complete', function (file) {
                self.onComplete(file);
            })
            .on('encode.progress', function (file, load, total) {
                self.onEncodeProgress(file, load, total);
            })
            .on('upload.progress', function (file, load, total) {
                self.onProgress(file, load, total);
            })
            .on('upload.success', function (file) {
                self.onSuccess(file);
            })
            .on('upload.error', function (file, msg) {
                self.onError(file, msg);
            });
    }

    ImageUploader.prototype.setMessage = function (msg) {
        this.$message.html(msg);
    };

    ImageUploader.prototype.onStart = function (file) {
        var self = this;

        var $file = $('<li></li>');
        var $status = $('<span class="js-status"></span>');
        var $close = $('<a href="###" class="js-close">删除</a>');

        $file
            .append($status)
            .appendTo(this.$list);

        this.fileEls[file.id] = $file;
        $status.text('正在等待');

        $close.on('click', function () {
            self.cancel(file.id);
            $file.remove();
            return false;
        });
    };

    ImageUploader.prototype.onSuccess = function (file) {
        var self    = this;
        var $file   = this.fileEls[file.id];
        var $status = $file.find('.js-status');
        var $close  = $file.find('.js-close');
        var $img    = $('<img>');
        $img.attr('src', file.url);

        $file.append($img);

        $status.text('上传成功');

        this.$input.val(this.toJSON());

        $close
            .off()
            .click(function () {
                $file.remove();
                self.remove(file.id);
                return false;
            });
    };

    ImageUploader.prototype.onError = function (file, msg) {
        var $file   = this.fileEls[file.id];
        var $status = $file.find('.js-status');
        var $close  = $file.find('.js-close');

        $close.hide();
        $status.text('上传失败:'+msg);

        setTimeout(function () {
            $file.remove();
        }, 3000);
    };

    ImageUploader.prototype.onProgress = function (file, load, total) {
        var $file   = this.fileEls[file.id];
        var $status = $file.find('.js-status');

        var percent = parseInt(load/total*100, 10);

        $status.text("正在上传:" + percent + "%");
    };

    ImageUploader.prototype.onEncodeProgress = function (file, load, total) {
        var $file   = this.fileEls[file.id];
        var $status = $file.find('.js-status');

        var percent = parseInt(load/total*100, 10);
        $status.text("正在压缩:" + percent + "%");
    };

    ImageUploader.prototype.onComplete = function (file) {

    };

    ImageUploader.prototype.onError = function (file, msg) {
        var $file = this.fileEls[file.id];
        $status   = $file.find('.js-status');

        $status.text("上传失败:" + msg);
    }

    ImageUploader.prototype.toJSON = function () {
        return this.uploader.toJSON();
    };

    module.exports = ImageUploader;
});