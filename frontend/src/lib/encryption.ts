/**
 * Client-Side AES-256-GCM Encryption Library for MailVault
 * Using the standard W3C Web Crypto API.
 * Encryption keys never leave the user's browser.
 */

// Convert ArrayBuffer to Hex String
function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// Convert Hex String to Uint8Array
function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

/**
 * Derives a 256-bit AES-GCM CryptoKey from a user passphrase using PBKDF2-HMAC-SHA256
 */
export async function deriveKeyFromPassphrase(
  passphrase: string,
  saltHex: string
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  const saltBytes = hexToBytes(saltHex);

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBytes,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Generates a random cryptographic salt (16 bytes) in Hex
 */
export function generateSalt(): string {
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  return bufferToHex(salt.buffer);
}

/**
 * Client-side AES-256-GCM Encryption
 * Encrypts an object/string with AES-GCM 256 using key derived from passphrase + salt
 */
export async function encryptClientVault(
  data: unknown,
  passphrase: string,
  existingSalt?: string
): Promise<{ encryptedData: string; iv: string; authTag: string; salt: string }> {
  const salt = existingSalt || generateSalt();
  const key = await deriveKeyFromPassphrase(passphrase, salt);

  // 12 bytes IV is standard and recommended for AES-GCM
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(JSON.stringify(data));

  // In Web Crypto API, AES-GCM automatically appends the 16-byte authentication tag to the ciphertext
  const ciphertextWithTag = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
      tagLength: 128, // 16 bytes tag
    },
    key,
    encodedData
  );

  const totalBytes = new Uint8Array(ciphertextWithTag);
  const tagLengthInBytes = 16;
  const ciphertextBytes = totalBytes.slice(0, totalBytes.length - tagLengthInBytes);
  const authTagBytes = totalBytes.slice(totalBytes.length - tagLengthInBytes);

  return {
    encryptedData: bufferToHex(ciphertextBytes.buffer),
    authTag: bufferToHex(authTagBytes.buffer),
    iv: bufferToHex(iv.buffer),
    salt,
  };
}

/**
 * Client-side AES-256-GCM Decryption
 * Decrypts encryptedData using iv, authTag, passphrase, and salt
 */
export async function decryptClientVault<T = unknown>(
  encryptedDataHex: string,
  ivHex: string,
  authTagHex: string,
  passphrase: string,
  saltHex: string
): Promise<T> {
  const key = await deriveKeyFromPassphrase(passphrase, saltHex);

  const ciphertextBytes = hexToBytes(encryptedDataHex);
  const authTagBytes = hexToBytes(authTagHex);
  const ivBytes = hexToBytes(ivHex);

  // Combine ciphertext and authTag for Web Crypto subtle.decrypt
  const combined = new Uint8Array(ciphertextBytes.length + authTagBytes.length);
  combined.set(ciphertextBytes, 0);
  combined.set(authTagBytes, ciphertextBytes.length);

  try {
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: ivBytes,
        tagLength: 128,
      },
      key,
      combined
    );

    const decoder = new TextDecoder();
    const jsonString = decoder.decode(decryptedBuffer);
    return JSON.parse(jsonString) as T;
  } catch {
    throw new Error('Failed to decrypt vault. Incorrect passphrase or corrupted data.');
  }
}
