/** 0–4 segments for UI password strength bar */
export function computePasswordStrengthSegments(password: string): number {
  if (!password) return 0;
  let score = 1;
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  return Math.min(4, score);
}

export function passwordStrengthLabel(segments: number): string {
  if (segments <= 1) return 'Weak';
  if (segments === 2) return 'Fair';
  if (segments === 3) return 'Strong';
  return 'Robust';
}
