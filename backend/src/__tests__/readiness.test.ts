import { RecoveryReadiness, RecoveryMethod, EmailProvider } from '../types';

describe('Recovery Readiness Heuristics', () => {
  const calculateScore = (flags: boolean[]): { score: number; readiness: RecoveryReadiness } => {
    const trueCount = flags.filter(Boolean).length;
    const score = Math.round((trueCount / 4) * 100);

    let readiness = RecoveryReadiness.SETUP_RECOMMENDED;
    if (score === 100) {
      readiness = RecoveryReadiness.READY;
    } else if (score >= 50) {
      readiness = RecoveryReadiness.PARTIALLY_READY;
    } else if (score >= 25) {
      readiness = RecoveryReadiness.MISSING_INFO;
    }

    return { score, readiness };
  };

  test('All 4 recovery flags enabled yields 100% and READY status', () => {
    const { score, readiness } = calculateScore([true, true, true, true]);
    expect(score).toBe(100);
    expect(readiness).toBe(RecoveryReadiness.READY);
  });

  test('2 flags enabled yields 50% and PARTIALLY_READY status', () => {
    const { score, readiness } = calculateScore([true, true, false, false]);
    expect(score).toBe(50);
    expect(readiness).toBe(RecoveryReadiness.PARTIALLY_READY);
  });

  test('1 flag enabled yields 25% and MISSING_INFO status', () => {
    const { score, readiness } = calculateScore([true, false, false, false]);
    expect(score).toBe(25);
    expect(readiness).toBe(RecoveryReadiness.MISSING_INFO);
  });

  test('0 flags enabled yields 0% and SETUP_RECOMMENDED status', () => {
    const { score, readiness } = calculateScore([false, false, false, false]);
    expect(score).toBe(0);
    expect(readiness).toBe(RecoveryReadiness.SETUP_RECOMMENDED);
  });
});
