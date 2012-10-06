var G = this.G = function () {
};

G.config = {
    debug   : true,
    servers : ['http://g.local'],
    base    : '/src/',
    version : {
        'util/storage/localStorage.js': 100000
    },
    alias   : {
        'jquery': 'lib/jquery/jquery-1.8.2.js',
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