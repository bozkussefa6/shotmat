import { Audio } from 'expo-av';
import StorageService from './StorageService';

const SOUNDS = {
  spin: require('../../assets/sounds/spin.wav'),
  reveal: require('../../assets/sounds/reveal.wav'),
  shot: require('../../assets/sounds/shot.wav'),
};

const soundObjects = {};
let initialized = false;

const isSoundEnabled = async () => {
  const settings = await StorageService.getSettings();
  return settings.soundEnabled !== false;
};

const preload = async () => {
  if (initialized) return;
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: false,
      staysActiveInBackground: false,
    });
    for (const [key, source] of Object.entries(SOUNDS)) {
      const { sound } = await Audio.Sound.createAsync(source, { shouldPlay: false });
      soundObjects[key] = sound;
    }
    initialized = true;
  } catch {
    // Audio not critical — fail silently
  }
};

const play = async (key) => {
  try {
    if (!(await isSoundEnabled())) return;
    const sound = soundObjects[key];
    if (!sound) return;
    await sound.setPositionAsync(0);
    await sound.playAsync();
  } catch {
    // Fail silently
  }
};

const stop = async (key) => {
  try {
    const sound = soundObjects[key];
    if (!sound) return;
    await sound.stopAsync();
  } catch {
    // Fail silently
  }
};

const unload = async () => {
  for (const sound of Object.values(soundObjects)) {
    try { await sound.unloadAsync(); } catch {}
  }
  initialized = false;
};

const SoundService = { preload, play, stop, unload, isSoundEnabled };
export default SoundService;
