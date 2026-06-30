import { createContext, useContext } from "react";

export type User = {
  _id: string;
  username: string;
  fullName: string;
  email: string;
  phone: number;
  createdAt: string;
  role?: string;
  avatar?: string;
};
export type AuthContextType = {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  status: string;
};
export const AuthContext = createContext<AuthContextType | null>(null);
export default function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  const { user, setUser } = context;
  return { user, setUser };
}
