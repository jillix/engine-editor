// Dependencies
var blm = require("./libs/blm");

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

    self.edEl = document.querySelector(self._config.editor);
    self.edEl.style.width = "100%";
    self.edEl.style.height = "100%";

    ace.require("ace/ext/language_tools");

    self.editor = ace.edit(self.edEl);
    self.editor.setTheme("ace/theme/" + self._config.theme);
    self.editor.setFontSize(self._config.font_size || 13);
    self.session = self.editor.getSession();

    if (self._config.mode) {
        self.setMode(null, { mode: self._config.mode });
    }

    self._config.preventTabClose = typeof self._config.preventTabClose === "string"
                                 ? self._config.preventTabClose
                                 : "You have unsaved changes in the editor! Do you really want to continue?"
                                 ;

    if (self._config.preventTabClose) {
        blm(function () {
            if (!self.isSaved()) {
                return self._config.preventTabClose;
            }
        });
    }

    self.session.setTabSize(
        self._config.tab_size = self._config.tab_size === undefined ? 2 : self._config.tab_size
    );

    self.editor.setOptions({
        enableBasicAutocompletion: true,
        enableSnippets: true,
        enableLiveAutocompletion: true
    });

    // Track the saved value
    self.isSaved(null, { saved: true });
    self.editor.on("input", function() {
        self.isSaved(null, { saved: false });
        self.emit("change");
    });

    // Listen for save event
    self.editor.commands.addCommand({
        name: "save",
        bindKey: {
            win: "Ctrl-S",
            mac: "Command-S",
            sender: "editor"
        },
        exec: function (e, data) {
            self.isSaved(null, { saved: true });
            self.emit("save", e, { data: self.get(null, {}) });
        }
    });
};

function checkSaved() {
    return this._config.preventTabClose && !this.isSaved() && !confirm(this._config.preventTabClose);
}

/**
 * set
 * Sets the new editor value.
 *
 * @name set
 * @function
 * @param {Event} ev The event object
 * @param {Object} data The data object:
 *
 *  - `content` (Object|String): The new value (as string) or a JSON object which will be stringified.
 *  - `save` (Boolean): A flag to or not to consider the content saved (default: `true`).
 *
 * @return {undefined}
 */
exports.set = function (ev, data) {
    var value = data.content;
    var self = this;

    if (checkSaved.call(self)) {
        return self.emit("setAborted", ev, data);
    }

    if (typeof value === "object") {
        value = JSON.stringify(value, null, this._config.tab_size);
    }

    this.editor.setValue(value, -1);
    if (data.save !== false) {
        setTimeout(function() {
            self.isSaved(null, { saved: true });
        }, 100);
    }
};

/**
 * close
 * Checks if the editor can be closed and emits an event related to that:
 *
 *  - `unsavedChanges`, if there are unsaved changes
 *  - `readyToClose`, if the editor is ready to be closed
 *
 * @name close
 * @function
 * @return {undefined}
 */
exports.close = function () {
    if (checkSaved.call(this)) {
        this.emit("unsavedChanges");
        return;
    }
    this.isSaved(null, { saved: true });
    this.emit("readyToClose");
};

/**
 * focus
 * Focus the editor element.
 *
 * @name focus
 * @function
 * @return {undefined}
 */
exports.focus = function () {
    this.editor.focus();
};

/**
 * get
 * Gets the editor value.
 *
 * @name get
 * @function
 * @param {Event} ev The event object
 * @param {Function} data An object containing the callback function.
 * @return {undefined}
 */
exports.get = function (ev, data) {
    var value = this.editor.getValue();
    typeof data.callback === "function" && data.callback.call(this, value);
    return value;
};

/**
 * setMode
 * Sets the editor mode.
 *
 * @name setMode
 * @function
 * @param {Event} ev The event object.
 * @param {Object} data The data object containing:
 *
 *  - `mode` (String): The mode to set (if not provided, the `path` value will be used).
 *  - `path` (String): The path of the file (used to get the extension)
 *
 * @return {undefined}
 */
exports.setMode = function (ev, data) {
    if (data.mode) {
        this.session.setMode("ace/mode/" + data.mode);
    } else if (data.path) {
        var modelist = ace.require("ace/ext/modelist");
        var mode = modelist.getModeForPath(data.path).mode;
        this.session.setMode(mode);
    }
};

/**
 * isSaved
 * Emits the `is_saved` event containing the `saved` value.
 *
 * @name isSaved
 * @function
 * @param {Event} ev The event object.
 * @param {Object} data The data object containing:
 * @return {Boolean} The isSaved value.
 */
exports.isSaved = function (ev, data) {
    data = data || {};
    if (typeof data.saved === "boolean") {
        this._isSaved = data.saved;;
    } else {
        this.emit("is_saved", null, { saved: this._isSaved });
    }
    return this._isSaved;
};
