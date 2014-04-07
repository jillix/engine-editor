M.wrap('github/jillix/editor/v0.0.1/editor.js', function (require, module, exports) {

// TODO warn when window closes and unsaved changes exists

var View = require('github/jillix/view/v0.0.1/view');

var colors = {
    saved: 'rgba(24,160,24,.3)',
    change: 'rgba(24,160,224,.5)',
    error: 'rgba(160,24,24,.5)'
};

function setupAce (selector) {
    var self = this;
    
    self.editor = ace.edit(self.view.template.dom.querySelector(selector));
    self.border = $(self.editor.container.parentNode);
    self.session = self.editor.getSession();
    self.changed = 0;
    self.saving = false;
    
    //setup editor
    self.editor.setTheme("ace/theme/textmate");
    
    // set font size
    self.editor.setFontSize(13);
    
    //add ctrl-s command
    self.editor.commands.addCommand({
    
        name: "save",
        bindKey: {
        
            win: "Ctrl-S",
            mac: "Command-S",
            sender: "editor"
        },
        exec: function () {
            saveDocument.call(self);
        }
    });
    
    //add ctrl-d command
    self.editor.commands.addCommand({
    
        name: "delete",
        bindKey: {
        
            win: "Ctrl-D",
            mac: "Command-D",
            sender: "editor"
        },
        exec: function () {
            deleteDocument.call(self);
        }
    });
    
    // save automatically after 1s, if doc has changed
    self.session.on("change", function() {
        self.changed = 1;
        self.border.css('border-color', colors.change);
    });
}

function saveDocument() {
    var self = this;

    if(self.model && self.changed === 1 && !self.saving && !self.loading) {
        
        self.saving = true;
        self.changed = 2;
        self.border.css('border-color', colors.change);
        
        var query = {};
 
        // update an existing document
        if (self.data._id) {
            
            // save data to db
            query.q = {_id: self.data._id};
            query.d = JSON.parse(self.editor.getValue());
            
            self.model.update(query, function (err) {
                
                if (err) {
                    self.changed = 1;
                    self.border.css('border-color', colors.error);
                    alert(err);
                }
                else if (self.changed == 2) {
                    
                    self.changed = 0;
                    self.border.css('border-color', colors.saved);
                }
                
                self.saving = false;
            });
            
        // if new document then create
        } else {
            // save data to db
            query.d = JSON.parse(self.editor.getValue());

            self.model.create(query, function (err, data) {
                
                if (err) {
                    self.changed = 1;
                    self.border.css('border-color', colors.error);
                    alert(err);
                }
                else if (self.changed == 2) {
                    
                    self.changed = 0;
                    self.border.css('border-color', colors.saved);
                }
                
                self.saving = false;
                
                // emit state to reload data
                var state = getDataFromUrl(self.pattern, self.map);
                state = location.pathname.replace('/' + state.id + '/', '/' + data._id + '/');
                self.route(state);
            });
        }
    }
}

function deleteDocument () {
    var self = this;
    
    if (self.data._id) {
        if (confirm('Do you really want to delete this document ?')) {
            
            // remove document
            var query = {q: {_id: self.data._id}};
            self.model.delete(query, function (err, data) {
                
                if (err) {
                    self.changed = 1;
                    self.border.css('border-color', colors.error);
                    return alert(err);
                }
                
                // got to previous state
                history.back();
            });
        }
    }
}

function load (state, map) {
    var self = this;
    self.loading = 1;

    if (self.session) {

        // set mode
        self.session.setMode("ace/mode/json");

        // set status text
        self.border.css('border-color', colors.change);

        // get model and read data
        map = map || state.map;
        
        if (!map) {
            self.border.css('border-color', colors.error);
            self.loading = 0;
            self.session.setValue('[editor: no query data]');
            return;
        }
        
        self.view.model(map, function (err, model) {

            if (err || !model) {
                self.border.css('border-color', colors.error);
                self.loading = 0;
                self.session.setValue(err);
                return;
            }

            self.model = model;

            // check if new
            if (map.id === 'new') {
                
                self.data = {};
                
                // add default data in editor
                self.session.setValue("{}");

                //set status text
                self.border.css('border-color', colors.change);
                self.loading = 0;
                self.changed = 0;
            } else {

                var query = {
                    q: {_id: map.id}
                };

                // load data from db into editor
                model.read(query, function (err, data) {
                    
                    if (err || !data || !data[0]) {
                        data = err = err ? [err.toString()] : ["Empty response"];
                    }

                    self.data = data[0];
                    self.session.setValue(JSON.stringify(data[0], null, 4) + '\n');
                    
                    // set status text
                    self.border.css('border-color', err ? colors.error : colors.saved);
                    self.loading = 0;
                    self.changed = 0;
                });
            }
        });
    }
}

function getDataFromUrl (pattern, map) {
    var match = location.pathname.match(pattern);
    var output = {};
    
    if (!match) {
        return;
    }
    
    // create output
    for (var key in map) {
        if (map[key] instanceof Array) {
            output[key] = map[key][0] + match[map[key][1]] + (map[key][2] || '');
        } else {
            output[key] = match[map[key]];
        }
    }
    
    return output;
}

function init () {

    var self = this;
    var config = self.mono.config.data;

    self.load = load;
    self.loading = 0;
    
    // init view
    View(self).load(config.view, function (err, view) {
        
        if (err) {
            return console.error('[editor: ' + err + ']');
        }
        
        // save view instance
        self.view = view;
        
        // render html
        view.template.render();
        
        // setup the ace editor
        setupAce.call(self, config.editor);
        
        // set model
        self.emit('ready');
    });
}

module.exports = init;

return module;

});
