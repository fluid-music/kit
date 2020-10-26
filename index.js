const fluid = require('fluid-music');
const path = require('path');
const meta = require('./metadata');

const getAbsolutePath  = (filename) => path.join(__dirname, filename);
const basenameToFileTechnique = (basename, fadeOut, oneShot) => {
  if (!meta.hasOwnProperty(basename))
    throw new Error(`No metadata found for ${basename}`);

  return new fluid.techniques.AudioFile({
    info: Object.freeze(meta[basename].info),
    path: getAbsolutePath(meta[basename].path),
    oneShot: !!oneShot,
    fadeOutSeconds: typeof fadeOut === 'number' ? fadeOut : 0
  })
}

/**
 * Performance intensity layers for an acoustic kick drum.
 */
const acousticKickIntensityLayers = new fluid.techniques.ILayers({
  layers: [
    'kick-acoustic-000.wav',
    'kick-acoustic-001.wav',
    'kick-acoustic-002.wav',
    'kick-acoustic-003.wav',
  ].map((path) => {
    const audioFile = basenameToFileTechnique(path, 0.01)
    audioFile.trimDb = -8.5
    return audioFile
  })
});

const tambourineIntensityLayers = new fluid.techniques.ILayers({
  layers: [
    'tambourine-000.wav',
    'tambourine-001.wav',
    'tambourine-002.wav',
    'tambourine-003.wav',
    'tambourine-004.wav',
    'tambourine-005.wav',
    'tambourine-006.wav',
  ].map((path) => basenameToFileTechnique(path, undefined, true))
});

const tambourineRandomSoft = new fluid.techniques.Random({
  choices: [
    'tambourine-000.wav',
    'tambourine-001.wav',
    'tambourine-002.wav',
    'tambourine-003.wav',
    'tambourine-004.wav',
    'tambourine-005.wav',
  ].map((path, i) => {
    const fileTechnique = basenameToFileTechnique(path, undefined, true)
    // The original audio samples are intensity layers. Artificially soften the
    // high intensity samples by trimming the attack and adding a fade in.
    fileTechnique.startInSourceSeconds = 0.005 * i
    fileTechnique.fadeInSeconds = 0.005 * i
    return fileTechnique
  })
});

/**
 * A simple, clean acoustic snare sound
 */
const snare = basenameToFileTechnique('snare-000.wav', 0.1);

/**
 * A snare with a little bit of "ring"
 */
const snareRing = basenameToFileTechnique('snare-001.wav', 0.1);

const electronicKick = basenameToFileTechnique('kick-electronic-000.wav', 0, true)
electronicKick.trimDb = -8.5

class RippleTechnique extends fluid.techniques.AudioFile {
  /**
   * @param {number} startTime in whole note relative to the clip
   * @param {number} duration in whole notes
   * @param {import('fluid-music/built/fluid-interfaces').ClipEventContext} context
   */
  use (startTime, duration, context) {
    // 1/24 and 0.020
    // 1/16 and 0.040
    // How long to wait between re-triggers measured in whole notes
    const stepSize = 1/24;

    // StartOffsetIncrement Number of seconds adjust sample start time
    const soi = 0.040;
    const numSteps = Math.floor(duration / stepSize);

    for (let i = 0; i < numSteps; i++) {
      let newStartTime = startTime + i*stepSize
      let newDuration = stepSize + 1/128

      const audioFileTechnique =  new fluid.techniques.AudioFile({
        path: this.path,
        info: this.info,
        fadeOutSeconds: 0.1,
        startInSourceSeconds: (numSteps - i - 1) * soi,
      });

      audioFileTechnique.use(newStartTime, newDuration, context)
    }
  }
};

/**
 * Simple drum pattern note library
 */
const tLibrary = {
  d: acousticKickIntensityLayers,
  D: electronicKick,
  k: snare,
  s: snare,
  S: snareRing,
  t: tambourineRandomSoft,
  T: tambourineIntensityLayers,
  r: new RippleTechnique(snare),
};

module.exports = {
  acousticKickIntensityLayers,
  tambourineIntensityLayers,
  RippleTechnique,
  tLibrary,
};
