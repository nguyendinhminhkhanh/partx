require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const errorHandler = require("./common/errorHandle");
const cors = require("cors");
const AuthRouter = require("./modules/auth");
const UploadRouter = require("./modules/upload");
const SalesUnitRouter = require("./modules/salesUnit");
const InvoiceRouter = require("./modules/invoice");
const SaleInvoiceRouter = require("./modules/saleInvoice");
const app = express();

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB");
  const port = process.env.PORT || 3000;

  app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://partx-ipaf.onrender.com'
  ],
  credentials: true
}))
  app.use(express.json());
  app.use("/api/auth", AuthRouter);
  app.use("/api/upload", UploadRouter);
  app.use("/api/saleunit", SalesUnitRouter);
  app.use("/api/invoice", InvoiceRouter);
  app.use("/api/saleinvoice", SaleInvoiceRouter);

  app.use(errorHandler);
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}

main();
