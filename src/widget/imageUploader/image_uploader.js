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
        this.setMessage('正在载入上传控件...');

        var uploader = new Uploader($.extend({}, config, {$el: this.$el.find('.js-btn-container')}));

        uploader.ready(function () {
            self.setMessage('上传控件载入成功');
        });

        uploader
            .on('upload.start', function (file) {
                self.onStart(file);
            })
            .on('upload.complete', function (file) {
                console.log('complete', file);
            })
            .on('encode.progress', function (file, load, total) {
                self.onEncodeProgress(file, load, total);
            })
            .on('upload.progress', function (file, load, total) {
                self.onProgress(file, load, total);
            })
            .on('upload.success', function (file) {
                self.onSuccess(file)
            });
    }

    ImageUploader.prototype.setMessage = function (msg) {
        this.$message.html(msg)
    }

    ImageUploader.prototype.onStart = function (fileInfo) {
        console.log(fileInfo, 'start');
        var self = this;

        var $file = $('<li></li>');
        var $status = $('<span class="js-status"></status>');
        var $close = $('<a href="###" class="js-close">删除</a>');

        $file
            .append($status)
            .appendTo(this.$list);

        this.fileEls[fileInfo.id] = $file;

        $status.text('正在等待');

        $close.on('click', function () {
            self.cancel(fileInfo.id);
            $file.remove();
            return false;
        });
    }

    ImageUploader.prototype.onSuccess = function (fileInfo) {
        var self    = this;
        var $file   = this.fileEls[fileInfo.id];
        var $status = $file.find('.js-status');
        var $close  = $file.find('.js-close');
        var $img    = $('<img>');
        console.log(fileInfo.url);
        $img.attr('src', fileInfo.url);

        $file.append($img);

        $status.text('上传成功');

        $close
            .off()
            .click(function () {
                $file.remove();
                self.remove(fileInfo.id);
                return false;
            });
    }

    ImageUploader.prototype.onError = function (fileInfo, msg) {
        var self    = this;
        var $file   = this.fileEls[fileInfo.id];
        var $status = $file.find('.js-status');
        var $close  = $file.find('.js-close');

        $close.hide();
        $status.text('上传失败:'+msg);

        setTimeout(function () {
            $file.remove();
        }, 3000);
    }

    ImageUploader.prototype.onProgress = function (fileInfo, load, total) {
        console.log(fileInfo.id, Object.keys(this.fileEls));
        var self    = this;
        var $file   = this.fileEls[fileInfo.id];
        var $status = $file.find('.js-status');

        var percent = parseInt(load/total*100);

        $status.text("正在上传:" + percent + "%");
    }

    ImageUploader.prototype.onEncodeProgress = function (fileInfo, load, total) {
        console.log(fileInfo.id, Object.keys(this.fileEls));
        var self    = this;
        var $file   = this.fileEls[fileInfo.id];
        var $status = $file.find('.js-status');

        var percent = parseInt(load/total*100);

        $status.text("正在压缩:" + percent + "%");
    }

    module.exports = ImageUploader;
});