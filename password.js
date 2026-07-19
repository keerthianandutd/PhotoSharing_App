const crypto = require('crypto');

/**
 * Return a salted and hashed password entry from a clear text password.
 * @param {string} clearTextPassword
 * @return {object} passwordEntry where passwordEntry is an object with two
 * string properties:
 *    salt - The salt used for the password.
 *    hash - The sha1 hash of the password and salt.
 */
function makePasswordEntry(clearTextPassword) {
    // Generate a random salt of 8 bytes and convert to hex.
    const salt = crypto.randomBytes(8).toString('hex');

    // Concatenate the password and salt, then hash the result using SHA-1.
    const hash = crypto
        .createHash('sha1')
        .update(clearTextPassword + salt)
        .digest('hex');

    // Return the salt and hash as an object.
    return { salt, hash };
}

/**
 * Return true if the specified clear text password and salt generates the
 * specified hash.
 * @param {string} hash
 * @param {string} salt
 * @param {string} clearTextPassword
 * @return {boolean}
 */
function doesPasswordMatch(hash, salt, clearTextPassword) {
    // Concatenate the provided password and salt, then hash the result using SHA-1.
    const computedHash = crypto
        .createHash('sha1')
        .update(clearTextPassword + salt)
        .digest('hex');

    // Compare the computed hash with the provided hash and return true if they match.
    return hash === computedHash;
}

// Export the functions for use in other modules.
module.exports = { makePasswordEntry, doesPasswordMatch };
