import { useState, type ReactNode } from "react";
import { BottomNavigation, BottomNavigationAction, Box, ButtonBase, Container, Paper, Tab, Tabs, Typography } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { useSortedCategories } from "../hooks/useSortedCategories";
import { useTranslation } from "../i18n/useTranslation";
import { useAuthStore } from "../store/authStore";
import { useFinanceStore } from "../store/financeStore";
import { ConfirmDialog } from "./ConfirmDialog";
import { AccountDrawer } from "./layout/AccountDrawer";
import { SettingsDialogs, type SettingsDialog } from "./layout/SettingsDialogs";
import { useNavItems } from "./layout/useNavItems";
import { UserAvatar } from "./layout/UserAvatar";
import { Logo } from "./Logo";
import { ReviewDialog } from "./transactions/ReviewDialog";

interface Props {
    children: ReactNode;
    scrollMode?: "page" | "contained";
}

const HOME_PATH = "/";

const headerSx = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    rowGap: 1,
    pb: 1.5,
    borderBottom: 1,
    borderColor: "divider",
    mb: 2,
    flexShrink: 0,
};

const bottomNavSx = {
    display: { xs: "block", sm: "none" },
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    borderTop: 1,
    borderColor: "divider",
    borderRadius: 0,
    zIndex: 1100,
};

export const Layout = ({ children, scrollMode = "page" }: Props) => {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const navItems = useNavItems();
    const categories = useSortedCategories();
    const user = useAuthStore((s) => s.user);
    const signOut = useAuthStore((s) => s.signOut);
    const { transactions, resolveCategory, removeTransaction, removeTransactions } = useFinanceStore();
    const [accountMenuOpen, setAccountMenuOpen] = useState(false);
    const [signOutConfirmOpen, setSignOutConfirmOpen] = useState(false);
    const [openDialog, setOpenDialog] = useState<SettingsDialog | null>(null);

    const uid = user?.uid ?? "";
    const pending = transactions.filter((tx) => tx.category === "");
    const currentTab = navItems.some((item) => item.path === location.pathname) ? location.pathname : HOME_PATH;
    const contained = scrollMode === "contained";

    const openSettingsDialog = (dialog: SettingsDialog) => {
        setAccountMenuOpen(false);
        setOpenDialog(dialog);
    };

    const askToSignOut = () => {
        setAccountMenuOpen(false);
        setSignOutConfirmOpen(true);
    };

    return (
        <Container
            maxWidth="lg"
            sx={{
                py: 3,
                pb: { xs: 9, sm: 3 },
                display: "flex",
                flexDirection: "column",
                ...(contained ? { height: "100vh", overflow: "hidden" } : { minHeight: "100vh" }),
            }}
        >
            <Box sx={headerSx}>
                <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 2, sm: 5 }, minWidth: 0 }}>
                    <ButtonBase onClick={() => navigate(HOME_PATH)} sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}>
                        <Logo size={26} />
                        <Typography variant="h6" sx={{ color: "primary.main", whiteSpace: "nowrap", lineHeight: 1 }}>
                            {t.appName}
                        </Typography>
                    </ButtonBase>
                    <Tabs
                        value={currentTab}
                        onChange={(_, value) => navigate(value)}
                        sx={{ minHeight: 0, display: { xs: "none", sm: "flex" } }}
                    >
                        {navItems.map((item) => (
                            <Tab key={item.path} label={item.label} value={item.path} sx={{ minHeight: 0, py: 1 }} />
                        ))}
                    </Tabs>
                </Box>
                {user && (
                    <ButtonBase
                        onClick={() => setAccountMenuOpen(true)}
                        aria-label={t.accountMenuPreferencesLabel}
                        sx={{ borderRadius: "50%" }}
                    >
                        <UserAvatar user={user} size={32} />
                    </ButtonBase>
                )}
            </Box>

            {contained ? (
                <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", display: "flex", flexDirection: "column" }}>{children}</Box>
            ) : (
                children
            )}

            <AccountDrawer
                open={accountMenuOpen}
                onClose={() => setAccountMenuOpen(false)}
                onOpenDialog={openSettingsDialog}
                onSignOut={askToSignOut}
            />
            <SettingsDialogs open={openDialog} onClose={() => setOpenDialog(null)} />
            <ReviewDialog
                pending={pending}
                categories={categories}
                onResolve={(id, category) => resolveCategory(uid, id, category)}
                onDiscardOne={(id) => removeTransaction(uid, id)}
                onDiscardAll={() =>
                    removeTransactions(
                        uid,
                        pending.map((tx) => tx.id),
                    )
                }
            />
            <ConfirmDialog
                open={signOutConfirmOpen}
                onClose={() => setSignOutConfirmOpen(false)}
                title={t.signOutConfirmTitle}
                message={t.signOutConfirmMessage}
                confirmLabel={t.signOutConfirmButton}
                danger
                onConfirm={signOut}
            />
            <Paper elevation={0} sx={bottomNavSx}>
                <BottomNavigation value={currentTab} onChange={(_, value) => navigate(value)} showLabels>
                    {navItems.map((item) => (
                        <BottomNavigationAction key={item.path} label={item.label} value={item.path} icon={item.icon} />
                    ))}
                </BottomNavigation>
            </Paper>
        </Container>
    );
};
