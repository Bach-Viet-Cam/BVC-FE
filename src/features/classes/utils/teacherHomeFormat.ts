export interface HomeClass {
  id: string;
  name: string;
  cohort: string;
  memberCount: number;
  weekLabel: string;
  onTrack: number;
  atRisk: number;
  behind: number;
}

export interface HomeTask {
  id: string;
  tone: "warn" | "ok";
  message: string;
  actionLabel: string;
  path: string;
}

// Students the lecturer should look at: at risk or behind in any running class.
export function countAttention(classes: HomeClass[]): number {
  return classes.reduce((sum, cls) => sum + cls.atRisk + cls.behind, 0);
}

export function formatWeekLabel(week: string): string {
  return week === "-" ? "Chưa bắt đầu" : `Tuần ${week}`;
}

// "Cần xử lý hôm nay": one row per class with students to watch, plus unpublished drafts.
export function buildHomeTasks(classes: HomeClass[], draftCount: number): HomeTask[] {
  const classTasks = classes
    .filter((cls) => cls.atRisk + cls.behind > 0)
    .map<HomeTask>((cls) => ({
      id: `class-${cls.id}`,
      tone: "warn",
      message: `${cls.atRisk + cls.behind} sinh viên cần chú ý - ${cls.name}`,
      actionLabel: "Xem lớp",
      path: `/teacher/classes/${cls.id}`,
    }));
  if (draftCount === 0) return classTasks;
  return [
    ...classTasks,
    {
      id: "drafts",
      tone: "warn",
      message: `${draftCount} bài tập nháp chưa đăng`,
      actionLabel: "Xem bài tập",
      path: "/teacher/assignments",
    },
  ];
}
