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

    self.session.setTabSize(
        self._config.tab_size = self._config.tab_size === undefined ? 2 : self._config.tab_size
    );

    self.editor.setOptions({
        enableBasicAutocompletion: true,
        enableSnippets: true,
        enableLiveAutocompletion: true
    });

    // Track the saved value
    self._isSaved = true;
    self.editor.on("input", function() {
        self._isSaved = false;
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
            self._isSaved = true;
            self.emit("save", e, { data: self.get(null, {}) });
        }
    });
};

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
 *
 * @return {undefined}
 */
exports.set = function (ev, data) {
    var value = data.content;
    if (typeof value === "object") {
        value = JSON.stringify(value, null, this._config.tab_size);
    }
    this.editor.setValue(value, -1);
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
 * @return {undefined}
 */
exports.isSaved = function (ev, data) {
    this.emit("is_saved", null, { saved: this._isSaved });
};
