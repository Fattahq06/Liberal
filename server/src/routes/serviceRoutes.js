const express = require("express");
const router = express.Router();
const {
  getAllServices,
  createService,
  updateServiceStatus,
} = require("../controllers/serviceController");

router.get("/services", getAllServices);
router.post("/services", createService);
router.patch("/services/:id", updateServiceStatus);

module.exports = router;
