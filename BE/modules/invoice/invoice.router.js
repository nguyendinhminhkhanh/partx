const express = require("express");
const router = express.Router();
const invoiceController = require("./invoice.controller");

router.post("/create", invoiceController.createInvoice);
router.get("/", invoiceController.getAllInvoice);

module.exports = router;
