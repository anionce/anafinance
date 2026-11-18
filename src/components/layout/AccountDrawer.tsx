import type { ReactNode } from "react";
import { Box, Button, Divider, Drawer, FormControlLabel, Switch, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import EditIcon from "@mui/icons-material/Edit";
import HistoryIcon from "@mui/icons-material/History";
import LogoutIcon from "@mui/icons-material/Logout";
import RuleOutlinedIcon from "@mui/icons-material/RuleOutlined";
import { useTranslation } from "../../i18n/useTranslation";
import { useAuthStore } from "../../store/authStore";
import type { Locale } from "../../store/localeStore";
import { useSettingsStore } from "../../store/settingsStore";
import type { SettingsDialog } from "./SettingsDialogs";
import { UserAvatar } from "./UserAvatar";

interface Props {
    open: boolean;
    onClose: () => void;
    onOpenDialog: (dialog: SettingsDialog) => void;
    onSignOut: () => void;
}

const languageToggleSx = {
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
};

const Section = ({ label, children }: { label: string; children: ReactNode }) => (
    <Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
            {label}
        </Typography>
        {children}
    </Box>
);

const PreferenceSwitch = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) => (
    <FormControlLabel
        sx={{ ml: 0 }}
        control={<Switch size="small" checked={checked} onChange={(e) => onChange(e.target.checked)} />}
        label={<Typography variant="body2">{label}</Typography>}
    />
);

export const AccountDrawer = ({ open, onClose, onOpenDialog, onSignOut }: Props) => {
    const { t, locale, setLocale } = useTranslation();
    const user = useAuthStore((s) => s.user);
    const uid = user?.uid ?? "";
    const { combinedTransactionsView, showNoComputableTab, setCombinedTransactionsView, setShowNoComputableTab } = useSettingsStore();

    const menuItems: { dialog: SettingsDialog; label: string; icon: ReactNode }[] = [
        { dialog: "categories", label: t.manageCategoriesTooltip, icon: <CategoryOutlinedIcon /> },
        { dialog: "rules", label: t.manageRulesTooltip, icon: <RuleOutlinedIcon /> },
        { dialog: "budgets", label: t.editBudgetTooltip, icon: <EditIcon /> },
        { dialog: "budgetHistory", label: t.budgetHistoryTooltip, icon: <HistoryIcon /> },
    ];

    return (
        <Drawer anchor="right" open={open} onClose={onClose}>
            <Box sx={{ width: 280, p: 3, display: "flex", flexDirection: "column", gap: 2.5, height: "100%" }}>
                {user && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <UserAvatar user={user} size={48} />
                        <Box sx={{ minWidth: 0 }}>
                            {user.displayName && (
                                <Typography variant="subtitle1" noWrap sx={{ fontWeight: 600 }}>
                                    {user.displayName}
                                </Typography>
                            )}
                            <Typography variant="body2" color="text.secondary" noWrap>
                                {user.email}
                            </Typography>
                        </Box>
                    </Box>
                )}

                <Divider />

                <Section label={t.accountMenuLanguageLabel}>
                    <ToggleButtonGroup
                        value={locale}
                        exclusive
                        size="small"
                        onChange={(_, value: Locale | null) => value && setLocale(value)}
                        sx={languageToggleSx}
                    >
                        <ToggleButton value="es">ES</ToggleButton>
                        <ToggleButton value="en">EN</ToggleButton>
                    </ToggleButtonGroup>
                </Section>

                <Divider />

                <Section label={t.accountMenuPreferencesLabel}>
                    <PreferenceSwitch
                        label={t.combinedTransactionsViewLabel}
                        checked={combinedTransactionsView}
                        onChange={(checked) => setCombinedTransactionsView(uid, checked)}
                    />
                    <PreferenceSwitch
                        label={t.showNoComputableTabLabel}
                        checked={showNoComputableTab}
                        onChange={(checked) => setShowNoComputableTab(uid, checked)}
                    />
                </Section>

                <Divider />

                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                    {menuItems.map((item) => (
                        <Button
                            key={item.dialog}
                            startIcon={item.icon}
                            color="inherit"
                            onClick={() => onOpenDialog(item.dialog)}
                            sx={{ justifyContent: "flex-start" }}
                        >
                            {item.label}
                        </Button>
                    ))}
                </Box>

                <Box sx={{ flexGrow: 1 }} />

                <Divider />

                <Button startIcon={<LogoutIcon />} color="error" onClick={onSignOut} sx={{ justifyContent: "flex-start" }}>
                    {t.signOut}
                </Button>
            </Box>
        </Drawer>
    );
};
