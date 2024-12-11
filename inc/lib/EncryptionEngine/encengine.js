/*
    This file contains the encryption engine for the application. It includes the following functionalities:
    - AES encryption and decryption
    - PGP key pair generation
    - PostgreSQL schema initialization
    - Demo function to demonstrate the functionalities

    The encryption engine uses the following libraries:
    - crypto: Built-in Node.js library for cryptographic operations
    - openpgp: OpenPGP.js library for PGP encryption and decryption
    - dotenv: Library to read environment variables from a .env file
    - pg: PostgreSQL client library for Node.js

    The encryption engine is designed to be used as a standalone module that can be integrated into any Node.js application.
    It provides a set of functions for encrypting and decrypting data using AES and PGP encryption, as well as managing PGP key pairs in a PostgreSQL database.

    The demo function demonstrates the usage of the encryption engine by performing the following steps:
    1. Initialize the PostgreSQL schema by creating a table to store PGP keys.
    2. Encrypt and decrypt a message using AES encryption.
    3. Generate a PGP key pair for a user and store it in the PostgreSQL database.

    The encryption engine can be extended to support additional encryption algorithms, key management features, and integrations with other databases or key management services.

    @author: Hunter Nakagawa
*/

require("dotenv").config();
const { Client } = require("pg");
const crypto = require("crypto");
const openpgp = require("openpgp");

// Fetch PostgreSQL credentials from .env file 
const dbClient = new Client({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
});

// Connect to PostgreSQL
(async () => {
    try {
        await dbClient.connect();
        console.log("Connected to PostgreSQL");
    } catch (err) {
        console.error("Failed to connect to PostgreSQL:", err);
        process.exit(1);
    }
})();

// Encryption method
const aesKey = crypto.randomBytes(64); // 512-bit key
const iv = crypto.randomBytes(16); // Initialization vector

function encryptAES(plaintext) {
    const cipher = crypto.createCipheriv("aes-256-cbc", aesKey, iv);
    let encrypted = cipher.update(plaintext, "utf8", "hex");
    encrypted += cipher.final("hex");
    return { encrypted, iv: iv.toString("hex") };
}

function decryptAES(encryptedText, ivHex) {
    const decipher = crypto.createDecipheriv("aes-256-cbc", aesKey, Buffer.from(ivHex, "hex"));
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
}

// PGP Key Pair Generation
async function generatePGPKeys(userId, passphrase) {
    const { privateKey, publicKey } = await openpgp.generateKey({
        type: "rsa",
        rsaBits: 4096, // Secure RSA key length
        userIDs: [{ name: userId }],
        passphrase,
    });

    // Store keys in PostgreSQL
    await dbClient.query(
        "INSERT INTO pgp_keys (user_id, public_key, private_key) VALUES ($1, $2, $3)",
        [userId, publicKey, privateKey]
    );

    return { publicKey, privateKey };
}

// PostgreSQL Schema Initialization
async function initializeSchema() {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS pgp_keys (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        public_key TEXT NOT NULL,
        private_key TEXT NOT NULL
        );
    `;

    await dbClient.query(createTableQuery);
    console.log("Database schema initialized.");
}