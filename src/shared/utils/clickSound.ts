export const CLICK_ACCENT_HZ = 880;
export const CLICK_NORMAL_HZ = 587;

// `when` theo đồng hồ AudioContext để xếp lịch chính xác; mặc định phát ngay
export function playClick(
  audioContext: AudioContext,
  isAccent: boolean,
  when = audioContext.currentTime
): OscillatorNode {
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  // Sóng vuông + tắt nhanh theo hàm mũ: tiếng "tách" khô như metronome cơ
  oscillator.type = "square";
  oscillator.frequency.value = isAccent ? CLICK_ACCENT_HZ : CLICK_NORMAL_HZ;
  gain.gain.setValueAtTime(isAccent ? 0.35 : 0.25, when);
  gain.gain.exponentialRampToValueAtTime(0.001, when + 0.04);
  oscillator.connect(gain).connect(audioContext.destination);
  oscillator.start(when);
  oscillator.stop(when + 0.05);
  return oscillator;
}
