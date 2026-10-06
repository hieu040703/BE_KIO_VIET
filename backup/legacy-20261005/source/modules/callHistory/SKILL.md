# CallHistory module notes

- `GET /v1/call-histories` accepts an optional `orderId` UUID query parameter and applies it in both admin and client repositories.
- The order detail page uses this filter so it does not load or filter all call histories in the browser.
- `recordingUrl` is only used as an availability marker by the FE; playback goes through the authenticated Stringee recording proxy with the call history ID.
