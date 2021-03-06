<!---------------------------------------------------------------------------->
<!-- STOP, LOOK & LISTEN!                                                   -->
<!-- ====================                                                   -->
<!-- Do NOT edit this file directly since it's generated from a template    -->
<!-- file, using https://github.com/IonicaBizau/node-blah                   -->
<!--                                                                        -->
<!-- If you found a typo in documentation, fix it in the source files       -->
<!-- (`lib/*.js`) and make a pull request.                                  -->
<!--                                                                        -->
<!-- If you have any other ideas, open an issue.                            -->
<!--                                                                        -->
<!-- Please consider reading the contribution steps (CONTRIBUTING.md).      -->
<!-- * * * Thanks! * * *                                                    -->
<!---------------------------------------------------------------------------->

# engine-editor

ACE editor module for Engine.

## Configuration

 - `editor` (String): The query selector of the editor element.
 - `theme` (String): The editor theme.
 - `mode` (String): The editor mode.
 - `font_size` (Number): The font size.
 - `tab_size` (Number): The tab size (how many spaces).
 - `preventTabClose` (String): The message to display on page leave warning. To disable, just use an empty string.

## Events

 - :arrow_up: `setAborted` The value setting is aborted by the user.
 - :arrow_up: `change` The editor value was changed.
 - :arrow_up: `save` The user saves the editor content.
 - :arrow_up: `unsavedChanges` The editor has unsaved changes (when calling `close`).
 - :arrow_up: `readyToClose` The editor is ready to be closed (when calling `close`).
 - :arrow_up: `isSaved` Tells the other modules if the editor content is saved or not.

### Example
```js
{
    "name": "sidebar_editor",
    "module": "engine-editor",
    "roles": {
        "*": true
    },
    "client": {
        "config": {
            "mode": "json",
            "theme": "textmate",
            "editor": ".sidebar .editor",
            "font_size": 13,
            "tab_size": 2
        }
    }
}
```

## Documentation
See the [DOCUMENTATION.md][docs] file.

## How to contribute
Have an idea? Found a bug? See [how to contribute][contributing].

## License
See the [LICENSE][license] file.

[license]: /LICENSE
[contributing]: /CONTRIBUTING.md
[docs]: /DOCUMENTATION.md