import { Toaster } from "sonner";
import { Routes, Route } from "react-router";
import CreateInvoice from "./pages/CreateInvoice";
import CreateSaleUnit from "./pages/CreateSaleUnit";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import InvoiceList from "./pages/InvoiceList";
import PageTest from "./pages/PageTest";

function App() {
  return (
    <>
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
    </>
  );
}
export default App;
