# Watchdog

A simple watchdog node based on `nodered-contrib-timeout` by Peter Scargill (pete@scargill.org). My reason for forking Pete's node was bugs that remained unresolved and made his noe unusable for me.

## Functionality

After setting the topic and both safe and unsafe messages, for, for example MQTT (or simply puttting 1 and 0 into the two messages) the node is triggered by any input and will send the SAFE message out. If continually triggered nothing more will happen but if allowed to timeout, the UNSAFE message will be sent. Hence this can be used as a watchdog.
