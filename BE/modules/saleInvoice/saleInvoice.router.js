const express = require("express");
const router = express.Router();
const ctrl = require("./saleInvoice.controller");
const isAuth = require("../../common/middlewares/isAuth");

router.post("/create", isAuth, ctrl.createSaleInvoice);
router.get("/stats/overview", isAuth, ctrl.getSaleInvoiceStats);
router.get("/", isAuth, ctrl.getAllSaleInvoice);
router.get("/:id", isAuth, ctrl.getSaleInvoiceById);
router.put("/:id", isAuth, ctrl.updateSaleInvoice);
router.delete("/:id", isAuth, ctrl.deleteSaleInvoice);

module.exports = router;
