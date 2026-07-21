import { Container, Typography } from "@mui/material";
import { ReactNode } from "react";

interface Props {

    children: ReactNode;

}

export default function Layout({ children }: Props) {

    return (

        <Container
            maxWidth="lg"
            sx={{
                py: 5
            }}
        >
            {children}

        </Container>

    );

}