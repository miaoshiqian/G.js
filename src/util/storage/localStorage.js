define(function ( require, exports, module ) {
    var config  = require( 'config' );
    var $       = require( 'jquery' );

    var storage;

    // in IE 6-7, we use UserData instead
    if ( !window.localStorage ) {
        // pause the module declearation until the iframe loaded
        module.pause();

        var iframe = document.createElement( 'IFRAME' );
        iframe.src = config.base + "/crossdomain.html";
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

            storage = function ( storeName ) {
                return {
                    set: function ( k, v ) {
                        data.setAttribute( k, v );
                        data.save( storeName );
                    },
                    get: function ( k ) {
                        data.load( storeName );
                        return data.getAttribute( k );
                    },
                    remove: function ( k ) {
                        dataObj.removeAttribute( k );
                        dataObj.save( storeName );
                    }
                };
            };

            var defaultStorage = storage( "LOCAL_STORAGE" );
            storage.get = defaultStorage.get;
            storage.set = defaultStorage.set;
            storage.remove = defaultStorage.remove;

            module.exports = storage;
            // this module is now ready
            module.resume();
        };

        document.insertBefore( iframe, document.firstChild );
    } else {
        storage = function ( storeName ) {
            return {
                set: function ( k, v ) {
                    return localStorage.setItem( storeName + k, v );
                },
                get: function ( k ) {
                    return localStorage.getItem( storeName + k );
                },
                remove: function ( k ) {
                    return localStorage.removeItem( storeName + k );
                }
            };
        };
        
        var defaultStorage = storage("");
        storage.get = defaultStorage.get;
        storage.set = defaultStorage.set;
        storage.remove = defaultStorage.remove;

        module.exports = storage;
    }
});