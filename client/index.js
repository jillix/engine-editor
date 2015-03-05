// Dependencies
var Ace = require("./libs/ace-builds/src-noconflict/ace");

/**
 * set
 * Sets the new editor value.
 *
 * @name set
 * @function
 * @param {Event} ev The event object
 * @param {String} data The new value.
 * @return {undefined}
 */
exports.set = function (ev, data) {
    this.editor.setValue(data);
};

/**
 * get
 * Gets the editor value.
 *
 * @name get
 * @function
 * @param {Event} ev The event object
 * @param {An object containing the callback function.} data
 * @return {undefined}
 */
exports.get = function (ev, data) {
    var value = this.editor.getValue();
    if (typeof data === "function") {
        data = { callback: data };
    }
    typeof data.callback && data.callback.call(this, value);
    return value;
};

/**
 * init
 * The init function.
 *
 * @name init
 * @function
 * @return {undefined}
 */
exports.init = function () {
    var self = this;

    self.edEl.style.width = "100%";
    self.edEl.style.height = "100%";

    self.edEl = document.querySelector(self._config.editor);
    self.editor = Ace.edit();
    self.editor.setTheme("ace/theme/" + self._config.theme);
    self.editor.setFontSize(self._config.font_size || 13);
    self.editor.getSession().setMode("ace/mode/" + self._config.mode);

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
};
