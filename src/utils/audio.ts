// Synthesized Ambient Soundscape Engine using browser native Web Audio API
// This allows continuous local play of White Noise, Pink Noise, Brown Noise, Rain, and Cafe/Bar chatter fallbacks.
 
let audioCtx: AudioContext | null = null;
let ambientSource: AudioNode | null = null;
let gainNode: GainNode | null = null;
let secondarySource: AudioNode | null = null;
 
// Each startAmbientSound call gets a unique token; if it changes mid-fetch, the result is discarded
let currentPlayToken = 0;
 
function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
}
 
function createWhiteNoiseBuffer(ctx: AudioContext, duration = 2.0) {
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}
 
function createPinkNoiseBuffer(ctx: AudioContext, duration = 2.0) {
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.96900 * b2 + white * 0.1538520;
    b3 = 0.86650 * b3 + white * 0.3104856;
    b4 = 0.55000 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.0168980;
    data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
    data[i] *= 0.11;
    b6 = white * 0.115926;
  }
  return buffer;
}
 
function createBrownNoiseBuffer(ctx: AudioContext, duration = 2.0) {
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let lastOut = 0.0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    data[i] = (lastOut + (0.02 * white)) / 1.02;
    lastOut = data[i];
    data[i] *= 3.5;
  }
  return buffer;
}
 
let activeAudioElement: HTMLAudioElement | null = null;
let activeBlobUrl: string | null = null;
 
const AUDIO_FILES: Record<string, string> = {
  "white-noise": "https://res.cloudinary.com/dfav1chh8/video/upload/v1779539115/dragon-studio-whitenoise-372485_otwwid.mp3",
  "pink-noise": "https://res.cloudinary.com/dfav1chh8/video/upload/v1779539132/Pink_Noise_Black_Screen_20_Minutes_Focus_Study_Concentrate-256x144-mp4a_rftyqz.mp3",
  "brown-noise": "https://res.cloudinary.com/dfav1chh8/video/upload/v1779539106/cosmic-scapes-relaxing-smoothed-brown-noise-294838_axihjn.mp3",
  "rain": "https://res.cloudinary.com/dfav1chh8/video/upload/v1779539112/dragon-studio-relaxing-rain-444802_zojcee.mp3",
  "heavy-rain": "https://res.cloudinary.com/dfav1chh8/video/upload/v1779539124/freesound_community-rain-and-distant-thunder-60230_quqvfo.mp3",
  "cafe": "https://res.cloudinary.com/dfav1chh8/video/upload/v1779539123/freesound_community-restaurant-sounds-sunny-point-cafe-25092_oyfznu.mp3"
};
 
export function getAudioUrl(type: string): string {
  try {
    const overridesStr = localStorage.getItem("academic_suite_audio_overrides");
    if (overridesStr) {
      const overrides = JSON.parse(overridesStr);
      if (overrides[type]) return overrides[type];
    }
  } catch (_) {}
  return AUDIO_FILES[type] || "";
}
 
export function stopAmbientSound() {
  // Invalidate any in-flight blob fetch so it won't play when it resolves
  currentPlayToken++;
 
  if (activeAudioElement) {
    try {
      activeAudioElement.pause();
      activeAudioElement.currentTime = 0;
      activeAudioElement.src = "";
      activeAudioElement.load();
    } catch (_) {}
    activeAudioElement = null;
  }
 
  if (activeBlobUrl) {
    try { URL.revokeObjectURL(activeBlobUrl); } catch (_) {}
    activeBlobUrl = null;
  }
 
  if (ambientSource) {
    try {
      (ambientSource as AudioBufferSourceNode).stop();
      ambientSource.disconnect();
    } catch (_) {}
    ambientSource = null;
  }
 
  if (secondarySource) {
    try {
      (secondarySource as AudioBufferSourceNode).stop();
      secondarySource.disconnect();
    } catch (_) {}
    secondarySource = null;
  }
 
  if (gainNode) {
    try { gainNode.disconnect(); } catch (_) {}
    gainNode = null;
  }
}
 
