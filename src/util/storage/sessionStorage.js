define(function ( require, exports, module ) {

    if ( !window.sessionStorage ) {
        module.pause();
        require.async( './localStorage.js', function ( localStorage ) {
            var Storage = new localStorage('SESSION_STORAGE');
            Storage.clear();
        });
    }
});