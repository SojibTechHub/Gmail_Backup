import { encrypt, decrypt } from '../utils/encryption';

describe('Server Metadata AES-256-GCM Encryption', () => {
  const secretKey = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
  const sampleText = 'Confidential recovery audit payload 123';

  test('Encrypts and decrypts text accurately with authentication tag validation', () => {
    const encryptedResult = encrypt(sampleText, secretKey);
    expect(encryptedResult).toHaveProperty('encrypted');
    expect(encryptedResult).toHaveProperty('iv');
    expect(encryptedResult).toHaveProperty('authTag');

    const decrypted = decrypt(
      encryptedResult.encrypted,
      secretKey,
      encryptedResult.iv,
      encryptedResult.authTag
    );

    expect(decrypted).toBe(sampleText);
  });

  test('Fails to decrypt with tampered ciphertext or altered authTag', () => {
    const encryptedResult = encrypt(sampleText, secretKey);

    expect(() => {
      decrypt(
        encryptedResult.encrypted,
        secretKey,
        encryptedResult.iv,
        '00'.repeat(16) // invalid tag
      );
    }).toThrow();
  });
});
