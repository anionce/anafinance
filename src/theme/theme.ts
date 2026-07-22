import { createTheme } from "@mui/material/styles";

const fraunces = "'Fraunces', serif";
const inter = "'Inter', sans-serif";

export default createTheme({
    palette: {
        mode: "light",
        primary: {
            main: "#5B7F6B",
            light: "#7C9F8B",
            dark: "#456052",
        },
        secondary: {
            main: "#C9A876",
        },
        error: {
            main: "#D9645A",
        },
        warning: {
            main: "#D9A05B",
        },
        success: {
            main: "#5B9279",
        },
        background: {
            default: "#F7F5F1",
            paper: "#FFFFFF",
        },
        text: {
            primary: "#2B2A28",
            secondary: "#726F69",
        },
        divider: "#EAE5DC",
    },
    shape: {
        borderRadius: 16,
    },
    typography: {
        fontFamily: inter,
        h1: { fontFamily: fraunces, fontWeight: 600 },
        h2: { fontFamily: fraunces, fontWeight: 600 },
        h3: { fontFamily: fraunces, fontWeight: 600 },
        h4: { fontFamily: fraunces, fontWeight: 600 },
        h5: { fontFamily: fraunces, fontWeight: 600 },
        h6: { fontFamily: fraunces, fontWeight: 600 },
        button: { textTransform: "none", fontWeight: 600 },
    },
    components: {
        MuiCard: {
            defaultProps: { elevation: 0 },
            styleOverrides: {
                root: {
                    boxShadow: "0 1px 2px rgba(43,42,40,0.04), 0 6px 16px rgba(43,42,40,0.05)",
                    border: "1px solid #EFEBE3",
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    fontWeight: 600,
                },
            },
        },
        MuiTab: {
            styleOverrides: {
                root: {
                    textTransform: "none",
                    fontWeight: 600,
                    fontFamily: inter,
                    fontSize: "0.95rem",
                },
            },
        },
        MuiLinearProgress: {
            styleOverrides: {
                root: {
                    borderRadius: 999,
                },
            },
        },
        MuiToggleButton: {
            styleOverrides: {
                root: {
                    textTransform: "none",
                    fontWeight: 600,
                },
            },
        },
    },
});
