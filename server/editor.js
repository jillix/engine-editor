var M = process.mono;
var View = require(M.config.paths.MODULE_ROOT + 'github/jillix/view/v0.0.1/server/view');

function init (config) {
    var self = this;
    
    // plug View
    View(self, function (err) {
        
        // instance is ready
        self.emit('ready', err);
    });
}

module.exports = init;