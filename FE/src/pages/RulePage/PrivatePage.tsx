import { Outlet, Navigate } from "react-router-dom";
import useAuth from "../../hook/useAuth";
function PrivatePage() {
  const { user } = useAuth();
  const isMenber = !!user;
  return isMenber ? <Outlet /> : <Navigate to="/login" />;
}
export default PrivatePage;
