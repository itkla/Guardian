const pool = require("../config/db");

const createUser = async (email, password) => {
const result = await pool.query(
    "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *",
    [email, password]
);
    return result.rows[0];  
};

const findUserByEmail = async (email) => {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    return result.rows[0];
};

const updateUserPGPKeys = async (userId, publicKey, privateKey) => {
    await pool.query(
        "UPDATE users SET pgp_public_key = $1, pgp_private_key = $2 WHERE id = $3",
        [publicKey, privateKey, userId]
    );
};

const getUserPGPKeys = async (userId) => {
    const result = await pool.query(
        "SELECT pgp_public_key, pgp_private_key FROM users WHERE id = $1",
        [userId]
    );
    return result.rows[0];
};

const enableMFA = async (userId, mfaSecret) => {
    await pool.query(
        "UPDATE users SET mfa_secret = $1, is_mfa_enabled = TRUE WHERE id = $2",
        [mfaSecret, userId]
    );
};

const getMFAStatus = async (userId) => {
    const result = await pool.query(
        "SELECT mfa_secret, is_mfa_enabled FROM users WHERE id = $1",
        [userId]
    );
    return result.rows[0];
};

module.exports = {
    createUser,
    findUserByEmail,
    updateUserPGPKeys,
    getUserPGPKeys,
    enableMFA,
    getMFAStatus,
};
