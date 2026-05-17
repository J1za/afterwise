type AuthErrorKey =
  | 'rateLimit'
  | 'alreadyRegistered'
  | 'invalidCredentials'
  | 'emailNotConfirmed'
  | 'weakPassword'
  | 'invalidEmail'
  | 'userNotFound';

const patterns: { match: RegExp; key: AuthErrorKey }[] = [
  { match: /after (\d+) seconds?/i, key: 'rateLimit' },
  { match: /already registered|already exists/i, key: 'alreadyRegistered' },
  { match: /invalid login credentials/i, key: 'invalidCredentials' },
  { match: /email not confirmed/i, key: 'emailNotConfirmed' },
  { match: /password should be at least/i, key: 'weakPassword' },
  { match: /unable to validate email/i, key: 'invalidEmail' },
  { match: /^user_not_found$/i, key: 'userNotFound' },
];

type Translator = (key: AuthErrorKey) => string;

export function translateAuthError(
  error: unknown,
  t: Translator,
): string {
  const raw = error instanceof Error ? error.message : String(error);
  for (const { match, key } of patterns) {
    if (match.test(raw)) return t(key);
  }
  return raw;
}
