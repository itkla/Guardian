const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const openpgp = require("openpgp");
const { createUser, findUserByEmail } = require("../models/userModel");
const { updateUserPGPKeys, getUserPGPKeys } = require("../models/userModel");
const speakeasy = require("speakeasy");
const QRCode = require("qrcode");

require("dotenv").config();

// const register = async (req, res) => {
//     const { email, password } = req.body;

//     try {
//         const existingUser = await findUserByEmail(email);
//         if (existingUser) return res.status(400).json({ message: "Email already registered." });

//         const hashedPassword = await bcrypt.hash(password, 10);
//         const user = await createUser(email, hashedPassword);
//         res.status(201).json({ message: "User registered successfully.", user: { id: user.id, email: user.email } });
//     } catch (err) {
//         res.status(500).json({ message: "Server error", error: err.message });
//     }
// };

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await findUserByEmail(email);
        if (!user) return res.status(400).json({ message: "Invalid email or password." });

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return res.status(400).json({ message: "Invalid email or password." });

        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.json({ message: "Login successful.", token });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

const generatePGPKeys = async (userId) => {
    const { privateKey, publicKey } = await openpgp.generateKey({
        type: "rsa", // RSA key type
        rsaBits: 4096, // Key size
        userIDs: [{ name: `User ${userId}`, email: `user${userId}@example.com` }], // Identity
        passphrase: process.env.PGP_PASSPHRASE || "", // Optional passphrase
    });
    return { privateKey, publicKey };
};

const register = async (req, res) => {
    const { email, password } = req.body;

    try {
        const existingUser = await findUserByEmail(email);
        if (existingUser) return res.status(400).json({ message: "Email already registered." });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await createUser(email, hashedPassword);

        // Generate PGP keys for the user
        const { privateKey, publicKey } = await generatePGPKeys(user.id);
        await updateUserPGPKeys(user.id, publicKey, privateKey);

        res.status(201).json({
        message: "User registered successfully.",
        user: { id: user.id, email: user.email, pgpPublicKey: publicKey },
        });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};
  
  // Add a new endpoint to retrieve PGP keys
const getPGPKeys = async (req, res) => {
    const userId = req.user.id;

    try {
        const keys = await getUserPGPKeys(userId);
        if (!keys) return res.status(404).json({ message: "PGP keys not found." });

        res.json({ pgpPublicKey: keys.pgp_public_key, pgpPrivateKey: keys.pgp_private_key });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

const setupMFA = async (req, res) => {
    const userId = req.user.id;
  
    try {
        const secret = speakeasy.generateSecret({ name: "Guardian" });
    await enableMFA(userId, secret.base32);
        const qrCode = await QRCode.toDataURL(secret.otpauth_url);
        res.json({ message: "MFA setup successful", qrCode, secret: secret.base32 });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};
  
const verifyMFA = async (req, res) => {
    const { token } = req.body;
    const userId = req.user.id;

    try {
        const mfaDetails = await getMFAStatus(userId);
        if (!mfaDetails.is_mfa_enabled) {
            return res.status(400).json({ message: "MFA is not enabled for this account." });
        }

        const verified = speakeasy.totp.verify({
            secret: mfaDetails.mfa_secret,
            encoding: "base32",
            token,
        });
        if (!verified) return res.status(400).json({ message: "Invalid MFA token." });
        res.json({ message: "MFA verification successful." });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

module.exports = {
    register,
    login,
    getPGPKeys,
    setupMFA,
    verifyMFA,
};
