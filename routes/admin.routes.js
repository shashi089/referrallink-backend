const services = require("../services/services");
const router = require("express").Router();
const {
  verifyToken,
  verifyTokenAndAdmin,
} = require("../services/verifyToken.services");

router.post("/post", verifyTokenAndAdmin, services.register);
router.put("/update/:id", verifyTokenAndAdmin, services.update);
router.delete("/delete/:id", verifyTokenAndAdmin, services.delete);
router.get("/get/all", services.getAll);
router.get("/get/:id", services.getSingleUser);

module.exports = router;
