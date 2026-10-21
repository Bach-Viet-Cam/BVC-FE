import { z } from "zod";
import { type RoadmapVersion, type SaveRoadmapPayload } from "@/features/classes/types/roadmapTypes";

const TITLE_MAX = 100;
const CONTENT_MAX = 1000;
export const EXERCISE_UNAVAILABLE_MESSAGE =
  "Bài luyện ngón đã chọn không còn khả dụng trong thư viện. Vui lòng chọn mục khác.";

const exerciseSchema = z.object({ pieceId: z.string(), title: z.string(), isAvailable: z.boolean() });

// Same rules and wording as the server (RoadmapValidator): MSG-35 / MSG-37 per week, MSG-48 for hidden exercises.
const weekSchema = z
  .object({ weekNumber: z.number(), title: z.string(), content: z.string(), exercises: z.array(exerciseSchema) })
  .superRefine((week, context) => {
    const title = week.title.trim();
    const content = week.content.trim();
    if (!title)
      context.addIssue({
        code: "custom",
        path: ["title"],
        message: `Tiêu đề tuần ${week.weekNumber} không được để trống.`,
      });
    else if (title.length > TITLE_MAX) {
      context.addIssue({
        code: "custom",
        path: ["title"],
        message: `Tiêu đề tuần ${week.weekNumber} không được vượt quá ${TITLE_MAX} ký tự.`,
      });
    }
    if (!content) {
      context.addIssue({
        code: "custom",
        path: ["content"],
        message: `Nội dung học tập tuần ${week.weekNumber} không được để trống.`,
      });
    } else if (content.length > CONTENT_MAX) {
      context.addIssue({
        code: "custom",
        path: ["content"],
        message: `Nội dung học tập tuần ${week.weekNumber} không được vượt quá ${CONTENT_MAX} ký tự.`,
      });
    }
    if (week.exercises.some((exercise) => !exercise.isAvailable)) {
      context.addIssue({ code: "custom", path: ["exercises"], message: EXERCISE_UNAVAILABLE_MESSAGE });
    }
  });

export const roadmapFormSchema = z.object({ weeks: z.array(weekSchema) });

export type RoadmapFormValues = z.infer<typeof roadmapFormSchema>;

export const ROADMAP_TITLE_MAX = TITLE_MAX;
export const ROADMAP_CONTENT_MAX = CONTENT_MAX;

export function toRoadmapFormValues(roadmap: RoadmapVersion): RoadmapFormValues {
  return {
    weeks: roadmap.weeks.map((week) => ({
      weekNumber: week.weekNumber,
      title: week.title,
      content: week.content,
      exercises: week.exercises.map((exercise) => ({ ...exercise })),
    })),
  };
}

export function toSaveRoadmapPayload(values: RoadmapFormValues, baseVersion: number | null): SaveRoadmapPayload {
  return {
    weeks: values.weeks.map((week) => ({
      weekNumber: week.weekNumber,
      title: week.title.trim(),
      content: week.content.trim(),
      exerciseIds: week.exercises.map((exercise) => exercise.pieceId),
    })),
    baseVersion,
  };
}

// Server field "weeks.<weekNumber>.<title|content|exerciseIds>" → form path "weeks.<index>.<title|content|exercises>".
export function toRoadmapFormPath(serverField: string): string | null {
  const match = /^weeks\.(\d+)\.(title|content|exerciseIds)$/.exec(serverField);
  if (!match) return null;
  const formField = match[2] === "exerciseIds" ? "exercises" : match[2];
  return `weeks.${Number(match[1]) - 1}.${formField}`;
}
