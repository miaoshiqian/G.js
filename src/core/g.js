var G = this.G = {};

G.log = function (data) {
    if (G.config.debug && typeof console != 'undefined' && console.log){
        console.log(data);
    }
};