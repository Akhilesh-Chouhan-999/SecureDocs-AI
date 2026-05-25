import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AppRouter } from "./routes/AppRouter";
import { ProcessingOverlay } from "./components/ui/ProcessingOverlay";
import { useAppStore } from "./store/appStore";

export default function App() {
  const processingDocument = useAppStore((state) => state.processingDocument);

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          className: "glass",
          style: {
            background: "var(--card)",
            color: "var(--foreground)",
            border: "1px solid var(--border)",
          },
        }}
      />
      <AppRouter />
      <ProcessingOverlay isVisible={!!processingDocument} />
    </BrowserRouter>
  );
}
