# diesel
This is for the people who aren't willing to shell out 10 bucks a month for Discord Nitro. To put it simply, anyone with Diesel can send global/animated emojis to anyone else with Diesel. Non-users will see garbage text in its place.

## FAQ
> Is this hacking?

No. Diesel is simply modifying your client to render data differently, in a similar vein to [Powercord](https://powercord.dev/) or [BetterDiscord](https://betterdiscord.net/home/).

> Is this against Terms of Service?

Yes. However, Discord in practice has not banned users for using client mods. They instead seem to crack down on self-botting (e.g. automatically sending a message every second). Diesel does not fall into this category since it never sends an extra HTTP request.

> What if I already have Nitro?

Diesel won't mess with your ~bougie~ emojis at all. The only change is that you can see your friends' Diesel emojis.

## Installation
Coming soon

## Manual Installation
Maybe you don't trust me - that's okay! Take a look at the (very short) source code. If you want to manually install Diesel, download this repository as a ZIP archive, extract the folder, and name it `diesel`. Then follow the instructions below for your preferred client.

### Browser Client
This assumes that you are using Chrome. If you are using another browser which supports Chrome extensions, follow their instructions for loading an unpacked extension.

Head over to `chrome://extensions` and toggle on `Developer mode` in the top right corner. Click the `Load unpacked` option and select the `diesel` folder you downloaded.

### Desktop Client
Make sure you have [node](https://nodejs.org) and [npm](https://www.npmjs.com/). Next, install the asar package globally:
```
npm install -g asar
```

In your terminal, navigate to the directory that contains the file `app.asar`. Most likely it will be one of the following:
* macOS: `/Applications/Discord.app/Contents/Resources`
* Windows: Who uses this???
* Linux: Varies across builds, figure it out yourself

We're going to unpack `app.asar` into a directory named `asar`.
```
asar extract app.asar app
```

Make sure to delete `app.asar` or rename it as a backup. **Do not keep the file unchanged.**

Finally, we're going to slightly modify the source code. There should be a directory in `app` named `app_bootstrap`. Drop the `diesel` folder you downloaded into here. There should also be a file named `index.js`. Open it in a text editor, and prepend the following lines of code:

```javascript
require('electron').app.on('ready', () => {
  const path = require('path').join(__dirname, 'diesel');
  require('electron').BrowserWindow.addExtension(path);
});
```
