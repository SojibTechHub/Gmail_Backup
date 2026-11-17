import { detectProvider, hashToken, generateToken } from '../utils';
import { EmailProvider } from '../types';

describe('Provider Detection Engine', () => {
  test('Identifies Gmail domains accurately', () => {
    expect(detectProvider('user@gmail.com')).toBe(EmailProvider.GMAIL);
    expect(detectProvider('admin@googlemail.com')).toBe(EmailProvider.GMAIL);
  });

  test('Identifies Microsoft / Outlook / Hotmail domains accurately', () => {
    expect(detectProvider('work@outlook.com')).toBe(EmailProvider.OUTLOOK);
    expect(detectProvider('old@hotmail.com')).toBe(EmailProvider.OUTLOOK);
    expect(detectProvider('user@live.com')).toBe(EmailProvider.OUTLOOK);
  });

  test('Identifies Yahoo, iCloud, and Proton domains accurately', () => {
    expect(detectProvider('hello@yahoo.com')).toBe(EmailProvider.YAHOO);
    expect(detectProvider('user@icloud.com')).toBe(EmailProvider.ICLOUD);
    expect(detectProvider('secure@proton.me')).toBe(EmailProvider.PROTONMAIL);
    expect(detectProvider('secure@protonmail.com')).toBe(EmailProvider.PROTONMAIL);
  });

  test('Falls back to Other Provider for unrecognized domains', () => {
    expect(detectProvider('support@company.internal')).toBe(EmailProvider.OTHER);
    expect(detectProvider('contact@mystartup.dev')).toBe(EmailProvider.OTHER);
  });
});

describe('Cryptographic Token Utilities', () => {
  test('generateToken produces unique non-empty strings', () => {
    const t1 = generateToken();
    const t2 = generateToken();
    expect(t1).toBeDefined();
    expect(t1.length).toBe(64);
    expect(t1).not.toBe(t2);
  });

  test('hashToken produces deterministic 64-character SHA-256 hashes', () => {
    const raw = 'my-test-session-secret';
    const h1 = hashToken(raw);
    const h2 = hashToken(raw);
    expect(h1).toBe(h2);
    expect(h1.length).toBe(64);
  });
});

describe('Security Health Grade Calculation', () => {
  const getGrade = (score: number): string => {
    if (score >= 85) return 'A';
    if (score >= 70) return 'B';
    if (score >= 50) return 'C';
    return 'F';
  };

  test('Assigns Grade A for scores 85 and above', () => {
    expect(getGrade(100)).toBe('A');
    expect(getGrade(85)).toBe('A');
  });

  test('Assigns Grade B for scores between 70 and 84', () => {
    expect(getGrade(75)).toBe('B');
  });

  test('Assigns Grade C for scores between 50 and 69', () => {
    expect(getGrade(50)).toBe('C');
    expect(getGrade(68)).toBe('C');
  });

  test('Assigns Grade F for vulnerable scores below 50', () => {
    expect(getGrade(49)).toBe('F');
    expect(getGrade(0)).toBe('F');
  });
});
