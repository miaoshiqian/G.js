define(function ( require, exports, module ) {
    var config  = require( 'config' );
    var $       = require( 'jquery' );

    var STORAGE_AGENT = '__STORAGE_AGENT__';
    var DEFAULT_NAMESPACE  = '__LOCAL_STORAGE__';

    var Storage;

    // in IE 6-7, we use UserData instead
    if ( !window.localStorage ) {
        // pause the module declearation until the iframe loaded
        module.pause();

        var iframe = document.createElement( 'IFRAME' );
        iframe.src = 'javascript: false;'
        iframe.style.display = "none";

        iframe.onload = function () {
            var doc = iframe.contentWindow.document;
            var data = doc.createElement( 'INPUT' );

            data.type = 'hidden';
            doc.insertBefore( data, doc.firstChild );

            if ( !data.addBehavior ) {
                throw new Error('this browser does not support userData');
            }

            data.addBehavior('#default#userData');

            Storage = function ( namespace ) {
                data.load( STORAGE_AGENT );
                var saved_namespace = [];
                try {
                    saved_namespace = JSON.parse( data.getAttribute( 'saved_namespace' ) ) || [];
                } catch ( ex ) {
                    // it is ok
                }

                saved_namespace.push( namespace );
                data.setAttribute( 'saved_namespace', saved_namespace );
                data.save( STORAGE_AGENT );

                var self = {
                    set: function ( k, v ) {
                        var saved_keys = {};

                        data.setAttribute( k, v );
                        data.save( namespace );
                        data.load( namespace );
                        try {
                            saved_keys = JSON.parse( data.getAttribute( 'saved_keys' ) ) || {};
                        } catch ( ex ) {
                            // it is ok
                        }
                        if ( !saved_keys[k] ) {
                            saved_keys[k] = 1;
                            data.setAttribute( 'saved_keys', JSON.stringify( saved_keys ) );
                            data.save( namespace );
                        }
                    },
                    get: function ( k ) {
                        data.load( namespace );
                        return data.getAttribute( k );
                    },
                    remove: function ( k ) {
                        var saved_keys = {};

                        data.removeAttribute( k );
                        data.save( namespace );
                        try {
                            saved_keys = JSON.parse( data.getAttribute( 'saved_keys' ) ) || {};
                        } catch {
                            // it is ok
                        }
                        if ( saved_keys[k] ) {
                            delete saved_keys[k];
                            data.setAttribute( 'saved_keys', JSON.stringify( saved_keys ) );
                            data.save( namespace );
                        }
                    },
                    clear: function () {
                        if ( namespace === DEFAULT_NAMESPACE ) {
                            // then clear all namespace;
                            data.load( STORAGE_AGENT );
                            var saved_namespace = {};
                            try {
                                saved_namespace = JSON.parse( data.getAttribute( 'saved_namespace' ) ) || {};
                            } catch ( ex ) {
                                // it is ok
                            }
                            Object.keys( saved_namespace ).forEach( function ( ns ) {
                                var storage = new Storage( ns );
                                storage.clear();
                            } );
                        } else {
                            // just clear this namespace
                            var saved_keys = self.get( '__SAVED_KEYS__' ) || {};
                            Object.keys( saved_keys ).forEach( function ( key ) {
                                self.remove( key );
                            });
                        }
                    }
                };
                return self;
            };

            var storage = Storage( DEFAULT_NAMESPACE );
            Storage.get = storage.get;
            Storage.set = storage.set;
            Storage.remove = storage.remove;

            module.exports = Storage;
            // this module is now ready
            module.resume();
        };

        iframe.src = config.base + "/crossdomain.html";
        document.insertBefore( iframe, document.firstChild );
    } else {
        Storage = function ( namespace ) {
            var saved_namespace = {};
            try {
                saved_namespace = JSON.parse( localStorage.getItem( STORAGE_AGENT + '__SAVED_NS__' ) ) || {};
            } catch ( ex ) {
                // it is ok;
            }
            if ( !saved_namespace[namespace] ) {
                saved_namespace[namespace] = 1;
                localStorage.setItem( STORAGE_AGENT + '__SAVED_NS__', JSON.stringify( saved_namespace ) );
            }

            var self = {
                set: function ( k, v ) {
                    localStorage.setItem( namespace + k, v );
                    var saved_keys = {};
                    try {
                        saved_keys = JSON.parse( localStorage.getItem( namespace + '__SAVED_K__' ) ) || {};
                    } catch ( ex ) {
                        // it is ok
                    }
                    if ( !saved_keys[k] ) {
                        saved_keys[k] = 1;
                        localStorage.setItem( namespace + '__SAVED_K__', JSON.stringify( saved_keys ) );
                    }
                },
                get: function ( k ) {
                    return localStorage.getItem( namespace + k );
                },
                remove: function ( k ) {
                    localStorage.removeItem( namespace + k );
                    var saved_keys = {};
                    try {
                        saved_keys = JSON.parse( localStorage.getItem( namespace + '__SAVED_K__' ) ) || {};
                    } catch ( ex ) {
                        // it is ok
                    }
                    if ( saved_keys[k] ) {
                        delete saved_keys[k];
                        localStorage.setItem( namespace + '__SAVED_K__', JSON.stringify( saved_keys ) );
                    }
                },
                clear: function () {
                    if ( namespace === DEFAULT_NAMESPACE ) {
                        // then clear all
                        localStorage.clear();
                    } else {
                        var saved_keys =  {};
                        try {
                            saved_keys = JSON.stringify( self.get( '__SAVED_K__' ) );
                        } catch ( ex ) {
                            // it is ok
                        }
                        Object.keys( saved_keys ).forEach( function ( key ) {
                            self.remove( key );
                        } );
                        localStorage.removeItem( namespace + '__SAVED_K__' );
                    }
                }
            };
            return self;
        };
        
        var storage = Storage("");
        Storage.get = storage.get;
        Storage.set = storage.set;
        Storage.remove = storage.remove;

        module.exports = Storage;
    }
});