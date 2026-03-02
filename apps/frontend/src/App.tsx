import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout";
import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { GuestRoute } from "@/features/auth/GuestRoute";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { SignUpPage } from "@/features/auth/pages/SignUpPage";
import { ConfirmPage } from "@/features/auth/pages/ConfirmPage";
import { Providers } from "./app/providers";

function App() {
  return (
    <Providers>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
          <Route path="/signup" element={<GuestRoute><SignUpPage /></GuestRoute>} />
          <Route path="/confirm" element={<ConfirmPage />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </Providers>
  );
}

export default App;
