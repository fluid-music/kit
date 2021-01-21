# @fluid-music/kit

A collection of drum samples packaged for the [`fluid-music`](https://www.npmjs.com/package/fluid-music) Node framework. 

```bash
npm i @fluid-music/kit
```

It exports a single `tLibrary` object, which looks roughly like this:

hint:
```javascript
const tLibrary = {
  d: acousticKickIntensityLayers,
  D: electronicKick,
  k: snare,
  s: snare,
  S: snareRing,
  t: tambourineRandomSoft,
  T: tambourineIntensityLayers,
  r: new RippleTechnique(snare),
}

module.exports.tLibrary = tLibrary
```

Read [`index.js`](https://github.com/CharlesHolbrow/fluid-music-kit/blob/main/index.js) for more details. 

[fluid-music/example](https://github.com/fluid-music/example) uses this package.
