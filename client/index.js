// Dependencies
var blm = require("./libs/blm");

function emit(eventName, data) {
    var self = this;

    var args = Array.prototype.slice.call(arguments).slice(1);

    // create stream
    var str = self._streams[eventName] || (self._streams[eventName] = self.flow(eventName));
    str.write(null, data);
}

/**
 * init
 * The init function.
 *
 * @name init
 * @function
 */
exports.init = function () {
    var self = this;

    // init streams
    self._streams = {};
    self.emit = emit;

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
    self.isSaved({ saved: true });
    self.editor.on("input", function() {
        self.isSaved({ saved: false });
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
            console.log(self);
            self.isSaved({ saved: true });
            self.emit("save", {
                data: self.get(),
                path: self.filePath
            });
        }
    });

    self.emit("ready");
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
 * @param {Stream} stream The stream object
 *
 *  - `content` (Object|String): The new value (as string) or a JSON object which will be stringified.
 *  - `save` (Boolean): A flag to or not to consider the content saved (default: `true`).
 *
 */
exports.set = function (stream) {
    var self = this;

    stream.data(function (err, data) {
        var value = data.content

        if (err) {
            return console.error(new Error(err));
        }

        if (checkSaved.call(self)) {
            return self.emit("setAborted", data);
        }

        if (typeof value === "object") {
            value = JSON.stringify(value, null, this._config.tab_size);
        }

        self.filePath = data.path;
        self.editor.setValue(value, -1);
        if (data.save !== false) {
            setTimeout(function() {
                self.isSaved({ saved: true });
            }, 100);
        }
    });
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
exports.close = function (stream) {
    var self = this

    stream.data(function (err, data) {

        if (err) {
            return console.error(new Error(err));
        }

        if (checkSaved.call(self)) {
            self.emit("unsavedChanges");
            return;
        }
        self.isSaved({ saved: true });
        self.emit("readyToClose");

        // call callback if provided
        var callback = data.callback || function (err) {
            if (err) { return alert(err); }
        };
        callback(null, {
            select: true
        });
    });
};

exports.undoManager = {
    /**
     * undoManager.reset
     * Resets the undo stack.
     *
     * @name undoManager.reset
     * @function
     */
    reset: function (stream) {
        var self = this;
        stream.data(function (err, data) {
            if (err) {
                return console.error(new Error(err));
            }
            self.session.setUndoManager(new ace.UndoManager());
        });
    }
};

/**
 * focus
 * Focus the editor element.
 *
 * @name focus
 * @function
 */
exports.focus = function (stream) {
    var self = this

    stream.data(function (err, data) {

        if (err) {
            return console.error(new Error(err));
        }

        self.editor.focus();
    });
};

/**
 * get
 * Gets the editor value.
 *
 * @name get
 * @function
 * @param {Stream} stream The stream object
 */
exports.get = function (stream) {
    var self = this

    if (!stream) {
        var value = this.editor.getValue();
        return value;
    }

    stream.data(function (err, data) {

        if (err) {
            return console.error(new Error(err));
        }

        var value = this.editor.getValue();
        var callback = data.callback || function () {};

        callback(value);
    });
};

/**
 * setMode
 * Sets the editor mode.
 *
 * @name setMode
 * @function
 * @param {Stream} stream The stream object
 *
 *  - `mode` (String): The mode to set (if not provided, the `path` value will be used).
 *  - `path` (String): The path of the file (used to get the extension)
 *
 */
exports.setMode = function (stream) {
    var self = this

    stream.data(function (err, data) {

        if (err) {
            return console.error(new Error(err));
        }

        if (data.mode) {
            self.session.setMode("ace/mode/" + data.mode);
        } else if (data.path) {
            var modelist = ace.require("ace/ext/modelist");
            var mode = modelist.getModeForPath(data.path).mode;
            self.session.setMode(mode);
        }
    });
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
        this._isSaved = data.saved;;
    } else {
        this.emit("is_saved", { saved: self._isSaved });
    }
    return this._isSaved;
};
