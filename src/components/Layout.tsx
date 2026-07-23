import { useState, type ReactNode } from "react";
import {
    Container, Tabs, Tab, Box, Typography, Avatar, IconButton, ToggleButtonGroup, ToggleButton,
    BottomNavigation, BottomNavigationAction, Paper,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import SpaceDashboardOutlinedIcon from "@mui/icons-material/SpaceDashboardOutlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import SavingsOutlinedIcon from "@mui/icons-material/SavingsOutlined";
import { useLocation, useNavigate } from "react-router-dom";
import ReviewDialog from "./transactions/ReviewDialog";
import ConfirmDialog from "./ConfirmDialog";
import Logo from "./Logo";
import { useFinanceStore } from "../store/financeStore";
import { useSettingsStore } from "../store/settingsStore";
import { useAuthStore } from "../store/authStore";
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
    const [signOutConfirmOpen, setSignOutConfirmOpen] = useState(false);
    const uid = useAuthStore((s) => s.user?.uid ?? "");
    const user = useAuthStore((s) => s.user);
    const signOut = useAuthStore((s) => s.signOut);
    const { transactions, resolveCategory } = useFinanceStore();
    const { categories } = useSettingsStore();
    const { t, locale, setLocale } = useTranslation();

    const navItems = [
        { label: t.navDashboard, path: "/", icon: <SpaceDashboardOutlinedIcon /> },
        { label: t.navExpenses, path: "/expenses", icon: <ShoppingBagOutlinedIcon /> },
        { label: t.navIncome, path: "/income", icon: <TrendingUpOutlinedIcon /> },
        { label: t.navGoals, path: "/goals", icon: <SavingsOutlinedIcon /> },
    ];

    const pending = transactions.filter((tx) => tx.category === "");
    const currentTab = navItems.some((item) => item.path === location.pathname) ? location.pathname : "/";

    const contained = scrollMode === "contained";

    return (
        <Container
            maxWidth="lg"
            sx={contained
                ? { py: 3, pb: { xs: 9, sm: 3 }, height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }
                : { py: 3, pb: { xs: 9, sm: 3 }, minHeight: "100vh", display: "flex", flexDirection: "column" }
            }
        >
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", rowGap: 1, pb: 1.5, borderBottom: 1, borderColor: "divider", mb: 2, flexShrink: 0 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 2, sm: 5 }, minWidth: 0 }}>
                    <Box
                        onClick={() => navigate("/")}
                        sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0, cursor: "pointer" }}
                    >
                        <Logo size={26} />
                        <Typography variant="h6" sx={{ color: "primary.main", whiteSpace: "nowrap", lineHeight: 1 }}>
                            {t.appName}
                        </Typography>
                    </Box>
                    <Tabs value={currentTab} onChange={(_, value) => navigate(value)} sx={{ minHeight: 0, display: { xs: "none", sm: "flex" } }}>
                        {navItems.map((item) => (
                            <Tab key={item.path} label={item.label} value={item.path} sx={{ minHeight: 0, py: 1 }} />
                        ))}
                    </Tabs>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexShrink: 0 }}>
                    <ToggleButtonGroup
                        value={locale}
                        exclusive
                        size="small"
                        onChange={(_, value: Locale | null) => value && setLocale(value)}
                        sx={{
                            "& .MuiToggleButton-root": {
                                border: "none",
                                borderRadius: "999px !important",
                                px: 1.5,
                                color: "text.secondary",
                                "&.Mui-selected": { bgcolor: "primary.main", color: "primary.contrastText", "&:hover": { bgcolor: "primary.dark" } },
                            },
                            bgcolor: "background.default",
                            borderRadius: "999px",
                            p: 0.5,
                        }}
                    >
                        <ToggleButton value="es">ES</ToggleButton>
                        <ToggleButton value="en">EN</ToggleButton>
                    </ToggleButtonGroup>
                    {user && (
                        <>
                            <Avatar
                                src={user.photoURL ?? undefined}
                                alt={user.displayName ?? user.email ?? ""}
                                sx={{ width: 32, height: 32 }}
                            />
                            <IconButton size="small" onClick={() => setSignOutConfirmOpen(true)} title={t.signOut}>
                                <LogoutIcon sx={{ fontSize: 20, opacity: 0.75 }} />
                            </IconButton>
                        </>
                    )}
                </Box>
            </Box>
            {contained ? (
                <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", display: "flex", flexDirection: "column" }}>
                    {children}
                </Box>
            ) : (
                children
            )}
            <ReviewDialog
                pending={pending}
                categories={categories}
                onResolve={(id, category) => resolveCategory(uid, id, category)}
                onFinish={() => {}}
            />
            <ConfirmDialog
                open={signOutConfirmOpen}
                onClose={() => setSignOutConfirmOpen(false)}
                title={t.signOutConfirmTitle}
                message={t.signOutConfirmMessage}
                confirmLabel={t.signOutConfirmButton}
                danger
                onConfirm={() => signOut()}
            />
            <Paper
                elevation={0}
                sx={{
                    display: { xs: "block", sm: "none" },
                    position: "fixed", bottom: 0, left: 0, right: 0,
                    borderTop: 1, borderColor: "divider",
                    borderRadius: 0,
                    zIndex: 1100,
                }}
            >
                <BottomNavigation value={currentTab} onChange={(_, value) => navigate(value)} showLabels>
                    {navItems.map((item) => (
                        <BottomNavigationAction key={item.path} label={item.label} value={item.path} icon={item.icon} />
                    ))}
                </BottomNavigation>
            </Paper>
        </Container>
    );
}
