// Chỉ một bản thu / video được phát tại một thời điểm: phát cái mới thì dừng cái đang phát
let current: HTMLMediaElement | null = null;

export function claimPlayback(media: HTMLMediaElement) {
  if (current && current !== media && !current.paused) current.pause();
  current = media;
}

export function releasePlayback(media: HTMLMediaElement) {
  if (current === media) current = null;
}
