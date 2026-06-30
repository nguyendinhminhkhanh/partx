const express = require("express");
const router = express.Router();
const invoiceController = require("./invoice.controller");
const isAuth = require("../../common/middlewares/isAuth");
router.post("/create", isAuth, invoiceController.createInvoice);
router.get("/stats/overview", isAuth, invoiceController.getStats);
router.get("/", isAuth, invoiceController.getAllInvoice);
router.get("/:id", isAuth, invoiceController.getInvoiceById);
router.put("/:id", isAuth, invoiceController.updateInvoice);
router.delete("/:id", isAuth, invoiceController.deleteInvoice);

module.exports = router;
