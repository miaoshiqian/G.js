var G = this.G = {};

G.config = {
    debug   : true,
    servers : ['http://g.local'],
    base    : '/src/',
    version : {
        'util/storage/localStorage.js': 100000
    },
    alias   : {
        'jquery': 'lib/jquery/jquery-1.7.2.js',
        'localStorage': 'util/storage/localStorage.js'
    },
    combine : {
        'util/storage/storage.cmb.js': ['localStorage', './cookie.js', '.flashCookie.js']
    }
};

G.log = function (data) {
    if (G.config.debug && typeof console != 'undefined' && console.log){
        console.log(data);
    }
};

(function() {

  // es5-safe
  // ----------------
  // Provides compatibility shims so that legacy JavaScript engines behave as
  // closely as possible to ES5.
  //
  // Thanks to:
  //  - http://es5.github.com/
  //  - http://kangax.github.com/es5-compat-table/
  //  - https://github.com/kriskowal/es5-shim
  //  - http://perfectionkills.com/extending-built-in-native-objects-evil-or-not/
  //  - https://gist.github.com/1120592
  //  - https://code.google.com/p/v8/


  var OP = Object.prototype;
  var AP = Array.prototype;
  var FP = Function.prototype;
  var SP = String.prototype;
  var hasOwnProperty = OP.hasOwnProperty;
  var slice = AP.slice;


  /*---------------------------------------*
   * Function
   *---------------------------------------*/

  // ES-5 15.3.4.5
  // https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind
  FP.bind || (FP.bind = function(that) {
    var target = this;

    // If IsCallable(func) is false, throw a TypeError exception.
    if (typeof target !== 'function') {
      throw new TypeError('Bind must be called on a function');
    }

    var boundArgs = slice.call(arguments, 1);

    function bound() {
      // Called as a constructor.
      if (this instanceof bound) {
        var self = createObject(target.prototype);
        var result = target.apply(
            self,
            boundArgs.concat(slice.call(arguments))
        );
        return Object(result) === result ? result : self;
      }
      // Called as a function.
      else {
        return target.apply(
            that,
            boundArgs.concat(slice.call(arguments))
        );
      }
    }

    // NOTICE: The function.length is not writable.
    //bound.length = Math.max(target.length - boundArgs.length, 0);

    return bound;
  });


  // Helpers
  function createObject(proto) {
    var o;

    if (Object.create) {
      o = Object.create(proto);
    }
    else {
      /** @constructor */
      function F() {
      }

      F.prototype = proto;
      o = new F();
    }

    return o;
  }


  /*---------------------------------------*
   * Object
   *---------------------------------------*/
  // http://ejohn.org/blog/ecmascript-5-objects-and-properties/

  // ES5 15.2.3.14
  // http://whattheheadsaid.com/2010/10/a-safer-object-keys-compatibility-implementation
  // https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/keys
  // https://developer.mozilla.org/en/ECMAScript_DontEnum_attribute
  // http://msdn.microsoft.com/en-us/library/adebfyya(v=vs.94).aspx
  Object.keys || (Object.keys = (function() {
    var hasDontEnumBug = !{toString: ''}.propertyIsEnumerable('toString');
    var DontEnums = [
      'toString',
      'toLocaleString',
      'valueOf',
      'hasOwnProperty',
      'isPrototypeOf',
      'propertyIsEnumerable',
      'constructor'
    ];
    var DontEnumsLength = DontEnums.length;

    return function(o) {
      if (o !== Object(o)) {
        throw new TypeError(o + ' is not an object');
      }

      var result = [];

      for (var name in o) {
        if (hasOwnProperty.call(o, name)) {
          result.push(name);
        }
      }

      if (hasDontEnumBug) {
        for (var i = 0; i < DontEnumsLength; i++) {
          if (hasOwnProperty.call(o, DontEnums[i])) {
            result.push(DontEnums[i]);
          }
        }
      }

      return result;
    };

  })());


  /*---------------------------------------*
   * Array
   *---------------------------------------*/
  // https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array
  // https://github.com/kangax/fabric.js/blob/gh-pages/src/util/lang_array.js

  // ES5 15.4.3.2
  // https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/isArray
  Array.isArray || (Array.isArray = function(obj) {
    return OP.toString.call(obj) === '[object Array]';
  });


  // ES5 15.4.4.18
  // https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/array/foreach
  AP.forEach || (AP.forEach = function(fn, context) {
    for (var i = 0, len = this.length >>> 0; i < len; i++) {
      if (i in this) {
        fn.call(context, this[i], i, this);
      }
    }
  });


  // ES5 15.4.4.19
  // https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/map
  AP.map || (AP.map = function(fn, context) {
    var len = this.length >>> 0;
    var result = new Array(len);

    for (var i = 0; i < len; i++) {
      if (i in this) {
        result[i] = fn.call(context, this[i], i, this);
      }
    }

    return result;
  });


  // ES5 15.4.4.20
  // https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/filter
  AP.filter || (AP.filter = function(fn, context) {
    var result = [], val;

    for (var i = 0, len = this.length >>> 0; i < len; i++) {
      if (i in this) {
        val = this[i]; // in case fn mutates this
        if (fn.call(context, val, i, this)) {
          result.push(val);
        }
      }
    }

    return result;
  });


  // ES5 15.4.4.16
  // https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/every
  AP.every || (AP.every = function(fn, context) {
    for (var i = 0, len = this.length >>> 0; i < len; i++) {
      if (i in this && !fn.call(context, this[i], i, this)) {
        return false;
      }
    }
    return true;
  });


  // ES5 15.4.4.17
  // https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/some
  AP.some || (AP.some = function(fn, context) {
    for (var i = 0, len = this.length >>> 0; i < len; i++) {
      if (i in this && fn.call(context, this[i], i, this)) {
        return true;
      }
    }
    return false;
  });


  // ES5 15.4.4.21
  // https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/reduce
  AP.reduce || (AP.reduce = function(fn /*, initial*/) {
    if (typeof fn !== 'function') {
      throw new TypeError(fn + ' is not an function');
    }

    var len = this.length >>> 0, i = 0, result;

    if (arguments.length > 1) {
      result = arguments[1];
    }
    else {
      do {
        if (i in this) {
          result = this[i++];
          break;
        }
        // if array contains no values, no initial value to return
        if (++i >= len) {
          throw new TypeError('reduce of empty array with on initial value');
        }
      }
      while (true);
    }

    for (; i < len; i++) {
      if (i in this) {
        result = fn.call(null, result, this[i], i, this);
      }
    }

    return result;
  });


  // ES5 15.4.4.22
  // https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/reduceRight
  AP.reduceRight || (AP.reduceRight = function(fn /*, initial*/) {
    if (typeof fn !== 'function') {
      throw new TypeError(fn + ' is not an function');
    }

    var len = this.length >>> 0, i = len - 1, result;

    if (arguments.length > 1) {
      result = arguments[1];
    }
    else {
      do {
        if (i in this) {
          result = this[i--];
          break;
        }
        // if array contains no values, no initial value to return
        if (--i < 0)
          throw new TypeError('reduce of empty array with on initial value');
      }
      while (true);
    }

    for (; i >= 0; i--) {
      if (i in this) {
        result = fn.call(null, result, this[i], i, this);
      }
    }

    return result;
  });


  // ES5 15.4.4.14
  // https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/indexOf
  AP.indexOf || (AP.indexOf = function(value, from) {
    var len = this.length >>> 0;

    from = Number(from) || 0;
    from = Math[from < 0 ? 'ceil' : 'floor'](from);
    if (from < 0) {
      from = Math.max(from + len, 0);
    }

    for (; from < len; from++) {
      if (from in this && this[from] === value) {
        return from;
      }
    }

    return -1;
  });


  // ES5 15.4.4.15
  // https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/indexOf
  AP.lastIndexOf || (AP.lastIndexOf = function(value, from) {
    var len = this.length >>> 0;

    from = Number(from) || len - 1;
    from = Math[from < 0 ? 'ceil' : 'floor'](from);
    if (from < 0) {
      from += len;
    }
    from = Math.min(from, len - 1);

    for (; from >= 0; from--) {
      if (from in this && this[from] === value) {
        return from;
      }
    }

    return -1;
  });


  /*---------------------------------------*
   * String
   *---------------------------------------*/

  // ES5 15.5.4.20
  // https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/String/trim
  // http://blog.stevenlevithan.com/archives/faster-trim-javascript
  // http://jsperf.com/mega-trim-test
  SP.trim || (SP.trim = (function() {

    // http://perfectionkills.com/whitespace-deviations/
    var whiteSpaces = [

      '\\s',
      //'0009', // 'HORIZONTAL TAB'
      //'000A', // 'LINE FEED OR NEW LINE'
      //'000B', // 'VERTICAL TAB'
      //'000C', // 'FORM FEED'
      //'000D', // 'CARRIAGE RETURN'
      //'0020', // 'SPACE'

      '00A0', // 'NO-BREAK SPACE'
      '1680', // 'OGHAM SPACE MARK'
      '180E', // 'MONGOLIAN VOWEL SEPARATOR'

      '2000-\\u200A',
      //'2000', // 'EN QUAD'
      //'2001', // 'EM QUAD'
      //'2002', // 'EN SPACE'
      //'2003', // 'EM SPACE'
      //'2004', // 'THREE-PER-EM SPACE'
      //'2005', // 'FOUR-PER-EM SPACE'
      //'2006', // 'SIX-PER-EM SPACE'
      //'2007', // 'FIGURE SPACE'
      //'2008', // 'PUNCTUATION SPACE'
      //'2009', // 'THIN SPACE'
      //'200A', // 'HAIR SPACE'

      '200B', // 'ZERO WIDTH SPACE (category Cf)
      '2028', // 'LINE SEPARATOR'
      '2029', // 'PARAGRAPH SEPARATOR'
      '202F', // 'NARROW NO-BREAK SPACE'
      '205F', // 'MEDIUM MATHEMATICAL SPACE'
      '3000' //  'IDEOGRAPHIC SPACE'

    ].join('\\u');

    var trimLeftReg = new RegExp('^[' + whiteSpaces + ']+');
    var trimRightReg = new RegExp('[' + whiteSpaces + ']+$');

    return function() {
      return String(this).replace(trimLeftReg, '').replace(trimRightReg, '');
    }

  })());


  /*---------------------------------------*
   * Date
   *---------------------------------------*/

  // ES5 15.9.4.4
  // https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Date/now
  Date.now || (Date.now = function() {
    return +new Date;
  });

})();
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
                console.log( 'LOAD\t', module.url, module.status );
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
        if (complingScript &&
            complingScript.readyState === 'interactive')
        {
            return complingScript;
        }

        var scripts = head.getElementsByTagName('script');
        var script, i = scripts.length - 1;
        for ( ; i >= 0; i-- ) {
            script = scripts[i];
            if ( script.readyState === 'interactive' ) {
                complingScript = scripts[i];
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