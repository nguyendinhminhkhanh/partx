import { Toaster } from "sonner";
import { Routes, Route } from "react-router";
import CreateInvoice from "./pages/CreateInvoice";
import CreateSaleUnit from "./pages/CreateSaleUnit";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import InvoiceList from "./pages/InvoiceList";
import Profile from "./pages/Profile";
import PageTest from "./pages/PageTest";
import { AuthContext } from "./hook/useAuth";
import { useEffect, useState } from "react";
import type { User } from "./hook/useAuth";
import { PrivatePage } from "./pages/RulePage";
import request from "./api/request";
import SaleUnitList from "./pages/SaleUnitList";
function App() {
  const [status, setStatus] = useState("idle");
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUserInfor = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setStatus("done");
        return;
      }
      try {
        const res = await request({
          url: "/auth/me",
          method: "GET",
        });
        // console.log("Fetch user info response:", res);
        if (res.success) {
          setUser(res.data);
          setStatus("done");
        } else {
          setStatus("error");
        }
      } catch (error) {
        console.log(error);
        setStatus("errorToken");
      }
    };
    fetchUserInfor();
  }, []);
  if (status === "idle" || status === "loading") return <div>Loading ...</div>;

  if (status === "error") return <div>Error</div>;
  return (
    <AuthContext.Provider value={{ user, setUser, status }}>
      <Toaster richColors />
      <Routes>
        <Route path="/login" element={<Login></Login>}></Route>
        <Route path="/register" element={<Register></Register>}></Route>

        <Route element={<PrivatePage />}>
          <Route path="/" element={<Home></Home>}></Route>

          <Route path="/profile" element={<Profile></Profile>}></Route>

          <Route
            path="/invoicelist"
            element={<InvoiceList></InvoiceList>}
          ></Route>

          <Route
            path="/createsaleunit"
            element={<CreateSaleUnit></CreateSaleUnit>}
          ></Route>

          <Route
            path="/createinvoice"
            element={<CreateInvoice></CreateInvoice>}
          ></Route>

          <Route
            path="/saleunitlist"
            element={<SaleUnitList></SaleUnitList>}
          ></Route>

          <Route path="/pagetest" element={<PageTest></PageTest>}></Route>
        </Route>
      </Routes>
    </AuthContext.Provider>
  );
}
export default App;
