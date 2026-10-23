import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Outlet } from "react-router-dom";
import { audioAnalysisApi } from "@/features/practice/api/audioAnalysisApi";
import { practiceSubmissionApi } from "@/features/practice/api/practiceSubmissionApi";
import { MSG } from "@/features/practice/constants/practiceConstants";
import type { DemoFlags } from "@/features/practice/types/practiceTypes";
import type { PracticeSubmission, PracticeSubmitTarget } from "@/features/practice/types/practiceSubmissionTypes";
import { isSlowUpload, isWeakConnection } from "@/features/practice/utils/networkQuality";
import { toast } from "@/shared/components/ui/toast";
import { getApiErrorMessage } from "@/shared/utils/getApiErrorMessage";

const WEAK_CHECK_MS = 1000;

function freshDemo(): DemoFlags {
  return {
    expired: false,
    micDenied: false,
    otherProc: false,
    noPitch: false,
    invalid: "none",
    autoStop: false,
  };
}

interface SubmittedFile {
  submissionId: string;
  file: File;
}

interface PracticeDemoValue {
  demo: DemoFlags;
  setDemoFlag: <K extends keyof DemoFlags>(key: K, value: DemoFlags[K]) => void;
  toggleDemoFlag: (key: keyof DemoFlags) => void;
  resetDemo: () => void;
  blocked: boolean;
  submit: (file: File, target: PracticeSubmitTarget) => Promise<PracticeSubmission | null>;
  uploading: boolean;
  uploadWeak: boolean;
  lastSubmitted: SubmittedFile | null;
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
  const [uploading, setUploading] = useState(false);
  const [uploadWeak, setUploadWeak] = useState(false);
  const [lastSubmitted, setLastSubmitted] = useState<SubmittedFile | null>(null);
  const [bannerVisible, setBannerVisible] = useState(false);
  const uploadingRef = useRef(false);
  const progress = useRef({ startedAt: 0, percent: 0, totalBytes: 0 });

  // MSG-17: kiểm tra mạng yếu cả khi tải lên bị treo, không chờ sự kiện tiến độ
  useEffect(() => {
    if (!uploading) return;
    const timer = setInterval(() => {
      const { startedAt, percent, totalBytes } = progress.current;
      setUploadWeak(isWeakConnection() || isSlowUpload(totalBytes, percent, Date.now() - startedAt));
    }, WEAK_CHECK_MS);
    return () => clearInterval(timer);
  }, [uploading]);

  // Tải file lên rồi tạo Submission "Đang xử lý" (UC-01 steps 10-11, MSG-18)
  const submit = useCallback(async (file: File, target: PracticeSubmitTarget): Promise<PracticeSubmission | null> => {
    if (uploadingRef.current) return null;
    uploadingRef.current = true;
    progress.current = { startedAt: Date.now(), percent: 0, totalBytes: file.size };
    setUploading(true);
    setUploadWeak(isWeakConnection());
    try {
      const controller = new AbortController();
      const uploaded = await audioAnalysisApi.upload(file, controller.signal, (percent) => {
        progress.current.percent = percent;
      });
      const response = await practiceSubmissionApi.create({
        ...target,
        studentUploadId: uploaded.data.data.fileId,
      });
      const submission = response.data.data;
      setLastSubmitted({ submissionId: submission.id, file });
      setBannerVisible(false);
      toast.success(MSG.sent); // MSG-18
      return submission;
    } catch (reason) {
      // 409 (GBR-49) trả về đúng thông báo "Bản nộp trước đang được xử lý..."
      toast.error(getApiErrorMessage(reason, MSG.submitFailed));
      return null;
    } finally {
      uploadingRef.current = false;
      setUploading(false);
      setUploadWeak(false);
    }
  }, []);

  const setDemoFlag = useCallback<PracticeDemoValue["setDemoFlag"]>((key, value) => {
    setDemo((flags) => ({ ...flags, [key]: value }));
  }, []);

  const toggleDemoFlag = useCallback((key: keyof DemoFlags) => {
    setDemo((flags) => ({ ...flags, [key]: !flags[key] }));
  }, []);

  const resetDemo = useCallback(() => {
    setDemo(freshDemo());
    setBannerVisible(false);
  }, []);

  const value = useMemo<PracticeDemoValue>(
    () => ({
      demo,
      setDemoFlag,
      toggleDemoFlag,
      resetDemo,
      blocked: Boolean(demo.expired || demo.otherProc),
      submit,
      uploading,
      uploadWeak,
      lastSubmitted,
      bannerVisible,
      dismissBanner: () => setBannerVisible(false),
    }),
    [demo, setDemoFlag, toggleDemoFlag, resetDemo, submit, uploading, uploadWeak, lastSubmitted, bannerVisible]
  );

  return (
    <PracticeDemoContext.Provider value={value}>
      <Outlet />
    </PracticeDemoContext.Provider>
  );
}
