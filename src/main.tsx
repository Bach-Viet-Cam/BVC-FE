import { createRoot } from "react-dom/client";
import { App } from "@/app/App";
import { listenForPwaInstall } from "@/shared/utils/pwaInstall";
import "./index.css";

listenForPwaInstall();

createRoot(document.getElementById("root")!).render(<App />);
