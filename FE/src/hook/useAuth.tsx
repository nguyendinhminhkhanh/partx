import { createContext, useContext } from "react";

export type User = {
  _id: string;
  fullName: string;
};
export type AuthContextType = {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
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
