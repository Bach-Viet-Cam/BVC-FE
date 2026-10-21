import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Outlet } from "react-router-dom";
import {
  MAX_RETRIES,
  MSG,
  REJECT_REASON,
  RETRY_DELAY_FIRST_S,
  RETRY_DELAY_LATER_S,
  SAMPLE,
  STAGE_SECONDS,
} from "@/features/practice/constants/practiceConstants";
import type { DemoFlags, RecordingFile, Submission } from "@/features/practice/types/practiceTypes";
import { toast } from "@/shared/components/ui/toast";

function freshDemo(): DemoFlags {
  return {
    expired: false,
    micDenied: false,
    otherProc: false,
    noPitch: false,
    invalid: "none",
    weakNet: false,
    qcFail: false,
    leaveProc: false,
    autoStop: false,
    aiMode: "none",
    failJob: 1,
  };
}

interface PracticeDemoValue {
  demo: DemoFlags;
  setDemoFlag: <K extends keyof DemoFlags>(key: K, value: DemoFlags[K]) => void;
  toggleDemoFlag: (key: keyof DemoFlags) => void;
  resetDemo: () => void;
  submission: Submission | null;
  left: number;
  blocked: boolean;
  submit: (file: RecordingFile) => void;
  retry: () => void;
  clearSubmission: () => void;
  uploading: boolean;
  bannerVisible: boolean;
  dismissBanner: () => void;
}

const PracticeDemoContext = createContext<PracticeDemoValue | null>(null);

export function usePracticeDemo() {
  const value = useContext(PracticeDemoContext);
  if (!value) throw new Error("usePracticeDemo phải nằm trong PracticeDemoProvider");
  return value;
}

export function PracticeDemoProvider() {
  const [demo, setDemo] = useState<DemoFlags>(freshDemo);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [left, setLeft] = useState(SAMPLE.submissionsLeft);
  const [uploading, setUploading] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(false);

  const demoRef = useRef(demo);

  useEffect(() => {
    demoRef.current = demo;
  }, [demo]);

  const commit = useCallback((sub: Submission) => {
    setSubmission(sub);
    setUploading(false);
    setBannerVisible(false);
    toast.success(MSG.sent); // MSG-18
  }, []);

  const submit = useCallback(
    (file: RecordingFile) => {
      const now = Date.now();
      const sub: Submission = {
        id: now,
        file,
        status: "Đang xử lý",
        stage: 0,
        stageStart: now,
        fails: 0,
        retriesUsed: 0,
        exhausted: false,
        retryAt: 0,
        reason: "",
        doneAt: 0,
        notified: false,
      };
      if (demoRef.current.weakNet) {
        setUploading(true);
        setTimeout(() => commit({ ...sub, stageStart: Date.now() }), 2600);
        return;
      }
      commit(sub);
    },
    [commit]
  );

  // GBR-63: chạy lại từ bước bị lỗi
  const retry = useCallback(() => {
    setSubmission((sub) => {
      const now = Date.now();
      if (!sub || sub.status !== "Lỗi xử lý" || sub.exhausted || now < sub.retryAt) return sub;
      toast.info(MSG.retrying); // MSG-24
      return { ...sub, status: "Đang xử lý", stageStart: now, retriesUsed: sub.retriesUsed + 1 };
    });
  }, []);

  // Bốn bước xử lý chạy nền ở mọi màn hình
  useEffect(() => {
    if (!submission || submission.status !== "Đang xử lý") return;

    const timer = setInterval(() => {
      setSubmission((sub) => {
        if (!sub || sub.status !== "Đang xử lý") return sub;
        const now = Date.now();
        if ((now - sub.stageStart) / 1000 < STAGE_SECONDS) return sub;

        const flags = demoRef.current;

        if (sub.stage === 0) {
          if (flags.qcFail) return { ...sub, status: "Từ chối", reason: REJECT_REASON }; // GBR-12
          return { ...sub, stage: 1, stageStart: now };
        }

        // GBR-65: một bước lỗi. GBR-59: lần đầu chờ 5 giây, các lần sau 10 giây
        const failHere =
          flags.aiMode !== "none" && sub.stage === flags.failJob && (flags.aiMode === "always" || sub.fails === 0);
        if (failHere) {
          const delay = sub.fails === 0 ? RETRY_DELAY_FIRST_S : RETRY_DELAY_LATER_S;
          return {
            ...sub,
            status: "Lỗi xử lý",
            fails: sub.fails + 1,
            retryAt: now + delay * 1000,
            exhausted: sub.retriesUsed >= MAX_RETRIES,
          };
        }

        if (sub.stage < 3) return { ...sub, stage: sub.stage + 1, stageStart: now };

        setLeft((value) => Math.max(0, value - 1));
        return { ...sub, stage: 4, status: "Hoàn tất", doneAt: now, notified: false };
      });
    }, 120);

    return () => clearInterval(timer);
  }, [submission]);

  const setDemoFlag = useCallback<PracticeDemoValue["setDemoFlag"]>((key, value) => {
    setDemo((flags) => ({ ...flags, [key]: value }));
  }, []);

  const toggleDemoFlag = useCallback((key: keyof DemoFlags) => {
    setDemo((flags) => ({ ...flags, [key]: !flags[key] }));
  }, []);

  const resetDemo = useCallback(() => {
    setDemo(freshDemo());
    setSubmission(null);
    setLeft(SAMPLE.submissionsLeft);
    setUploading(false);
    setBannerVisible(false);
  }, []);

  const value = useMemo<PracticeDemoValue>(
    () => ({
      demo,
      setDemoFlag,
      toggleDemoFlag,
      resetDemo,
      submission,
      left,
      blocked: Boolean(demo.expired || left <= 0 || demo.otherProc || submission?.status === "Đang xử lý"),
      submit,
      retry,
      clearSubmission: () => setSubmission(null),
      uploading,
      bannerVisible,
      dismissBanner: () => setBannerVisible(false),
    }),
    [demo, setDemoFlag, toggleDemoFlag, resetDemo, submission, left, submit, retry, uploading, bannerVisible]
  );

  return (
    <PracticeDemoContext.Provider value={value}>
      <Outlet />
    </PracticeDemoContext.Provider>
  );
}
