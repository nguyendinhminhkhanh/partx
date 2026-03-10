const express = require("express");
const SalesUnit = require("./salesUnit.controller");
const router = express.Router();

router.post("/create", SalesUnit.createSalesUnit);
router.get("/", SalesUnit.getAllSalesUnit);

router.delete("/:id", SalesUnit.deleteSaleUnit);
router.get("/:companyName", SalesUnit.getSalesUnitByCom);
module.exports = router;
