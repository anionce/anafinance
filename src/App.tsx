import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import DashboardPage from "./pages/DashboardPage";
import ExpensesPage from "./pages/ExpensesPage";
import IncomesPage from "./pages/IncomesPage";
import GoalsPage from "./pages/GoalsPage";
import LoginPage from "./pages/LoginPage";
import OnboardingPage from "./pages/OnboardingPage";
import { useAuthStore } from "./store/authStore";
import { useFinanceStore } from "./store/financeStore";
import { useSettingsStore } from "./store/settingsStore";
import { runLegacyMigrationIfNeeded } from "./services/migration";

function FullScreenLoader() {
    return (
        <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CircularProgress />
        </Box>
    );
}

function AuthenticatedApp({ uid, email }: { uid: string; email: string | null }) {
    const financeLoaded = useFinanceStore((s) => s.hasLoaded);
    const loadFinance = useFinanceStore((s) => s.load);
    const settingsLoaded = useSettingsStore((s) => s.hasLoaded);
    const onboardingComplete = useSettingsStore((s) => s.onboardingComplete);
    const loadSettings = useSettingsStore((s) => s.load);

    useEffect(() => {
        (async () => {
            await runLegacyMigrationIfNeeded(uid, email);
            loadFinance(uid);
            loadSettings(uid);
        })();
    }, [uid, email, loadFinance, loadSettings]);

    if (!financeLoaded || !settingsLoaded) {
        return <FullScreenLoader />;
    }

    if (!onboardingComplete) {
        return (
            <Routes>
                <Route path="*" element={<OnboardingPage />} />
            </Routes>
        );
    }

    return (
        <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/expenses" element={<ExpensesPage />} />
            <Route path="/income" element={<IncomesPage />} />
            <Route path="/goals" element={<GoalsPage />} />
            <Route path="/onboarding" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default function App() {
    const user = useAuthStore((s) => s.user);
    const authLoading = useAuthStore((s) => s.authLoading);
    const init = useAuthStore((s) => s.init);
    const resetFinance = useFinanceStore((s) => s.reset);
    const resetSettings = useSettingsStore((s) => s.reset);

    useEffect(() => {
        init();
    }, [init]);

    useEffect(() => {
        if (!user) {
            resetFinance();
            resetSettings();
        }
    }, [user, resetFinance, resetSettings]);

    if (authLoading) {
        return <FullScreenLoader />;
    }

    if (!user) {
        return <LoginPage />;
    }

    return (
        <BrowserRouter>
            <AuthenticatedApp uid={user.uid} email={user.email} />
        </BrowserRouter>
    );
}
