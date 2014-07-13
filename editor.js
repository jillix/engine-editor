Z.wrap('github/jillix/editor/v0.0.1/editor.js', function (require, module, exports) {

// TODO warn when window closes and unsaved changes exists

var colors = {
    saved: 'rgba(24,160,24,.3)',
    change: 'rgba(24,160,224,.5)',
    error: 'rgba(160,24,24,.5)'
};

function setupAce (selector) {
    var self = this;

    if (!self.view || !self.view.layout.dom) {
        return '[editor: View has no dom]';
    }

    self.editor = ace.edit(self.view.layout.dom.querySelector(selector));
    self.border = $(self.editor.container.parentNode);
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

    //add ctrl-d command
    self.editor.commands.addCommand({

        name: "delete",
        bindKey: {

            win: "Ctrl-D",
            mac: "Command-D",
            sender: "editor"
        },
        exec: function () {
            deleteDocument.call(self);
        }
    });

    // save automatically after 1s, if doc has changed
    self.editor.getSession().on("change", function() {
        self.changed = 1;
        self.border.css('border-color', colors.change);
    });
}

function saveDocument() {
    var self = this;

    if(self.view && self.changed === 1 && !self.saving && !self.loading) {

        self.saving = true;
        self.changed = 2;
        self.border.css('border-color', colors.change);

        var query = {};

        // update an existing document
        if (self.data._id) {

            // save data to db
            query.m = 'update';
            query.q = {_id: self.data._id};
            query.d = JSON.parse(self.editor.getValue());

            self.currentView.req(query, function (err) {

                if (err) {
                    self.changed = 1;
                    self.border.css('border-color', colors.error);
                    alert(err);
                }
                else if (self.changed == 2) {

                    self.changed = 0;
                    self.border.css('border-color', colors.saved);
                }

                self.saving = false;
            });

        // if new document then create
        } else {
            // save data to db
            query.m = 'insert';
            query.d = JSON.parse(self.editor.getValue());

            self.currentView.req(query, function (err, data) {

                if (err) {
                    self.changed = 1;
                    self.border.css('border-color', colors.error);
                    alert(err);
                }
                else if (self.changed == 2) {

                    self.changed = 0;
                    self.border.css('border-color', colors.saved);
                }

                self.saving = false;

                // emit state to reload data
                var state = getDataFromUrl(self.pattern, self.map);
                state = location.pathname.replace('/' + state.id + '/', '/' + data._id + '/');
                self.route(state);
            });
        }
    }
}

function deleteDocument () {
    var self = this;

    if (self.data._id) {
        if (confirm('Do you really want to delete this document ?')) {

            // remove document
            var query = {
                m: 'remove',
                q: {_id: self.data._id}
            };
            self.currentView.req(query, function (err, data) {

                if (err) {
                    self.changed = 1;
                    self.border.css('border-color', colors.error);
                    return alert(err);
                }

                // got to previous state
                history.back();
            });
        }
    }
}

function load (state, regexp, title, query, view) {

    var self = this;
    self.loading = 1;

    // set mode
    self.editor.getSession().setMode("ace/mode/json");

    // set status text
    self.border.css('border-color', colors.change);

    if (regexp) {
        var match = state.url.match(new RegExp(regexp));

        if (!match) {
            // create a new item
            self.editor.setValue('{}');
            self.loading = 0;
            return;
        }

        if (title) {
            title = match[title];
        }

        if (query) {
            for (var field in query) {
                query[field] = match[query[field]];
            }
        }

        if (view) {
            view = match[view];
        }
    }

    // TODO set title

    if (view) {
        // TODO fetch view from server
    } else {

        // mongodb model request
        self.model.req({m: 'findOne', q: query}, function (err, data) {

            if (err || !data) {
                data = err = err ? [err.toString()] : ["Empty response"];
            }

            self.data = data;
            self.editor.setValue(JSON.stringify(data, null, 4) + '\n');

            // set status color
            self.border.css('border-color', err ? colors.error : colors.saved);
            self.loading = 0;
            self.changed = 0;
        });
    }
}

function init (config, ready) {

    var self = this;

    self.loading = 0;
    self.load = load;

    // render layout
    if (self.view && self.view.layout) {
        self.view.layout.render();
    }

    // a table can have only one model
    if (self.model) {
        for (var model in self.model) {
            self.model = self.model[model];
            break;
        }
    }

    // setup the ace editor
    var error = setupAce.call(self, config.editor);

    if (error) {
        console.error(error);
    }

    console.log('editor:', self._name);
    ready();
}

module.exports = init;

return module;

});
