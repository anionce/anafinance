import { useEffect } from "react";
import type { ReactNode } from "react";
import { Container, Tabs, Tab, Box, ToggleButtonGroup, ToggleButton } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import ReviewDialog from "./transactions/ReviewDialog";
import { useFinanceStore } from "../store/financeStore";
import { useSettingsStore } from "../store/settingsStore";
import { useTranslation } from "../i18n/useTranslation";
import type { Locale } from "../store/localeStore";

interface Props {
    children: ReactNode;
    /**
     * "page" (default): normal document flow, the browser page scrolls.
     * "contained": fixed-height shell with its own inner scroll region, used
     * by pages with a DataGrid that needs to fill the remaining viewport
     * height and scroll internally instead of growing the page.
     */
    scrollMode?: "page" | "contained";
}

export default function Layout({ children, scrollMode = "page" }: Props) {
    const location = useLocation();
    const navigate = useNavigate();
    const { hasLoaded, load, transactions, resolveCategory } = useFinanceStore();
    const { hasLoaded: settingsHasLoaded, load: loadSettings, categories } = useSettingsStore();
    const { t, locale, setLocale } = useTranslation();

    useEffect(() => {
        if (!hasLoaded) load();
        if (!settingsHasLoaded) loadSettings();
    }, [hasLoaded, load, settingsHasLoaded, loadSettings]);

    const navItems = [
        { label: t.navDashboard, path: "/" },
        { label: t.navExpenses, path: "/expenses" },
        { label: t.navIncome, path: "/income" },
        { label: t.navGoals, path: "/goals" },
    ];

    const pending = transactions.filter((tx) => tx.category === "");
    const currentTab = navItems.some((item) => item.path === location.pathname) ? location.pathname : "/";

    const contained = scrollMode === "contained";

    return (
        <Container
            maxWidth="lg"
            sx={contained
                ? { py: 3, height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }
                : { py: 3, minHeight: "100vh", display: "flex", flexDirection: "column" }
            }
        >
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: 1, borderColor: "divider", mb: 3, flexShrink: 0 }}>
                <Tabs value={currentTab} onChange={(_, value) => navigate(value)}>
                    {navItems.map((item) => (
                        <Tab key={item.path} label={item.label} value={item.path} />
                    ))}
                </Tabs>
                <ToggleButtonGroup
                    value={locale}
                    exclusive
                    size="small"
                    onChange={(_, value: Locale | null) => value && setLocale(value)}
                >
                    <ToggleButton value="es">ES</ToggleButton>
                    <ToggleButton value="en">EN</ToggleButton>
                </ToggleButtonGroup>
            </Box>
            {contained ? (
                <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", display: "flex", flexDirection: "column" }}>
                    {children}
                </Box>
            ) : (
                children
            )}
            <ReviewDialog pending={pending} categories={categories} onResolve={resolveCategory} onFinish={() => {}} />
        </Container>
    );
}
