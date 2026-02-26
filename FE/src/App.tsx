import { Toaster } from "sonner";
import { Routes, Route } from "react-router";
import CreateInvoice from "./pages/CreateInvoice";
import CreateSaleUnit from "./pages/CreateSaleUnit";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import InvoiceList from "./pages/InvoiceList";
import PageTest from "./pages/PageTest";
import { AuthContext } from "./hook/useAuth";
import { useEffect, useState } from "react";
import type { User } from "./hook/useAuth";
import request from "./api/request";
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
      // try {
      //   const res = await request({
      //     url: "/auth/me",
      //     method: "GET",
      //   });
      //   if (res.success) {
      //     setUser(res.data);
      //     setStatus("done");
      //   } else {
      //     setStatus("error");
      //   }
      // } catch (error) {
      //   console.log(error);
      //   setStatus("error");
      // }
    };
    fetchUserInfor();
  }, []);
  // if (status === "idle" || status === "loading") return <div>Loading ...</div>;

  // if (status === "error") return <div>Error</div>;
  return (
    <AuthContext.Provider value={{ user, setUser }}>
      <Toaster richColors />
      <Routes>
        <Route path="/" element={<Home></Home>}></Route>
        <Route path="/login" element={<Login></Login>}></Route>
        <Route path="/register" element={<Register></Register>}></Route>
        <Route
          path="/invoicelist"
          element={<InvoiceList></InvoiceList>}
        ></Route>
        <Route path="/pagetest" element={<PageTest></PageTest>}></Route>
        <Route
          path="/createsaleunit"
          element={<CreateSaleUnit></CreateSaleUnit>}
        ></Route>
        <Route
          path="/createinvoice"
          element={<CreateInvoice></CreateInvoice>}
        ></Route>
      </Routes>
    </AuthContext.Provider>
  );
}
export default App;
