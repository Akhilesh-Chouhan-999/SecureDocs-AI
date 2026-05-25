import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { AppRouter } from "./routes/AppRouter";
import { ProcessingOverlay } from "./components/ui/ProcessingOverlay";
import { useAppStore } from "./store/appStore";
import { useAuthStore } from "./store/authStore";
import { AppProvider } from "./providers/AppProvider";

export default function App() {
  const processingDocument = useAppStore((state) => state.processingDocument);
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <AppProvider>
      <BrowserRouter>
        <AppRouter />
        <ProcessingOverlay isVisible={!!processingDocument} />
      </BrowserRouter>
    </AppProvider>
  );
}
