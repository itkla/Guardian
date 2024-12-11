const { registerDevice, getAuthorizedDevices, authorizeDevice } = require("../models/deviceModel");

const addDevice = async (req, res) => {
    const userId = req.user.id;
    const { deviceId, deviceName } = req.body;
    try {
        await registerDevice(userId, deviceId, deviceName);
        res.json({ message: "Device registered successfully." });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

const listDevices = async (req, res) => {
    const userId = req.user.id;
    try {
        const devices = await getAuthorizedDevices(userId);
        res.json(devices);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

module.exports = {
    addDevice,
    listDevices,
};
