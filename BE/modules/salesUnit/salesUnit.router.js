const express = require("express");
const SalesUnit = require("./salesUnit.controller");
const router = express.Router();

router.post("/create", SalesUnit.createSalesUnit);
// router.get("/:id", SalesUnit.getSalesUnitById);
router.get("/:companyName", SalesUnit.getSalesUnitByCom);


module.exports = router;
