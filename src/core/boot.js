var G = this.G = {};

G._config = {};

G.config = function ( config ) {
    Object.keys( config ).forEach( function (k) {
        G._config[k] = config[k];
    });
};

G.log = function (data) {
    if (G.config.debug && typeof console != 'undefined' && console.log){
        console.log(data);
    }
};