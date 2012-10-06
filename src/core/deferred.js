(function () {
G.Deferred = function (){
    // state in ['pending', 'done', 'fail']
    var state = "pending";
    var callbacks = {
            'done':     [],
            'fail':     [],
            'always':   []
        };
    // `args` will be the `arguments` of callbacks
    var args = [];

    function dispatch ( status, cb ) {
        if (typeof cb === 'function') {
            if ( state === status || (status === 'always' && state !== 'pending') ) {
                setTimeout( function () {
                    cb.apply( {}, args );
                }, 0 );
            } else {
                callbacks[status].push( cb );
            }
        } else if ( state === 'pending' ) { // only 'pending' can change to 'done' or 'fail'
            state = status;
            var cbs = callbacks[status];
            var always = callbacks.always;
            /*jshint loopfunc:true*/
            while( (cb = cbs.shift()) || (cb = always.shift()) ) {
                setTimeout( (function ( fn ) {
                    return function () {
                        fn.apply( {}, args );
                    };
                })( cb ), 0 );
            }
        }
    }

    return {
        state: function () {
            return state; 
        },
        done: function (cb) {
            if (typeof cb === 'function') {
                dispatch('done', cb);
            } else {
                args = [].slice.call(arguments);
                dispatch('done');
            }
            return this;
        },
        fail: function (cb) {
            if (typeof cb === 'function') {
                dispatch('fail', cb);
            } else {
                args = [].slice.call(arguments);
                dispatch('fail');
            }
            return this;
        },
        always: function (cb) {
            if (typeof cb === 'function') {
                dispatch('always', cb);
            }
            return this;
        },
        promise: function () {
            return {
                done: function (cb) {
                    if (typeof cb === 'function') {
                        dispatch('done', cb);
                    }
                    return this;
                },
                fail: function (cb) {
                    if (typeof cb === 'function') {
                        dispatch('fail', cb);
                    }
                    return this;
                },
                always: function (cb) {
                    if (typeof cb === 'function') {
                        dispatch('always', cb);
                    }
                    return this;
                },
                state: function () {
                    return state;
                }
            };
        }
    };
};

G.when = function ( defers ){
    if ( !Array.isArray( defers) ) {
        defers = [].slice.call(arguments);
    }
    var ret     = G.Deferred();
    var len     = defers.length;
    var count   = 0;
    
    if (!len) {
        return ret.done().promise();
    }

    /*jshint loopfunc:true*/
    for ( var i = defers.length - 1; i >= 0; i-- ) {
        defers[i].fail(function () {
            ret.fail();
        }).done(function () {
            if ( ++count === len ) {
                ret.done();
            }
        });
    }
    return ret.promise();
};
})( G );