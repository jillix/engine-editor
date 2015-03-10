/**
 * set
 * Sets the new editor value.
 *
 * @name set
 * @function
 * @param {Event} ev The event object
 * @param {Object} data The new value that will be stringified.
 * @return {undefined}
 */
exports.set = function (ev, data) {
    if (typeof data === "object") {
        data = JSON.stringify(data, null, 2);
    }
    this.editor.setValue(data, -1);
};

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

    self.editor = ace.edit(self.edEl);
    self.editor.setTheme("ace/theme/" + self._config.theme);
    self.editor.setFontSize(self._config.font_size || 13);
    self.editor.getSession().setMode("ace/mode/" + self._config.mode);

    self.editor.setOptions({
        enableBasicAutocompletion: true
    });
};
