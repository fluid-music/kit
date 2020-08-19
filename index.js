const path = require('path');
const meta = require('./metadata');

const getAbsolutePath  = (filename) => path.join(__dirname, filename);
const basenameToFileEvent = (basename, fadeOut, oneShot) => {
  if (!meta.hasOwnProperty(basename))
    throw new Error(`No metadata found for ${basename}`);

  const obj = {
    type: 'file',
    info: Object.freeze(meta[basename].info),
    path: getAbsolutePath(meta[basename].path),
  }

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
].map((path) => basenameToFileEvent(path, 0.01));

const tambourineIntensityLayers = [
  'tambourine-000.wav',
  'tambourine-001.wav',
  'tambourine-002.wav',
  'tambourine-003.wav',
  'tambourine-004.wav',
  'tambourine-005.wav',
  'tambourine-006.wav',
].map((path) => basenameToFileEvent(path, undefined, true));

/**
 * Two snare drum objects. Note that these are not intensity layers; they are
 * different performances at the same intensity.
 */
const snareEvents = [
  'snare-000.wav',
  'snare-001.wav',
].map(path => basenameToFileEvent(path, 0.1));


const rippleEvent = Object.assign({}, snareEvents[0]);
rippleEvent.type = 'ripple';

const electronicKickEvent   = meta['kick-electronic-000.wav'];
electronicKickEvent.type    = 'file';
electronicKickEvent.path    = getAbsolutePath(electronicKickEvent.path);
electronicKickEvent.info    = Object.freeze(electronicKickEvent.info);
electronicKickEvent.oneShot = true;

/**
 * Simple drum pattern note library
 */
const nLibrary = {
  d: { type: 'iLayers', iLayers: acousticKickIntensityLayers },
  D: electronicKickEvent,
  k: snareEvents[0],
  c: { type: 'random', choices: tambourineIntensityLayers },
  r: rippleEvent,
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

    const numSteps = Math.floor(event.duration / stepSize);
    const result =  new Array(numSteps).fill(null).map((_, i) => {
      newEvent = {
        startTime: event.startTime + i*stepSize,
        duration: stepSize + 1/64,
        type: 'file',
        path: event.path,
        info: event.info,
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
  tambourineIntensityLayers,
  nLibrary,
  eventMappers,
};
