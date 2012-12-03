var G = this.G = {};

(function () {
    var config = {};
    G.config = function ( key, value ) {
        if ( !arguments.length ) {
            return config;
        } else if ( arguments.length === 2 ) {
            G.config.set( key, value );
        } else if ( Array.isArray(key) || typeof key === 'string' ) {
            return G.config.get( key );
        } else if ( typeof key === 'object' ) {
            Object.keys( key ).forEach(function ( k ) {
                G.config.set( k, key[k] );
            });
        }
    };
    G.config.set = function ( key, value ) {
        var host = config;
        if ( Array.isArray( key ) ) {
            var tmp = key;
            key = tmp.pop();
            tmp.forEach(function ( k ) {
                if ( !host[k] ) {
                    host[k] = {};
                }
                host = host[k];
            });
        }
        host[key] = value;
    };
    G.config.get = function ( key ) {
        if ( !key ) {
            return config;
        }
        var host = config;
        if ( Array.isArray( key ) ) {
            var len = key.length, i;
            for ( i = 0; i <= len - 2; i++) {
                if ( host[key[i]] ) {
                    host = host[key[i]];
                } else {
                    return host[key[i]];
                }
            }
            key = key[len-1];
        }
        return host[key];
    };
})();

G.log = function (data) {
    if (G.config.debug && typeof console != 'undefined' && console.log){
        console.log(data);
    }
};
(function (G) {

    /******  Util  ******/
    G.util = {
        // prefix + '_' + timestamp + random
        guid: function ( prefix ) {
            prefix = prefix || '';
            return prefix  + '_' + Date.now() + Math.random();
        }
    };
    var util = G.util;

    /***** Language *****/
    util.lang = {
        isFunction: function ( obj ) {
            return typeof obj === 'function';
        },
        isString: function ( obj ) {
            return typeof obj === 'string';
        }
    };

    /******  Math  ******/
    util.math = {
        random: function ( from, to ) {
            return parseInt(Math.random() * (to - from + 1) + from, 10);
        }
    };


    /******  Path  ******/
    var MULTIPLE_SLASH_RE = /([^:\/])\/\/+/g;
    var DIRNAME_RE = /.*(?=\/.*$)/;

    util.path ={
        dirname: function ( url ) {
            var match = url.match(DIRNAME_RE);
            return (match ? match[0] : '.') + '/';
        },
        isAbsolute: function ( url ) {
            return url.indexOf('://') > 0 || url.indexOf('//') === 0;
        },
        isRelative: function ( url ) {
            return url.indexOf('./') === 0 || url.indexOf('../') === 0;
        },
        realpath: function (path) {
            MULTIPLE_SLASH_RE.lastIndex = 0;

            // 'file:///a//b/c' ==> 'file:///a/b/c'
            // 'http://a//b/c' ==> 'http://a/b/c'
            if (MULTIPLE_SLASH_RE.test(path)) {
                path = path.replace(MULTIPLE_SLASH_RE, '$1\/');
            }

            // 'a/b/c', just return.
            if (path.indexOf('.') === -1) {
                return path;
            }

            var original = path.split('/');
            var ret = [], part;

            for (var i = 0; i < original.length; i++) {
                part = original[i];

                if (part === '..') {
                    if (ret.length === 0) {
                        throw new Error('The path is invalid: ' + path);
                    }
                    ret.pop();
                } else if (part !== '.') {
                    ret.push(part);
                }
            }

            return ret.join('/');
        }
    };

    /*****  User Agent  *****/
    var ua = util.ua = {
        ie          : 0,
        opera       : 0,
        gecko       : 0,
        webkit      : 0,
        chrome      : 0,
        mobile      : null,
        air         : 0,
        ipad        : 0,
        iphone      : 0,
        ipod        : 0,
        ios         : null,
        android     : 0,
        os          : null
    };

    var UA = window.navigator.userAgent;

    if ( /windows|win32/i.test( UA ) ) {
        ua.os = 'windows';
    } else if ( /macintosh/i.test( UA ) ) {
        ua.os = 'macintosh';
    } else if ( /rhino/i.test( UA )) {
        ua.os = 'rhino';
    }

    if ( /KHTML/.test( UA ) ) {
        ua.webkit = true;
    }

    var match = UA.match( /AppleWebKit\/([^\s]*)/ );
    if ( match && match[1] ) {
        ua.webkit = numberify( match[1] );

        if ( / Mobile\//.test( UA ) ) {
            ua.mobile = "Apple";

            match = UA.match( /OS ([^\s]*)/ );
            if ( match && match[1] ) {
                match = numberify( match[1].replace( '_', '.' ) );
            }
            ua.ipad   = ( navigator.platform === 'iPad' )   ? match : 0;
            ua.ipod   = ( navigator.platform === 'iPod' )   ? match : 0;
            ua.iphone = ( navigator.platform === 'iPhone' ) ? match : 0;
            ua.ios    = ua.ipad || ua.iphone || ua.ipod;
        } else {
            match = UA.match( /NokiaN[^\/]*|Android \d\.\d|webOS\/\d\.\d/ );
            if ( match ) {
                ua.mobile = match[0];
            }
            if ( / Android/.test( ua ) ) {
                ua.mobile = 'Android';
                match = UA.match( /Android ([^\s]*);/ );
                if ( match && match[1] ) {
                    ua.android = numberify( match[1] );
                }
            }
        }

        match = UA.match( /Chrome\/([^\s]*)/ );
        if ( match && match[1] ) {
            ua.chrome = numberify( match[1] );
        } else {
            match = UA.match( /AdobeAIR\/([^\s]*)/ );
            if ( match ) {
                ua.air = match[0];
            }
        }
    }

    if ( !ua.webkit ) {
        match = UA.match( /Opera[\s\/]([^\s]*)/ );
        if ( match && match[1] ) {
            ua.opera = numberify( match[1] );
            match = UA.match( /Opera Mini[^;]*/ );
            if ( match ) {
                ua.mobile = match[0];
            }
        } else {
            match = UA.match( /MSIE\s([^;]*)/ );
            if ( match && match[1] ) {
                ua.ie = numberify( match[1] );
            } else {
                match = UA.match( /Gecko\/([^\s]*)/ );
                if ( match ) {
                    ua.gecko=1;
                    match = ua.match( /rv:([^\s\)]*)/ );
                    if ( match && match[1] ) {
                        ua.gecko = numberify( match[1] );
                    }
                }
            }
        }
    }


    function numberify ( str ) {
        var count = 0;
        return parseFloat( str.replace( /\./g, function() {
            return ( count++ == 1 ) ? '' : '.';
        } ) );
    }

}) (G);
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
/******** Loader ********/
(function ( global, G, util ) {
    var STATUS = {
        'ERROR'     : -2,   // The module throw an error while compling
        'FAILED'    : -1,   // The module file's fetching is failed
        'FETCHING'  : 1,    // The module file is fetching now.
        'FETCHED'   : 2,    // The module file has been fetched.
        'SAVED'     : 3,    // The module info has been saved.
        'READY'     : 4,    // The module is waiting for dependencies
        'COMPILING' : 5,    // The module is in compiling now.
        'PAUSE'     : 6,    // The moudle's compling is paused()
        'COMPILED'  : 7     // The module is compiled and module.exports is available.
    };

    var defers = {};
    var doc    = document;
    var head   = doc.head ||
                 doc.getElementsByTagName('head')[0] ||
                 doc.documentElement;
    var IS_CSS_RE = /\.css(?:\?|$)/i;
    var config = G.config();

    G.use = function ( deps, cb ) {
        var module = Module( util.guid( 'module' ) );
        var id     = module.id;
        module.isAnonymous = true;
        deps = resolveDeps( deps );

        module.dependencies = deps;
        module.factory = cb;

        Module.wait( module );
        return Module.defer[module.id];
    };

    var define = global.define = function ( id, deps, fn ) {
        if ( !util.lang.isString( id ) ) {
            deps = id;
            fn   = deps;
            id   = null;
        }
        if ( !Array.isArray( deps ) ) {
            fn   = deps;
            deps = null;
        }
        if ( !deps ) {
            deps = typeof fn === 'function' ?
                   getDepsFromFnStr( fn.toString() ) :
                   [];
        }

        if ( !id ) {
            if ( util.ua.ie && util.ua.ie <= 8 ) {
                var script = getComplingScriptNode();
                var url    = getScriptUrl( script );

                id = URLtoID( url );

                if ( id ) {
                    return Module.save( id, deps, fn );
                }
                G.log('could not got the id from interactive script');
            }
            return Module.queue.push( [deps, fn] );
        } else {
            return Module.save( id, deps, fn );
        }
    };
    define.amd = {};

    function Require ( context ) {
        context = context || window.location.href;
        function require ( id ) {
            id = require.resolve( id );
            if ( !Module.cache[id] || Module.cache[id].status !== STATUS.COMPILED ) {
                throw new Error( 'This module is not found:' + id );
            }
            return Module.cache[id].exports;
        }

        require.resolve = function ( id ) {
            if ( config.alias[id] ) {
                return config.alias[id];
            }

            if ( util.path.isAbsolute( id ) ) {
                return id;
            }

            if ( util.path.isRelative( id ) ) {
                return util.path.realpath( util.path.dirname( context ) + id );
            }
            return id;
        };

        require.async = G.use;

        // TODO: implement require.paths

        require.cache = Module.cache;

        return require;
    }

    var require = Require( window.location.href ); // the default `require`

    // Get or Create a module object
    function Module (id) {
        if ( !Module.cache[id] ) {
            Module.cache[id]  = {
                id           : id,
                status       : 0,
                dependencies : []
            };
            Module.defers[id] = G.Deferred();
        }
        return Module.cache[id];
    }

    Module.cache = {};
    Module.defers = {};
    Module.queue = [];

    Module.wait  = function ( module ) {
        var deps = module.dependencies.map( function ( dep ) {
            return Module.defers[dep.id];
        } );

        G.when( deps )
            .done( function () {
                Module.ready( module );
            } )
            .fail( function (msg) {
                Module.fail( module, new Error( msg ) );
            } );
    };

    Module.ready = function ( module ) {
        var deps;
        module.status = STATUS.READY;

        if ( typeof module.factory === 'function' ) {
            module.status = STATUS.COMPILING;
            try {
                // G.use( [dep1, dep2, ...], function (dep1, dep2, ...) {} );
                if ( module.isAnonymous ) {
                    deps = module.dependencies.map( function (dep) {
                        return dep.exports;
                    });
                    module.factory.apply( window, deps );
                }
                // define( id, deps, function (require, exports, module ) {} );
                else {
                    module.exports = {};

                    module.async = function () {
                        module.status = STATUS.PAUSE;
                        return function () {
                            module.status = STATUS.COMPILED;
                            Module.defers[module.id].done();
                        };
                    };
                    Module.defers[module.id].done( function () {
                        delete module.async;
                    });
                    var result = module.factory.call( window, Require( module.id ), module.exports, module );
                    if (result) {
                        module.exports = result;
                    }
                }
            } catch (ex) {
                module.status = STATUS.ERROR;
                Module.fail( module, ex);
                throw ex;
            }
        } else {
            module.exports = module.factory;
        }
        if ( module.status !== STATUS.PAUSE ) {
            module.status = STATUS.COMPILED;
            Module.defers[module.id].done();
        }
    };

    Module.fail  = function ( module, err ) {
        G.log( 'MOD: '+module.id );
        G.log( 'DEP: '+module.dependencies.map( function ( dep ) {
            return dep.id;
        } ) );
        G.log( 'ERR: '+err.message );
        Module.defers[module.id].fail();
        throw err;
    };

    Module.fetch = function ( module ) {
        var id     = module.id;
        module.url = getAbsoluteUrl( id );

        // always try .js ext
        var ext = getExt( module.url ) || '.js';
        var loader = Module.Plugin.Loaders[ext] || Module.Plugin.Loaders['.js'];

        loader( module, config );
    };

    Module.save = function ( id, deps, fn ) {
        var module = Module( id );

        deps = resolveDeps( deps, id );

        module.dependencies = deps;
        module.factory      = fn;
        module.status       = STATUS.SAVED;

        Module.wait( module );
    };

    Module.Plugin = {
        Loaders: {
            '.js'     : jsLoader,
            '.css'    : cssLoader,
            '.cmb.js' : cmbJsLoader
        }
    };

    // Loaders
    function cmbJsLoader ( module, config) {
        var id      = module.id;
        var combine = config.combine[id];

        if (combine) {
            if (config.debug) {
                return define(id, combine);
            } else {
                combine = combine.map(function (id) {
                    return Module(id);
                });
                combine.forEach(function (dep) {
                    if (dep.status < STATUS.FETCHING) {
                        dep.status = STATUS.FETCHING;
                    }
                });
            }
        }

        jsLoader(module, config);
    }

    function jsLoader ( module, config ) {
        var node  = doc.createElement( "script" );
        var done  = false;
        var timer = setTimeout( function () {
            head.removeChild( node );
            moduleFail( module, 'Load timeout' );
        }, 30000 ); // 30s

        node.setAttribute( 'type', "text/javascript" );
        node.setAttribute( 'charset', 'utf-8' );
        node.setAttribute( 'src', module.url );
        node.setAttribute( 'async', true );

        node.onload = node.onreadystatechange = function(){
            if ( !done &&
                    ( !this.readyState ||
                       this.readyState == "loaded" ||
                       this.readyState == "complete" )
            ){
                // clear
                done = true;
                clearTimeout( timer );
                node.onload = node.onreadystatechange = null;

                if (module.status === STATUS.FETCHING) {
                    module.status = STATUS.FETCHED;
                }
                if ( Module.queue.length ) {
                    var m = Module.queue.pop();
                    Module.save( module.id, m[0], m[1] ); // m[0] === deps, m[1] === fn
                }
                if ( module.status > 0 && module.status < STATUS.SAVED ) {
                    G.log( module.id + ' is not a module' );
                    Module.ready( module );
                }
            }
        };

        node.onerror = function( e ){
            clearTimeout( timer );
            head.removeChild( node );
            Module.fail( module, new Error( 'Load Fail' ) );
        };
        module.status = STATUS.FETCHING;
        head.appendChild( node );
    }

    // `onload` event is supported in WebKit since 535.23
    // Ref:
    //  - https://bugs.webkit.org/show_activity.cgi?id=38995
    var isOldWebKit = util.ua.webkit && util.ua.webkit < 536;

    // `onload/onerror` event is supported since Firefox 9.0
    // Ref:
    //  - https://bugzilla.mozilla.org/show_bug.cgi?id=185236
    //  - https://developer.mozilla.org/en/HTML/Element/link#Stylesheet_load_events
    var isOldFirefox = window.navigator.userAgent.indexOf('Firefox') > 0 &&
        !('onload' in document.createElement('link'));

    function cssLoader ( module, config ) {
        var id = module.id;
        var combine = config.combine[id];
        if ( combine ) {
            combine = combine.map( function ( id ) {
                return Module( id );
            });

            if ( config.debug ) {
                return define( id, combine.map( function ( dep ) {
                    return dep.id;
                } ) );
            } else {
                combine.forEach( function ( dep ) {
                    if ( dep.status < STATUS.FETCHING ) {
                        dep.status = STATUS.FETCHING;
                    }
                } );
            }
        }

        var node = doc.createElement( "link" );
        var timer;
        node.setAttribute( 'type', "text/css" );
        node.setAttribute( 'href', module.url );
        node.setAttribute( 'rel', 'stylesheet' );

        if ( !isOldWebKit && !isOldFirefox ) {
            node.onload = onCSSLoad;
            node.onerror = function () {
                clearTimeout( timer );
                head.removeChild( node );
                Module.fail( module, new Error( 'Load Fail' ) );
            };
        } else {
            setTimeout(function() {
                poll(node, onCSSLoad);
            }, 0); // Begin after node insertion
        }

        module.status = STATUS.FETCHING;
        head.appendChild(node);

        timer = setTimeout(function () {
            head.removeChild(node);
            Module.fail( module, new Error( 'Load timeout' ) );
        }, 30000); // 30s

        function onCSSLoad() {
            clearTimeout( timer );
            if (module.status === STATUS.FETCHING) {
                module.status = STATUS.FETCHED;
            }

            if ( combine ) {
                combine.forEach( function ( dep ) {
                    dep.status = STATUS.COMPILED;
                    Module.defers[dep.id].done();
                } );
            }
            Module.ready( module );
        }

        function poll(node, callback) {
            var isLoaded;
            if ( isOldWebKit ) {                // for WebKit < 536
                if ( node.sheet ) {
                    isLoaded = true;
                }
            } else if ( node.sheet ) {       // for Firefox < 9.0
                try {
                    if ( node.sheet.cssRules ) {
                        isLoaded = true;
                    }
                } catch ( ex ) {
                // The value of `ex.name` is changed from
                // 'NS_ERROR_DOM_SECURITY_ERR' to 'SecurityError' since Firefox 13.0
                // But Firefox is less than 9.0 in here, So it is ok to just rely on
                // 'NS_ERROR_DOM_SECURITY_ERR'
                    if (ex.name === 'NS_ERROR_DOM_SECURITY_ERR') {
                        isLoaded = true;
                    }
                }
            }

            setTimeout(function() {
                if (isLoaded) {
                    // Place callback in here due to giving time for style rendering.
                    callback();
                } else {
                    poll(node, callback);
                }
            }, 1);
        }

        return node;
    }

    // Util functions

    // convert dep string to module object, and fetch if not loaded
    function resolveDeps ( deps, context ) {
        var require = Require( context );
        var modules = deps.map( function (dep) {
            return Module( require.resolve( dep ) );
        });
        var toFetch = modules.filter(function ( m ) {
            return m.status < STATUS.FETCHING;
        });

        toFetch.forEach( function ( dep ) {
            setTimeout(function () {
                Module.fetch( dep );
            }, 0);
        } );

        return modules;
    }

    var VERSION_RE = /-\d{1,20}\./;
    function URLtoID ( url ) {
        if ( !url ) return;
        if ( util.path.isAbsolute( url) ) {
            var found = false;
            if (config.servers) {
                for (var i = config.servers.length - 1; i >= 0; i--) {
                    if ( url.indexOf( config.servers[i] + config.base ) === 0 ) {
                        found = config.servers[i] + config.base;
                        break;
                    }
                }
            }
            if (found) {
                url = url.replace( found, '' );
            } else {
                return url;
            }
        }
        // remove config.version
        if ( VERSION_RE.test(url) ) {
            url = url.replace( VERSION_RE, '.');
        }
        return url;
    }

    // convers id to absolute url
    function getAbsoluteUrl ( id ) {
        var url = id, base = config.base;
        if ( util.path.isAbsolute( id ) ) {
            return id;
        }
        if ( config.version ) {
            var v = Date.now();
            v = config.version[id] || parseInt( ( v - ( v%72E5 ) ) / 1000, 10 );
            url = id.replace(/(\.(js|css|html?|swf|gif|png|jpe?g))$/i, '-' + v +"$1");
        }
        if ( !config.server ) {
            config.server = config.servers[ G.util.math.random(0, config.servers.length - 1) ];
        }
        return util.path.realpath( config.server + config.base + url );
    }

    var REQUIRE_RE = /[^.]\s*require\s*\(\s*(["'])([^'"\s\)]+)\1\s*\)/g;
    function getDepsFromFnStr ( fnStr ) {
        var deps = [];
        REQUIRE_RE.lastIndex = 0;
        while( (match = REQUIRE_RE.exec( fnStr )) ) {
            deps.push( match[2] );
        }
        return deps;
    }

    // get compling script node, it works on IE
    var complingScript = null;
    function getComplingScriptNode () {
        if ( complingScript &&
            complingScript.readyState === 'interactive' )
        {
            return complingScript;
        }

        var scripts = head.getElementsByTagName( 'script' );
        var script, i = scripts.length - 1;
        for ( ; i >= 0; i-- ) {
            script = scripts[i];
            if ( script.readyState === 'interactive' ) {
                complingScript = script;
                return complingScript;
            }
        }
    }

    function getScriptUrl ( node ) {
        if (node) {
            return node.hasAttribute ?
               node.src :
               node.getAttribute('src', true, 4);
        }
    }

    function getExt ( url ) {
        var arr = url.split('.');
        if ( arr.length > 1 ) {
            return "." + arr[arr.length-1];
        }
    }
    G.Module = {
        cache: Module.cache,
        queue: Module.queue
    };

    define( 'Promise', [], function () {
        return {
            when: G.when,
            defer: G.Deferred
        };
    });
    define( 'util', [], G.util );
    define( 'config', [], G.config() );
    define( 'require', [], function () {
        return Require();
    });
}) (window, G, G.util);