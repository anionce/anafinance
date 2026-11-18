import { Avatar } from "@mui/material";
import type { User } from "firebase/auth";

const initialOf = (user: User) => (user.displayName ?? user.email ?? "?").charAt(0).toUpperCase();

export const UserAvatar = ({ user, size }: { user: User; size: number }) => (
    <Avatar src={user.photoURL ?? undefined} alt={user.displayName ?? user.email ?? ""} sx={{ width: size, height: size }}>
        {!user.photoURL && initialOf(user)}
    </Avatar>
);
