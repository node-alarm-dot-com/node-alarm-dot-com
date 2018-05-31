# homebridge-frontpoint
Homebridge plugin for FrontPoint alarm systems.

## Example config.json

```json
{
    "platform": "FrontPoint",
    "name": "Security System",
    "username": "ENTER YOUR_USERNAME",
    "password": "ENTER YOUR PASSWORD",
    "armingModes": {
        "away": {
            "noEntryDelay": false,
            "silentArming": false
        },
        "night": {
            "noEntryDelay": false,
            "silentArming": true
        },
        "stay": {
            "noEntryDelay": false,
            "silentArming": true
        }
    }
}
```
