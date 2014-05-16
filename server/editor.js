var M = process.mono;

function init (config) {
    var self = this;
    
    // instance is ready
    self.emit('ready');
}

module.exports = init;