import crypto from 'crypto';
import {
    ENCRYPTION_ALGORITHM,
    IV_LENGTH,
    PBKDF2_ITERATIONS,
    SALT_LENGTH
} from './constants';

export interface EncryptedData {
    iv: string;
    encrypted: string;
    authTag: string;
    salt: string;
}

/**
 * Derive encryption key from passphrase using PBKDF2
 */
export async function deriveKey(
    passphrase: string,
    salt: Buffer
): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        crypto.pbkdf2(
            passphrase,
            salt,
            PBKDF2_ITERATIONS,
            32, // 256 bits for AES-256
            'sha256',
            (err, derivedKey) => {
                if (err) reject(err);
                else resolve(derivedKey);
            }
        );
    });
}

/**
 * Encrypt data using AES-256-GCM
 */
export async function encrypt(
    plaintext: string,
    passphrase: string
): Promise<EncryptedData> {
    try {
        // Generate random salt and IV
        const salt = crypto.randomBytes(SALT_LENGTH);
        const iv = crypto.randomBytes(IV_LENGTH);

        // Derive key from passphrase
        const key = await deriveKey(passphrase, salt);

        // Create cipher
        const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, key, iv);

        // Encrypt data
        let encrypted = cipher.update(plaintext, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        // Get authentication tag
        const authTag = cipher.getAuthTag();

        return {
            iv: iv.toString('hex'),
            encrypted,
            authTag: authTag.toString('hex'),
            salt: salt.toString('hex'),
        };
    } catch (error) {
        throw new Error(
            `Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
    }
}

/**
 * Decrypt data using AES-256-GCM
 */
export async function decrypt(
    encryptedData: EncryptedData,
    passphrase: string
): Promise<string> {
    try {
        // Convert hex strings back to buffers
        const iv = Buffer.from(encryptedData.iv, 'hex');
        const authTag = Buffer.from(encryptedData.authTag, 'hex');
        const salt = Buffer.from(encryptedData.salt, 'hex');
        const encrypted = encryptedData.encrypted;

        // Derive key from passphrase
        const key = await deriveKey(passphrase, salt);

        // Create decipher
        const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, key, iv);
        decipher.setAuthTag(authTag);

        // Decrypt data
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        throw new Error(
            `Decryption failed: ${error instanceof Error ? error.message : 'Invalid passphrase or corrupted data'}`
        );
    }
}

/**
 * Encrypt snippet code for storage
 */
export async function encryptSnippetCode(
    code: string,
    passphrase: string
): Promise<string> {
    const encrypted = await encrypt(code, passphrase);
    return JSON.stringify(encrypted);
}

/**
 * Decrypt snippet code from storage
 */
export async function decryptSnippetCode(
    encryptedCode: string,
    passphrase: string
): Promise<string> {
    try {
        const encryptedData: EncryptedData = JSON.parse(encryptedCode);
        return await decrypt(encryptedData, passphrase);
    } catch (error) {
        throw new Error(
            `Failed to decrypt code: ${error instanceof Error ? error.message : 'Invalid format'}`
        );
    }
}

/**
 * Check if code is encrypted
 */
export function isEncrypted(code: string): boolean {
    try {
        const parsed = JSON.parse(code);
        return (
            typeof parsed === 'object' &&
            'iv' in parsed &&
            'encrypted' in parsed &&
            'authTag' in parsed &&
            'salt' in parsed
        );
    } catch {
        return false;
    }
}

/**
 * Generate random encryption passphrase
 */
export function generatePassphrase(length: number = 32): string {
    const charset =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    let passphrase = '';
    const randomValues = crypto.randomBytes(length);

    for (let i = 0; i < length; i++) {
        passphrase += charset[randomValues[i] % charset.length];
    }

    return passphrase;
}

/**
 * Hash passphrase for verification (without storing the actual passphrase)
 */
export function hashPassphrase(passphrase: string): string {
    return crypto.createHash('sha256').update(passphrase).digest('hex');
}

/**
 * Verify passphrase against hash
 */
export function verifyPassphrase(passphrase: string, hash: string): boolean {
    return hashPassphrase(passphrase) === hash;
}

/**
 * Re-encrypt data with a new passphrase
 */
export async function reEncrypt(
    encryptedData: EncryptedData,
    oldPassphrase: string,
    newPassphrase: string
): Promise<EncryptedData> {
    // Decrypt with old passphrase
    const plaintext = await decrypt(encryptedData, oldPassphrase);

    // Encrypt with new passphrase
    return await encrypt(plaintext, newPassphrase);
}

/**
 * Encrypt search query (for searching encrypted content)
 * Note: This is a simplified approach. For production, consider using
 * searchable encryption schemes like deterministic encryption or
 * order-preserving encryption.
 */
export async function encryptSearchQuery(
    query: string,
    passphrase: string
): Promise<string> {
    // For now, just hash the query for exact matching
    // In production, implement a proper searchable encryption scheme
    const salt = crypto.createHash('sha256').update(passphrase).digest();
    const encrypted = await deriveKey(query.toLowerCase(), salt);
    return encrypted.toString('hex');
}

