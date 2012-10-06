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

    var config = G.config;
    var defers = {};
    var doc    = document;
    var head   = doc.head ||
                 doc.getElementsByTagName('head')[0] ||
                 docac.documentElement;
    var IS_CSS_RE = /\.css(?:\?|$)/i;

    config.server = config.servers[ G.util.math.random(0, config.servers.length - 1) ];
    var baseUrl   = config.server + config.base;

    G.use = function ( deps, cb ) {
        var module = Module( util.guid( 'module' ) );
        var id     = module.id;
        module.isAnonymous = true;
        deps = resolveDeps( deps );

        module.dependencies = deps;
        module.factory = cb;

        Module.wait( module );
    };

    global.define = G.add = function ( id, deps, fn ) {
        // NOTE: combo file must be defined in this style:
        // 
        // -------  test.cmb.js  ---------
        //       define( id1, deps1, fn1);
        //       define( id2, deps2, fn2);
        //       ...
        // -------    EOF    --------

        // NOTE: in developer mode:
        // -------  foo.js  ---------
        //       define( function (require, exports, module) {...} );
        // -------    EOF   ---------
        //       or
        // -------  bar.js  ---------
        //       define( [dep1, dep2, dep3], function (require, exports, module) { ... });
        // -------    EOF   ---------
        //       in `bar.js` style, we won't try to find any other dependencies in the callback,
        //       you must declear a full dependencies list and their `exports` will be the arguments of callback

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
            deps = util.lang.isFunction( fn ) ?
                   getDepsFromFnStr( fn.toString() ):
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

    function Require ( context ) {
        function require ( id ) {
            id = require.id( id );
            if ( !Require.cache[id] ) {
                throw new Error( 'This module is not found:' + id );
            }
            return Require.cache[id].exports;
        }

        require.id = function ( id ) {
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
        // TODO: implement require.paths

        require.cache = Require.cache;

        return require;
    }
    Require.cache = {};

    var require = Require( window.location.href ); // the default `require`

    /****** Module ******/
    
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

        if ( util.lang.isFunction ( module.factory ) ) {
            module.status = STATUS.COMPILING;
            try {
                // G.use( [dep1, dep2, ...], function (dep1, dep2, ...) {} );
                if ( module.isAnonymous ) {
                    deps = module.dependencies.map( function (dep) {
                        return dep.exports;
                    });
                    module.factory.apply( window, deps);
                }
                // define( id, deps, function (require, exports, module ) {} );
                else {
                    module.exports = {};
                    module.pause = function () {
                        module.status = STATUS.PAUSE;
                    };
                    module.resume = function () {
                        module.status = STATUS.COMPILED;
                        Require.cache[module.id] = module;
                        Module.defers[module.id].done();
                    };
                    Module.defers[module.id].done( function () {
                        delete module.pause;
                        delete module.resume;
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
            Require.cache[module.id] = module;
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

    Module.load = function ( module ) {
        var id      = module.id;
        var combine = config.combine[id];
        module.url = getAbsoluteUrl( id );

        if ( combine ) {
            combine = combine.map( function ( id ) {
                return Module( id );
            });

            if ( config.debug ) {
                define( id, combine.map( function ( dep ) {
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

        if ( IS_CSS_RE.test( module.url ) ) {
            cssLoader( module, function () {
                if ( combine ) {
                    combine.forEach( function ( dep ) {
                        dep.status = STATUS.COMPILED;
                        Module.defers[dep.id].done();
                    } );
                }
            });
        } else {
            jsLoader( module, function () {
                if ( isModuleURL( module.url ) && Module.queue.length ) {
                    var m = Module.queue.shift();
                    Module.save( module.id, m[0], m[1] ); // m[0] === deps, m[1] === fn
                }
            } );
        }
    };

    Module.save = function ( id, deps, fn ) {
        var module = Module( id );

        deps = resolveDeps( deps, id );

        module.dependencies = deps;
        module.factory      = fn;
        module.status       = STATUS.SAVED;

        Module.wait( module );
    };

    // Loaders
    function jsLoader ( module, onLoad ) {
        var node  = doc.createElement( "script" );
        var done  = false;
        var timer = setTimeout( function () {
            head.removeChild( node );
            moduleFail( module, 'Load timeout' );
        }, 30000 ); // 30s

        node.setAttribute( 'type', "text/javascript" );
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
                if ( util.lang.isFunction( onLoad ) ) {
                    onLoad();
                }
                if ( module.status > 0 && module.status < STATUS.SAVED ) {
                    G.log( module.id + 'is not a module' );
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
    var isOldWebKit = util.ua.webkit < 536;

    // `onload/onerror` event is supported since Firefox 9.0
    // Ref:
    //  - https://bugzilla.mozilla.org/show_bug.cgi?id=185236
    //  - https://developer.mozilla.org/en/HTML/Element/link#Stylesheet_load_events
    var isOldFirefox = window.navigator.userAgent.indexOf('Firefox') > 0 &&
        !('onload' in document.createElement('link'));

    function cssLoader ( module, onLoad ) {
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
            if ( util.lang.isFunction( onLoad ) ) {
                onLoad();
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
            return Module( require.id( dep ) );
        });
        var toFetch = modules.filter(function ( m ) {
            return m.status < STATUS.FETCHING;
        });

        toFetch.forEach( function ( dep ) {
            setTimeout(function () {
                Module.load( dep );
            }, 0);
        } );

        return modules;
    }
    var VERSION_RE = /-\d{1,20}\./;
    function URLtoID ( url ) {
        if ( !url ) return;
        if ( util.path.isAbsolute( url) ) {
            var found = false;
            for (var i = config.servers.length - 1; i >= 0; i--) {
                if ( url.indexOf( config.servers[i] ) === 0 ) {
                    found = config.servers[i];
                    break;
                }
            }
            if (found) {
                url = url.replace( found, '' );
            } else {
                return url;
            }
        }
        // remove config.base
        if ( url.indexOf( config.base ) === 0 ) {
            url = url.replace( config.base, '' );
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
        return util.path.realpath( baseUrl + url );
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

    function isModuleURL ( url ) {
        return url.indexOf( baseUrl ) === 0;
    }

    // get compling script node
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
               node.getAttribute('src', true);
        }
    }
    G.Module = {
        cache: Module.cache
    };
}) (window, G, G.util);

define( 'Deferred', [], G.Deferred );
define( 'util', [], G.util );
define( 'config', [], G.config );