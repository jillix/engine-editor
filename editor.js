M.wrap('github/jillix/editor/v0.0.1/editor.js', function (require, module, exports) {

// TODO warn when window closes and unsaved changes exists

var View = require('github/jillix/view/v0.0.1/view');

var statusText = [
    /*0*/
    "Document has changed",
    /*1*/
    "Document is saving...",
    /*2*/
    "All changes saved",
    /*3*/
    "An Error occurred while saving, please try again",
    /*4*/
    "Your changes are not saved!",
    /*5*/
    "Please wait till document is saved!",
    /*6*/
    "Document is loading...",
    /*7*/
    "Error while loading",
    /*8*/
    "Empty response"
];

function setupAce () {
    var self = this;
    
    self.editor = ace.edit("aceEdit");
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
    
    // save automatically after 1s, if doc has changed
    self.session.on("change", function() {
        self.changed = 1;
        self.info.innerHTML = statusText[0];
    });
}

function saveDocument() {
    var self = this;

    if(self.model && self.changed === 1 && !self.saving && !self.loading) {
        
        self.saving = true;
        self.changed = 2;
        self.info.innerHTML = statusText[1];
 
        // update an existing document
        if (self.data._id !== "new") {
            // save data to db
            var query = {
                q: {_id: self.data._id},
                d: JSON.parse(self.editor.getValue())
            };
            
            self.model.update(query, function (err) {
                
                if (err) {
                    self.changed = 1;
                    self.info.innerHTML = statusText[3];
                }
                else if (self.changed == 2) {
                    
                    self.changed = 0;
                    self.info.innerHTML = statusText[2];
                }
                
                self.saving = false;
            });
        // if new document then create
        } else if (self.data._id === "new") {
            // save data to db
            var query = {
                d: JSON.parse(self.editor.getValue())
            };

            self.model.create(query, function (err, data) {
                
                if (err) {
                    self.changed = 1;
                    self.info.innerHTML = statusText[3];
                }
                else if (self.changed == 2) {
                    
                    self.changed = 0;
                    self.info.innerHTML = statusText[2];
                }

                self.saving = false;
                self.view.state.emit(location.pathname.substring(0, location.pathname.length - 3) + data._id);
            });
        }
    }
}

function load (state, model, id) {
    var self = this;
    self.loading = 1;

    if (self.session) {

        // set mode
        self.session.setMode("ace/mode/json");

        // set status text
        self.info.innerHTML = statusText[6];

        // get model and read data
        var urlData;
        if (!model && !id) {
            urlData = getDataFromUrl(self.pattern);
            if (!urlData) {
                self.info.innerHTML = statusText[7];
                self.loading = 0;
                self.session.setValue(err || statusText[7]);
                return;
            }
            
            // no model message
            if (!urlData.model) {
                 self.info.innerHTML = statusText[7] + ' | No model name.';
                self.loading = 0;
                self.session.setValue(err || statusText[7]);
                return;
            }
            
            if (!urlData.id) {
                self.info.innerHTML = statusText[7] + ' | No id name.';
                self.loading = 0;
                self.session.setValue(err || statusText[7]);
                return;
            }
        } else {
            urlData = {
                model: model,
                id: id
            };
        }
        
        self.view.model(urlData.model, function (err, model) {

            if (err || !model) {
                self.info.innerHTML = statusText[7];
                self.loading = 0;
                self.session.setValue(err || statusText[7]);
                return;
            }

            self.model = model;

            // check if new
            if (urlData.id === 'new') {
                
                self.data = {};
                
                // add default data in editor
                self.session.setValue("{}");

                //set status text
                self.info.innerHTML = statusText[4];
                self.loading = 0;
                self.changed = 0;
            } else {

                var query = {
                    q: {_id: urlData.id}
                };

                // load data from db into editor
                model.read(query, function (err, data) {
                    
                    if (err || !data || !data[0]) {
                        data = err = err ? [err.toString()] : [statusText[8]];
                    }

                    self.data = data[0];
                    self.session.setValue(JSON.stringify(data[0], null, 4) + '\n');
                    
                    // set status text
                    self.info.innerHTML = err ? statusText[7] : statusText[2];
                    self.loading = 0;
                    self.changed = 0;
                });
            }
        });
    }
}

function getDataFromUrl (pattern) {
    var match = location.pathname.match(pattern);
    if (match && match[1] && match[2]) {
        return {
            model: match[1],
            id: match[2]
        };
    }

    return;
}

function init () {

    var self = this;
    var config = self.mono.config.data;

    self.load = load;
    self.loading = 0;
    
    if (!config.pattern) {
        return console.error('[editor: No pattern given.]');
    }
    
    // create regexp
    self.pattern = new RegExp(config.pattern);
    
    // init view
    View(self).load(config.view, function (err, view) {
        
        if (err) {
            return console.error('[editor: ' + err + ']');
        }
        
        // save view instance
        self.view = view;
        
        // set an empty state is the same like: state.set(location.pathname);
        view.template.render();
        
        // get info field dom ref
        if (config.info) {
            self.info = view.template.dom.querySelector(config.info);
        }
        
        // get save button dom ref
        if (config.save) {
            self.save = view.template.dom.querySelector(config.save);
            if(self.save) {
                self.save.addEventListener('click', function () {
                    saveDocument.call(self);
                }, false);
            }
        }
        
        // setup the ace editor
        setupAce.call(self);
        
        // set model
        view.state.emit();
        self.emit('ready');
    });
}

module.exports = init;

return module;

});
