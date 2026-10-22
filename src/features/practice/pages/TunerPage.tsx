import { Navigate, useNavigate, useParams } from "react-router-dom";
import { PracticeFrame } from "@/features/practice/components/PracticeFrame";
import { PracticeTopBar } from "@/features/practice/components/PracticeTopBar";
import { TunerView } from "@/features/practice/components/TunerView";
import { SAMPLE } from "@/features/practice/constants/practiceConstants";
import { useIsMobile } from "@/shared/hooks/use-mobile";

export function TunerPage() {
  const navigate = useNavigate();
  const { songId } = useParams();
  const isMobile = useIsMobile();

  // Laptop: lên dây là ngăn kéo của màn ghi âm, không có trang riêng
  if (!isMobile) return <Navigate to={`/practice/${songId}/record`} state={{ drawer: "tuner" }} replace />;

  return (
    <PracticeFrame>
      <PracticeTopBar
        variant="close"
        title="Lên dây"
        subtitle={`${SAMPLE.instrument} · 4 dây · A4 440 Hz`}
        onBack={() => navigate(-1)}
      />
      <TunerView />
    </PracticeFrame>
  );
}
