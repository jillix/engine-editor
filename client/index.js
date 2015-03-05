exports.set = function () {

};

exports.get = function () {

};

exports.init = function () {
    var self = this;
    //setup editor
    self.editor.setTheme("ace/theme/textmate");

    // set font size
    self.editor.setFontSize(13);

    // add ctrl-s command
    // self.editor.commands.addCommand({
    //     name: "save",
    //     bindKey: {
    //         win: "Ctrl-S",
    //         mac: "Command-S",
    //         sender: "editor"
    //     },
    //     exec: function () {
    //         saveDocument.call(self);
    //     }
    // });

    // save automatically after 1s, if doc has changed
    self.editor.getSession().on("change", function() {
        self.changed = 1;
        self.border.css('border-color', colors.change);
    });
};
