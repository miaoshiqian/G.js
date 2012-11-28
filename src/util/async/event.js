define(function ( require, exports, module ) {
    // console.log('this is ', module.id);
    var chain = require('./chain.js');
    // console.log( 'chain is ', chain );
    var events = {
        EventEmitter: function () {
            var listeners = {};
            var pub = {
                on: function (event, listener) {
                    listeners[event] = listeners[event] || [];
                    listeners[event].push({
                        fn: listener
                    });
                },
                once: function (event, listener) {
                    listeners[event] = listeners[event] || [];
                    listeners[event].push({
                        fn   : listener,
                        type : 1  // if (cb.type) { call_once }
                    });
                },
                off: function (event, listener) {
                    if (!event && !listener) { // then remove all
                        listeners = {};
                    } else if (event && !listener) {
                        listeners[event] = [];
                    } else if (event && listener) {
                        var temp = [];
                        var callbacks = listeners[event];
                        for (var i = callbacks.length - 1; i >= 0; i--) {
                            if (callbacks[i].fn !== listener) {
                                temp.push(callbacks[i]);
                            }
                        }
                        listeners[event] = temp;
                    }
                },
                emit: function (event) {
                    var callbacks = listeners[event] = listeners[event] || [], cb, temp = [];
                    var args = Array.prototype.slice.call(arguments, 1);
                    while(callbacks.length) {
                        cb = callbacks.shift();
                        cb.fn.apply(this, [event].concat(args));
                        if (!cb.type) {
                            temp.push(cb);
                        }
                    }
                    listeners[event] = temp;
                },
                listeners: function (event) {
                    // TODO: deep copy
                    if (event) {
                        return listeners[event];
                    } else {
                        return listeners;
                    }
                }
            };
            pub.trigger = pub.emit;
            return pub;
        }
    };
    return {
        events: events
    };
});