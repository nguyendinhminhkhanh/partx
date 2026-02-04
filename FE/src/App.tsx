import { Routes, Route } from "react-router";
import CreateInvoice from "./pages/CreateInvoice";
import CreateSaleUnit from "./pages/CreateSaleUnit";
import Home from "./pages/Home";
import Login from "./pages/Login";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home></Home>}></Route>
        <Route path="/login" element={<Login></Login>}></Route>
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
