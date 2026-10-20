export function playClick(audioContext: AudioContext, isAccent: boolean): void {
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.frequency.value = isAccent ? 1320 : 880;
  gain.gain.value = 0.2;
  oscillator.connect(gain).connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.06);
}
