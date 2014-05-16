M.wrap('github/jillix/editor/v0.0.1/editor.js', function (require, module, exports) {

// TODO warn when window closes and unsaved changes exists

var colors = {
    saved: 'rgba(24,160,24,.3)',
    change: 'rgba(24,160,224,.5)',
    error: 'rgba(160,24,24,.5)'
};

function setupAce (selector) {
    var self = this;
    
    if (!self.layout.dom) {
        return '[editor: View has no dom]';
    }
    
    self.editor = ace.edit(self.layout.dom.querySelector(selector));
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
    self.editor.getSession().on("change", function() {
        self.changed = 1;
        self.border.css('border-color', colors.change);
    });
}

function saveDocument() {
    var self = this;

    if(self.view && self.changed === 1 && !self.saving && !self.loading) {
        
        self.saving = true;
        self.changed = 2;
        self.border.css('border-color', colors.change);
        
        var query = {};
 
        // update an existing document
        if (self.data._id) {
            
            // save data to db
            query.m = 'update';
            query.q = {_id: self.data._id};
            query.d = JSON.parse(self.editor.getValue());
            
            self.currentView.req(query, function (err) {
                
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
            query.m = 'insert';
            query.d = JSON.parse(self.editor.getValue());

            self.currentView.req(query, function (err, data) {
                
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
            var query = {
                m: 'remove',
                q: {_id: self.data._id}
            };
            self.currentView.req(query, function (err, data) {
                
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

function load (state) {
    var self = this;
    self.loading = 1;

    // set mode
    self.editor.getSession().setMode("ace/mode/json");

    // set status text
    self.border.css('border-color', colors.change);

    self.view(state.view, function (err, view) {

        if (err || !view) {
            self.border.css('border-color', colors.error);
            self.loading = 0;
            self.editor.setValue(err);
            return;
        }
        
        // create query from view config
        var query = getDataFromUrl(view.config.re, view.config.map);
        
        // merge static query
        if (view.config.query) {
            for (var prop in view.config.query) {
                query[prop] = view.config.query[prop];
            }
        }
        
        // check if it's a new item
        if(view.config.create && query[view.config.create.key] && query[view.config.create.key] === view.config.create.value) {
            self.data = {};
            
            // add default data in editor
            self.editor.setValue('{\n\t"name": ""\n}');

            //set status text
            self.border.css('border-color', colors.change);
            self.loading = 0;
            self.changed = 0;
            
            return;
        }
        
        self.currentView = view;
        
        // load data from db into editor
        view.req({m: 'findOne', q: query}, function (err, data) {
            
            if (err || !data) {
                data = err = err ? [err.toString()] : ["Empty response"];
            }

            self.data = data;
            self.editor.setValue(JSON.stringify(data, null, 4) + '\n');
            
            // set status text
            self.border.css('border-color', err ? colors.error : colors.saved);
            self.loading = 0;
            self.changed = 0;
        });
    });
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

    self.loading = 0;
    
    // init view
    self.view(config.view, function (err, view) {
        
        if (err) {
            return console.error('[editor: ' + err + ']');
        }
        
        // render html
        view.render();
        
        // save view instance
        self.layout = view;
        
        // setup the ace editor
        var error = setupAce.call(self, config.editor);
        if (error) {
            return console.error(error);
        }
        
        self.load = load;
        self.emit('ready');
    });
}

module.exports = init;

return module;

});
