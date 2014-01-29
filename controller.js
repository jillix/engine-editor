
var docName = window.location.pathname.substr(1);
var docType = docName.split(".").pop().toLowerCase();
var fileName = docName.split('/').pop();
var unsavedChanges = 0;
var saving = false;
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

//document references
var info = document.getElementById("info");
var editor = ace.edit("editor");
var session = editor.getSession();

info.innerHTML = docName + " | " + statusText[6];
document.title = "*" + fileName;

//setup editor 
editor.setTheme("ace/theme/textmate");
session = editor.getSession();

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
    exec: saveDocument
});

request("read/" + docName, function(err, data) {
    
    info.innerHTML = docName + " | " + statusText[2];
    document.title = fileName;
    
    session.setValue(err ||data);
    
    var interval;
    session.on("change", function() {

        unsavedChanges = 1;
        document.title = "*" + fileName;
        info.innerHTML = docName + " | " + statusText[0];
        
        if (!interval) {
            interval = setTimeout(function () {
                interval = null;
                saveDocument(editor);
            }, 1000);
        }
    });
});

//check status before window close
window.onbeforeunload = function() {
    
    if (unsavedChanges == 1) {
        
        return statusText[4];
    }
    
    if (unsavedChanges == 2) {
         
        return statusText[5];
    }
};

function request (operation, data, callback) {
    
    if (typeof data == "function") {
        
        callback = data;
        data = "";
    }
    
    var link = new XMLHttpRequest();
    var url = operation + "";
    
    link.open(data ? "post" : "get", "/@/" + url);
    
    link.setRequestHeader("content-type", "text/plain; charset=utf-8");
    
    link.onreadystatechange = function() {
    
        //check if request is complete
        if (link.readyState == 4) {

            // get error message
            var err = link.status < 400 ? null : (link.responseText || "ERR");

            if (typeof callback == "function") {

                callback(err, link.responseText);
            }
        }
    };
    
    // send data
    link.send(data);
}

function saveDocument(editor) {
    
    if(unsavedChanges === 1 && !saving) {
        
        saving = true;
        unsavedChanges = 2;
        info.innerHTML = docName + " | " + statusText[1];
        
        // save document
        request("save/" + docName, editor.getValue(), function(err) {
            
            if (err) {
                
                unsavedChanges = 1;
                info.innerHTML = docName + " | " + statusText[3];
            }
            else if (unsavedChanges == 2) {
                
                unsavedChanges = 0;
                document.title = fileName;
                info.innerHTML = docName + " | " + statusText[2];
            }
            
            saving = false;
        });
    }
}
