const path = require('path');

const getAbsolutePath = (filename) => path.join(__dirname, 'media', filename);

function pathToNoteObject(filename, fadeOut, oneShot) {
  const obj = { type: 'file', path: getAbsolutePath(filename) };
  if (oneShot) obj.oneShot = true;
  if (typeof fadeOut === 'number') obj.fadeOutSeconds = fadeOut;
  return obj;
}

/**
 * Performance intensity layers for an acoustic kick drum.
 */
const acousticKickIntensityLayers = [
  'kick-acoustic-000.wav',
  'kick-acoustic-001.wav',
  'kick-acoustic-002.wav',
  'kick-acoustic-003.wav',
].map((path) => pathToNoteObject(path, 0.01));

const electronicKickPath = getAbsolutePath('kick-electronic-000.wav');

/**
 * Two snare drum objects. Note that these are not intensity layers; they are
 * different performances at the same intensity.
 */
const snarePaths = [
  getAbsolutePath('snare-000.wav'),
  getAbsolutePath('snare-001.wav'),
];

const tambourineIntensityLayers = [
  'tambourine-000.wav',
  'tambourine-001.wav',
  'tambourine-002.wav',
  'tambourine-003.wav',
  'tambourine-004.wav',
  'tambourine-005.wav',
  'tambourine-006.wav',
].map((path) => pathToNoteObject(path, undefined, true));

/**
 * Simple drum pattern note library
 */
const nLibrary = {
  d: { type: 'iLayers', iLayers: acousticKickIntensityLayers },
  D: { type: 'file', path: electronicKickPath, oneShot: true },
  k: { type: 'file', path: snarePaths[0] },
  c: { type: 'random', choices: tambourineIntensityLayers },
  r: {
    type: 'ripple',
    path: snarePaths[0],
  }
};

const eventMappers = [
  /**
   * @param {ClipEvent} event
   * @param {ClipEventContext} context
   */
  (event, context) => {
    if (event.type !== 'ripple') return event;
    // 1/24 and 0.020
    // 1/16 and 0.040
    // How long to wait between re-triggers measured in whole notes
    const stepSize = 1/24;
    // StartOffsetIncrement Number of seconds adjust sample start time
    const soi = 0.040;

    const numSteps = Math.floor(event.length / stepSize);
    const result =  new Array(numSteps).fill(null).map((_, i) => {
      newEvent = {
        startTime: event.startTime + i*stepSize,
        length: event.length,
        type: 'file',
        path: event.path,
        fadeOutSeconds: 0.1,
        startInSourceSeconds: (numSteps - i - 1) * soi,
      };
      if (event.d) newEvent.d = event.d;
      return newEvent;
    });
    return result;
  }
];

module.exports = {
  acousticKickIntensityLayers,
  electronicKickPath,
  snarePaths,
  tambourineIntensityLayers,
  nLibrary,
  eventMappers,
};
