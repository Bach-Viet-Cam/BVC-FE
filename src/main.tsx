import { createRoot } from "react-dom/client";
import { App } from "@/app/App";
import { registerAppUpdate } from "@/shared/utils/appUpdate";
import { listenForPwaInstall } from "@/shared/utils/pwaInstall";
import "./index.css";

listenForPwaInstall();
registerAppUpdate();

createRoot(document.getElementById("root")!).render(<App />);
