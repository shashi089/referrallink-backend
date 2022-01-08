const services = require("../services/services");
const router = require("express").Router();
const {
  verifyToken,
  verifyTokenAndAdmin,
  verifyTokenAndAuthorization,
} = require("../services/verifyToken.services");

// ROUTES
router.post(
  "/login/:date/:name/:id",
  services.referal_register,
  services.register
);
router.post("/register", services.register);
router.post("/login", services.login);
router.put("/update/:id", verifyTokenAndAuthorization, services.update);
router.delete("/delete/:id", verifyTokenAndAuthorization, services.delete);
router.get("/get/all", services.getAll);
router.get("/get/:id", services.getSingleUser);

module.exports = router;
