var M = process.mono;
var Bind = require(M.config.paths.MODULE_ROOT + 'github/jillix/bind/v0.0.1/server/bind');

function init (config) {
    Bind(this);
}

module.exports = init;