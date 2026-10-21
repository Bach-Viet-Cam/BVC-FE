export const CLICK_ACCENT_HZ = 1320;
export const CLICK_NORMAL_HZ = 880;

// `when` theo đồng hồ AudioContext để xếp lịch chính xác; mặc định phát ngay
export function playClick(
  audioContext: AudioContext,
  isAccent: boolean,
  when = audioContext.currentTime
): OscillatorNode {
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.frequency.value = isAccent ? CLICK_ACCENT_HZ : CLICK_NORMAL_HZ;
  gain.gain.value = 0.2;
  oscillator.connect(gain).connect(audioContext.destination);
  oscillator.start(when);
  oscillator.stop(when + 0.06);
  return oscillator;
}
