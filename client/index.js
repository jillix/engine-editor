// Dependencies
var blm = require("./libs/blm");

function checkSaved() {
    return this._config.preventTabClose && !this.isSaved() && !confirm(this._config.preventTabClose);
}

exports.load = function (data) {
    var self = this;

    self.edEl = document.querySelector(self._config.editor);
    self.edEl.style.width = "100%";
    self.edEl.style.height = "100%";

    // TODO this solves the path problem in ace, maybe there are better solutions.
    ace.config.set('basePath', 'https://cdnjs.cloudflare.com/ajax/libs/ace/1.2.0');

    ace.require("ace/ext/language_tools");

    self.editor = ace.edit(self.edEl);
    self.editor.setTheme("ace/theme/" + self._config.theme);
    self.editor.$blockScrolling = Infinity;
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
    self.isSaved({ saved: true });
    self.editor.on("input", function() {
        self.isSaved({ saved: false });
        self.flow("change").write(null);
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
            self.isSaved({ saved: true });

            // remove trailing spaces
            var content = self.get().split("\n");
            for (var i = 0; i < content.length; ++i) {
                content[i] = content[i].trimRight();
            };
            content = content.join("\n");

            // save content to file
            self.flow("save").write(null, {
                data: content,
                path: self.filePath
            });
        }
    });
    self.flow("renderedEditor").write(null, data);
};

/**
 * set
 * Sets the new editor value.
 *
 * @name set
 * @function
 * @param {Stream} stream The stream object
 *
 *  - `content` (Object|String): The new value (as string) or a JSON object which will be stringified.
 *  - `save` (Boolean): A flag to or not to consider the content saved (default: `true`).
 *  - `force` (Boolean): If `true`, the save state will *not* be checked.
 *
 */
exports.set = function (data) {
    var self = this;
    var value = data.content;

    if (!data.force) {
        if (checkSaved.call(self)) {
            return self.flow("setAborted").write(null, data);
        }
    }

    if (typeof value === "object") {
        value = JSON.stringify(value, null, this._config.tab_size);
    }

    self.filePath = data.path || self.filePath;
    self.editor.setValue(value, -1);
    if (data.save !== false) {
        setTimeout(function() {
            self.isSaved({ saved: true });
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
 */
exports.close = function (data, stream) {
    var self = this;

    // check if there are any unsaved changes
    if (checkSaved.call(self)) {
        self.flow("unsavedChanges").write(null);
        return;
    }
    self.isSaved({ saved: true });
    self.flow("readyToClose").write(null);

    // call callback if provided
    if (data.callback && typeof data.callback === "function") {
        data.callback(null, {
            select: true
        });
    }
};

exports.undoManager = {
    /**
     * undoManager.reset
     * Resets the undo stack.
     *
     * @name undoManager.reset
     * @function
     */
    reset: function (data) {
        var self = this;
        self.session.setUndoManager(new ace.UndoManager());
    }
};

/**
 * focus
 * Focus the editor element.
 *
 * @name focus
 * @function
 */
exports.focus = function (data) {
    var self = this;
    self.editor.focus();
};

/**
 * get
 * Gets the editor value.
 *
 * @name get
 * @function
 * @param {Object} data The data object containing:
 *
 *  - `callback` (Function): An optional callback function.
 */
exports.get = function (data, stream) {
    var self = this;
    var value = this.editor.getValue();

    // fire callback (if exists)
    if (data && typeof data.callback === "function") {
        data.callback(value);
    }

    return value;
};

/**
 * setMode
 * Sets the editor mode.
 *
 * @name setMode
 * @function
 * @param {Object} data The data object containing:
 *
 *  - `mode` (String): The mode to set (if not provided, the `path` value will be used).
 *  - `path` (String): The path of the file (used to get the extension)
 *
 */
exports.setMode = function (data) {
    var self = this

    if (data.mode) {
        self.session.setMode("ace/mode/" + data.mode);
    } else if (data.path) {
        var modelist = ace.require("ace/ext/modelist");
        var mode = modelist.getModeForPath(data.path).mode;
        self.session.setMode(mode);
    }
};

/**
 * isSaved
 * Emits the `is_saved` event containing the `saved` value.
 *
 * @name isSaved
 * @function
 * @param {Object} data The data object containing:
 * @return {Boolean} The isSaved value.
 */
exports.isSaved = function (data) {
    var self = this
    data = data || {};
    if (typeof data.saved === "boolean") {
        self._isSaved = data.saved;;
    } else {
        self.flow("is_saved").write(null, { saved: self._isSaved });
    }
    return self._isSaved;
};
