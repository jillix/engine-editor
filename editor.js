M.wrap('github/jillix/editor/v0.0.1/editor.js', function (require, module, exports) {

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
    "Document is loading..."
];

function setupAce () {
    var editor = ace.edit("aceEdit");
    var session = editor.getSession();
    var info = document.getElementById("info");
    var docName = window.location.pathname.substr(1);
    var docType = docName.split(".").pop().toLowerCase();
    var fileName = docName.split('/').pop();
    var unsavedChanges = 0;
    var saving = false;
    
    //setup editor 
    editor.setTheme("ace/theme/textmate");
    session = editor.getSession();
    
    info.innerHTML = statusText[6];
    
    // set font size
    editor.setFontSize(13);
    
    // set mode
    switch (docType) {
        case "htm":
        case "html":
            docType = "html";
            break;
        case "css":
            docType = "css";
            break;
        default:
            docType = "javascript";
            break;
    }
    session.setMode("ace/mode/" + docType);
    
    //add ctrl-s command
    editor.commands.addCommand({
    
        name: "save",
        bindKey: {
        
            win: "Ctrl-S",
            mac: "Command-S",
            sender: "editor"
        },
        exec: function () {
            console.log('save');
        }
    });
    
    session.setValue('');
    
    var interval;
    session.on("change", function() {

        unsavedChanges = 1;
        info.innerHTML = statusText[0];
        
        if (!interval) {
            interval = setTimeout(function () {
                interval = null;
                //saveDocument(editor);
            }, 1000);
        }
    });
}

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
        
        setupAce();
        
        self.emit('ready');
    });
}

module.exports = init;

return module;

});
