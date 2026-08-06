import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import DashboardPage from "./pages/DashboardPage";
import ExpensesPage from "./pages/ExpensesPage";
import IncomesPage from "./pages/IncomesPage";
import TransactionsPage from "./pages/TransactionsPage";
import GoalsPage from "./pages/GoalsPage";
import NoComputablePage from "./pages/NoComputablePage";
import LoginPage from "./pages/LoginPage";
import OnboardingPage from "./pages/OnboardingPage";
import { useAuthStore } from "./store/authStore";
import { useFinanceStore } from "./store/financeStore";
import { useSettingsStore } from "./store/settingsStore";
import { useToastStore } from "./store/toastStore";
import { useTranslation } from "./i18n/useTranslation";
import GlobalToast from "./components/GlobalToast";

function FullScreenLoader() {
    return (
        <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CircularProgress />
        </Box>
    );
}

function AuthenticatedApp({ uid }: { uid: string }) {
    const financeLoaded = useFinanceStore((s) => s.hasLoaded);
    const loadFinance = useFinanceStore((s) => s.load);
    const settingsLoaded = useSettingsStore((s) => s.hasLoaded);
    const onboardingComplete = useSettingsStore((s) => s.onboardingComplete);
    const loadSettings = useSettingsStore((s) => s.load);

    useEffect(() => {
        loadFinance(uid);
        loadSettings(uid);
    }, [uid, loadFinance, loadSettings]);

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
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/goals" element={<GoalsPage />} />
            <Route path="/no-computable" element={<NoComputablePage />} />
            <Route path="/onboarding" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default function App() {
    const { t } = useTranslation();
    const user = useAuthStore((s) => s.user);
    const authLoading = useAuthStore((s) => s.authLoading);
    const init = useAuthStore((s) => s.init);
    const resetFinance = useFinanceStore((s) => s.reset);
    const resetSettings = useSettingsStore((s) => s.reset);
    const showError = useToastStore((s) => s.showError);

    useEffect(() => {
        init();
    }, [init]);

    useEffect(() => {
        if (!user) {
            resetFinance();
            resetSettings();
        }
    }, [user, resetFinance, resetSettings]);

    // Backstop for the many store actions (category edits, budget saves, goal
    // updates...) that don't handle their own failures: without this, a
    // rejected Firestore write fails completely silently for the user, with
    // only a console warning nobody sees. Flows that already show their own
    // specific error (sign-in, file import) still do — this only catches
    // what nothing else does.
    useEffect(() => {
        function handleRejection(event: PromiseRejectionEvent) {
            console.error(event.reason);
            showError(t.genericErrorMessage);
        }
        window.addEventListener("unhandledrejection", handleRejection);
        return () => window.removeEventListener("unhandledrejection", handleRejection);
    }, [t, showError]);

    return (
        <>
            {authLoading ? (
                <FullScreenLoader />
            ) : !user ? (
                <LoginPage />
            ) : (
                <BrowserRouter>
                    <AuthenticatedApp uid={user.uid} />
                </BrowserRouter>
            )}
            <GlobalToast />
        </>
    );
}
