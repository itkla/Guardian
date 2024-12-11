const { addDevice, listDevices } = require("../controllers/deviceController");
const authenticate = require("../middleware/authMiddleware");

router.post("/device", authenticate, addDevice);
router.get("/devices", authenticate, listDevices);