function playSynthesizedAmbient(
  type: 'none' | 'cafe' | 'white-noise' | 'pink-noise' | 'brown-noise' | 'rain' | 'heavy-rain',
  volumePercent: number
) {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();
 
    gainNode = ctx.createGain();
    gainNode.connect(ctx.destination);
    gainNode.gain.setValueAtTime(volumePercent / 100 * 0.3, ctx.currentTime);
 
    let buffer: AudioBuffer;
    if (type === 'white-noise') buffer = createWhiteNoiseBuffer(ctx);
    else if (type === 'pink-noise') buffer = createPinkNoiseBuffer(ctx);
    else if (type === 'brown-noise') buffer = createBrownNoiseBuffer(ctx);
    else if (type === 'rain' || type === 'heavy-rain') buffer = createBrownNoiseBuffer(ctx);
    else buffer = createPinkNoiseBuffer(ctx);
 
    const sourceNode = ctx.createBufferSource();
    sourceNode.buffer = buffer;
    sourceNode.loop = true;
 
    let finalNode: AudioNode = sourceNode;
 
    if (type === 'rain') {
      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(1000, ctx.currentTime);
      bandpass.Q.setValueAtTime(0.8, ctx.currentTime);
      sourceNode.connect(bandpass);
      finalNode = bandpass;
    } else if (type === 'heavy-rain') {
      const lowpass = ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.setValueAtTime(300, ctx.currentTime);
      sourceNode.connect(lowpass);
      finalNode = lowpass;
 
      const rumbleSrc = ctx.createBufferSource();
      rumbleSrc.buffer = createBrownNoiseBuffer(ctx, 4.0);
      rumbleSrc.loop = true;
      const biquad = ctx.createBiquadFilter();
      biquad.type = 'lowpass';
      biquad.frequency.setValueAtTime(80, ctx.currentTime);
      rumbleSrc.connect(biquad);
      const rumbleGain = ctx.createGain();
      rumbleGain.gain.setValueAtTime(0.5, ctx.currentTime);
      biquad.connect(rumbleGain);
      rumbleGain.connect(gainNode!);
      try { rumbleSrc.start(0); secondarySource = rumbleSrc; } catch (_) {}
    } else if (type === 'cafe') {
      const lowpass = ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.setValueAtTime(450, ctx.currentTime);
      sourceNode.connect(lowpass);
      finalNode = lowpass;
    }
 
    finalNode.connect(gainNode);
    sourceNode.start(0);
    ambientSource = sourceNode;
  } catch (err) {
    console.error("Synthesizer fallback failed to start:", err);
  }
}
 
async function playAudioViaBlobUrl(
  type: 'none' | 'cafe' | 'white-noise' | 'pink-noise' | 'brown-noise' | 'rain' | 'heavy-rain',
  audioPath: string,
  volumePercent: number,
  token: number // snapshot of currentPlayToken at call time
) {
  try {
    const response = await fetch(audioPath);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const blob = await response.blob();
 
    // If stop() or a new sound was requested while we were fetching, abort
    if (token !== currentPlayToken) {
      URL.revokeObjectURL(URL.createObjectURL(blob));
      return;
    }
 
    const blobUrl = URL.createObjectURL(blob);
    activeBlobUrl = blobUrl;
 
    const audio = new Audio(blobUrl);
    audio.loop = true;
    audio.volume = (volumePercent / 100) * 0.5;
    activeAudioElement = audio;
 
    await audio.play();
  } catch (err) {
    // Only fall back if this request is still the active one
    if (token === currentPlayToken) {
      console.warn(`Blob fetch failed for ${audioPath}, falling back to synthesizer. Error:`, err);
      playSynthesizedAmbient(type, volumePercent);
    }
  }
}
 
export function startAmbientSound(
  type: 'none' | 'cafe' | 'white-noise' | 'pink-noise' | 'brown-noise' | 'rain' | 'heavy-rain',
  volumePercent: number
) {
  stopAmbientSound(); // increments currentPlayToken, killing any in-flight fetch
  if (type === 'none') return;
 
  const audioPath = getAudioUrl(type);
  if (audioPath) {
    playAudioViaBlobUrl(type, audioPath, volumePercent, currentPlayToken);
  } else {
    playSynthesizedAmbient(type, volumePercent);
  }
}
 
export function setVolume(volPercent: number) {
  if (activeAudioElement) {
    try { activeAudioElement.volume = (volPercent / 100) * 0.5; } catch (_) {}
  }
  if (gainNode && audioCtx) {
    gainNode.gain.setValueAtTime(volPercent / 100 * 0.3, audioCtx.currentTime);
  }
}