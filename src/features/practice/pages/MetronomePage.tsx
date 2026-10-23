import { Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import { MetronomeView } from "@/features/practice/components/MetronomeView";
import { PracticeFrame } from "@/features/practice/components/PracticeFrame";
import { PracticeTopBar } from "@/features/practice/components/PracticeTopBar";
import { useIsMobile } from "@/shared/hooks/use-mobile";

export function MetronomePage() {
  const navigate = useNavigate();
  const { sheetId } = useParams();
  const { search } = useLocation();
  const isMobile = useIsMobile();

  // Laptop: metronome là ngăn kéo của màn ghi âm, không có trang riêng
  if (!isMobile)
    return <Navigate to={`/practice/sheets/${sheetId}/record${search}`} state={{ drawer: "metronome" }} replace />;

  return (
    <PracticeFrame>
      <PracticeTopBar
        variant="close"
        title="Metronome"
        subtitle="Chỉnh tốc độ, số chỉ nhịp và phân phách khi luyện"
        onBack={() => navigate(-1)}
      />
      <MetronomeView />
    </PracticeFrame>
  );
}
