M.wrap('github/jillix/editor/v0.0.1/editor.js', function (require, module, exports) {

// TODO warn when window closes and unsaved changes exists

var Bind = require('github/jillix/bind/v0.0.1/bind');

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
    
    if(self.changed === 1 && !self.saving) {
        
        self.saving = true;
        self.changed = 2;
        self.info.innerHTML = statusText[1];
        
        // TODO save data to db
        /*self.bind.crud.update({
            
        });
        request("save/" + docName, self.editor.getValue(), function(err) {
            
            if (err) {
                
                self.changed = 1;
                self.info.innerHTML = statusText[3];
            }
            else if (self.changed == 2) {
                
                self.changed = 0;
                self.info.innerHTML = statusText[2];
            }
            
            self.saving = false;
        });*/
        
        self.changed = 0;
        self.info.innerHTML = statusText[2];
        self.saving = false;
    }
}

function load () {
    var self = this;
    
    if (self.model && self.session) {
        
        // set mode
        self.session.setMode("ace/mode/json");
        
        // set status text
        self.info.innerHTML = statusText[6];
        
        var path = location.pathname.split('/').splice(3).join('/');
        var crud = {
            q: {_id: path},
            s: self.model._id
        };
        
        // load data from db into editor
        self.bind.crud.read(crud, function (err, data) {
            
            if (err || !data || !data[0]) {
                data = err = err ? [err.toString()] : [statusText[8]];
            }
            
            self.session.setValue(JSON.stringify(data[0], null, 4) + '\n');
            
            // set status text
            self.info.innerHTML = err ? statusText[7] : statusText[2];
        });
    }
}

function setModel (model) {
    this.model = model;
}

function init () {
    var self = this;
    self.load = load;
    config = self.mono.config.data;
    
    // listen to model event
    self.on('model', setModel);
    
    // init bind
    Bind(self).load(config.bind, function (err, bind) {
        
        if (err) {
            return;
        }
        
        // save bind instance
        self.bind = bind;
        
        // set an empty state is the same like: state.set(location.pathname);
        bind.view.render();
        
        // get info field dom ref
        if (config.info) {
            self.info = bind.view.dom.querySelector(config.info);
        }
        
        // get save button dom ref
        if (config.save) {
            self.save = bind.view.dom.querySelector(config.save);
            if(self.save) {
                self.save.addEventListener('click', function () {
                    saveDocument.call(self);
                }, false);
            }
        }
        
        // setup the ace editor
        setupAce.call(self);
        
        // init state
        bind.state.emit();
        
        // TODO get model from url on init
        self.emit('ready');
    });
}

module.exports = init;

return module;

});
