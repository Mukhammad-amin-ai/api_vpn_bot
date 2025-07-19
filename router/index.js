import Router from "express";
import vpn from "../controller/vpn/index.js";
import user from "../controller/user/index.js";

let router = new Router();

router.get("/key", vpn.getAccessKeys);
router.get("/key/:id", vpn.getAccessKeysById);
router.post("/generate-key", vpn.generateKey);
router.post("/create-payment", user.CreatePayment);
router.post("/catch-payment", user.CatchWebhook);

export default router;
