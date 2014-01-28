M.wrap('github/jillix/editor/v0.0.1/editor.js', function (require, module, exports) {

var Bind = require('github/jillix/bind/v0.0.1/bind');

function init () {
    var self = this;
    config = self.mono.config.data;
    
    // init bind
    Bind(self).load(config.bind, function (err, bind) {
        
        if (err) {
            // TODO do something on error
            return;
        }
        
        // save bind instance
        self.bind = bind;
        
        // set an empty state is the same like: state.set(location.pathname);
        bind.view.render();
        self.emit('ready');
    });
}

module.exports = init;

return module;

});
