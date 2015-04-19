Engine Editor
=============
ACE editor module for Engine.

## Configuration

 - `editor` (String): The query selector of the editor element.
 - `theme` (String): The editor theme.
 - `mode` (String): The editor mode.
 - `font_size` (Number): The font size.
 - `tab_size` (Number): The tab size (how many spaces).
 - `preventTabClose` (String): The message to display on page leave warning. To disable, just use an empty string.

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
### `set(ev, data)`
Sets the new editor value.

#### Params
- **Event** `ev`: The event object
- **Object** `data`: The data object:
 - `content` (Object|String): The new value (as string) or a JSON object which will be stringified.
 - `save` (Boolean): A flag to or not to consider the content saved (default: `true`).

### `focus()`
Focus the editor element.

### `get(ev, data)`
Gets the editor value.

#### Params
- **Event** `ev`: The event object
- **Function** `data`: An object containing the callback function.

### `setMode(ev, data)`
Sets the editor mode.

#### Params
- **Event** `ev`: The event object.
- **Object** `data`: The data object containing:
 - `mode` (String): The mode to set (if not provided, the `path` value will be used).
 - `path` (String): The path of the file (used to get the extension)

### `isSaved(ev, data)`
Emits the `is_saved` event containing the `saved` value.

#### Params
- **Event** `ev`: The event object.
- **Object** `data`: The data object containing:

#### Return
- **Boolean** The isSaved value.

## License
See the [LICENSE](./LICENSE) file.
