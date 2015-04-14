Engine Editor
=============
ACE editor module for Engine.

## Configuration

 - `editor` (String): The query selector of the editor element.
 - `theme` (String): The editor theme.
 - `mode` (String): The editor mode.
 - `font_size` (Number): The font size.

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

### `get(ev, data)`
Gets the editor value.

#### Params
- **Event** `ev`: The event object
- **Function** `data`: An object containing the callback function.

### `init()`
The init function.

## License
See the [LICENSE](./LICENSE) file.
