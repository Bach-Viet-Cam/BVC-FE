// "Most recently opened class" of a lecturer for the progress screen (spec P7). Per browser, best effort.
const keyFor = (userId: string): string => `bvc:lastClassId:${userId}`;

export const lastClassStorage = {
  remember(userId: string, classId: string): void {
    try {
      localStorage.setItem(keyFor(userId), classId);
    } catch {
      // Storage unavailable (private mode, blocked): the screen falls back to the first class.
    }
  },
  read(userId: string): string | null {
    try {
      return localStorage.getItem(keyFor(userId));
    } catch {
      return null;
    }
  },
};
