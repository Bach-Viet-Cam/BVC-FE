import { Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import { PracticeFrame } from "@/features/practice/components/PracticeFrame";
import { PracticeTopBar } from "@/features/practice/components/PracticeTopBar";
import { TunerView } from "@/features/practice/components/TunerView";
import { useInstrumentTunes } from "@/features/practice/hooks/useInstrumentTunes";
import { usePracticeAudio } from "@/features/practice/hooks/usePracticeAudio";
import { buildDemoSession } from "@/features/practice/utils/practiceSession";
import { useIsMobile } from "@/shared/hooks/use-mobile";

export function TunerPage() {
  const navigate = useNavigate();
  const { sheetId } = useParams();
  const { search } = useLocation();
  const isMobile = useIsMobile();
  // Laptop dùng micro của RecordPage nên ở đó không mở thêm micro
  const audio = usePracticeAudio({ micWanted: isMobile, fminHz: buildDemoSession(false).fminHz });
  // Dây chuẩn của nhạc cụ thuộc bản nhạc
  const tunes = useInstrumentTunes(sheetId ?? "");

  // Laptop: lên dây là ngăn kéo của màn ghi âm, không có trang riêng
  if (!isMobile)
    return <Navigate to={`/practice/sheets/${sheetId}/record${search}`} state={{ drawer: "tuner" }} replace />;

  return (
    <PracticeFrame>
      <PracticeTopBar
        variant="close"
        title="Lên dây"
        subtitle={[tunes.instrumentName, "Chuẩn A4 440 Hz"].filter(Boolean).join(" · ")}
        onBack={() => navigate(-1)}
      />
      <TunerView audio={audio} tunes={tunes} />
    </PracticeFrame>
  );
}
