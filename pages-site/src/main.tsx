import { createRoot } from "react-dom/client";
import "../../app/globals.css";
import Home from "../../app/page";

const container = document.querySelector<HTMLDivElement>("#root");

if (!container) {
  throw new Error("页面挂载节点不存在");
}

createRoot(container).render(<Home />);
