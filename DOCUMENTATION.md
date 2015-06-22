## Documentation
You can see below the API reference of this module.

### `init()`
The init function.

### `set(ev, data)`
Sets the new editor value.

#### Params
- **Event** `ev`: The event object
- **Object** `data`: The data object:
 - `content` (Object|String): The new value (as string) or a JSON object which will be stringified.
 - `save` (Boolean): A flag to or not to consider the content saved (default: `true`).

### `close()`
Checks if the editor can be closed and emits an event related to that:

 - `unsavedChanges`, if there are unsaved changes
 - `readyToClose`, if the editor is ready to be closed

### `undoManager.reset()`
Resets the undo stack.

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

