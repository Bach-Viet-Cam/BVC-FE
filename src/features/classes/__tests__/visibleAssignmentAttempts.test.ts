import { expect, it } from "vitest";
import { visibleAssignmentAttempts } from "../utils/visibleAssignmentAttempts";

it("does not allocate slots for a huge lecturer limit", () => {
  expect(visibleAssignmentAttempts(0, 2147483647)).toEqual([1, 2, 3]);
  expect(visibleAssignmentAttempts(500, 2147483647)).toHaveLength(12);
});
it("shows actual attempts for unlimited assignments and respects finite limits", () => {
  expect(visibleAssignmentAttempts(0, null)).toEqual([]);
  expect(visibleAssignmentAttempts(4, null)).toEqual([1, 2, 3, 4]);
  expect(visibleAssignmentAttempts(3, 3)).toEqual([1, 2, 3]);
});
