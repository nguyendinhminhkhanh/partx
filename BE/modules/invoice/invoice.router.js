const express = require("express");
const router = express.Router();
const invoiceController = require("./invoice.controller");
const isAuth = require("../../common/middlewares/isAuth");
router.post("/create", isAuth, invoiceController.createInvoice);
router.get("/:id", isAuth, invoiceController.getInvoiceById);
router.delete("/:id", isAuth, invoiceController.deleteInvoice);
router.get("/", isAuth, invoiceController.getAllInvoice);

module.exports = router;
