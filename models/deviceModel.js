const registerDevice = async (userId, deviceId, deviceName) => {
    await pool.query(
        "INSERT INTO devices (user_id, device_id, device_name) VALUES ($1, $2, $3)",
        [userId, deviceId, deviceName]
    );
};

const getAuthorizedDevices = async (userId) => {
    const result = await pool.query("SELECT * FROM devices WHERE user_id = $1 AND is_authorized = TRUE", [userId]);
    return result.rows;
};

const authorizeDevice = async (deviceId) => {
    await pool.query("UPDATE devices SET is_authorized = TRUE WHERE device_id = $1", [deviceId]);
};

module.exports = {
    registerDevice,
    getAuthorizedDevices,
    authorizeDevice,
};
  