/**
 * Password strength for the read-only tier of Akahu accreditation, which asks
 * for "high strength requirements (minimum length + character variety)".
 *
 * A `minLength` attribute on the input is not that: it is a hint the browser
 * enforces and anything else ignores. These rules are checked here, shown in
 * the form as the user types, and — the part that actually binds — mirrored in
 * the Supabase Auth password policy, which is what rejects a weak password
 * arriving from something that is not this form.
 */

export const MIN_LENGTH = 12;

export type PasswordRule = {
  id: string;
  label: string;
  ok: (value: string) => boolean;
};

export const PASSWORD_RULES: PasswordRule[] = [
  {
    id: 'length',
    label: `At least ${MIN_LENGTH} characters`,
    ok: (v) => v.length >= MIN_LENGTH,
  },
  { id: 'lower', label: 'A lowercase letter', ok: (v) => /[a-z]/.test(v) },
  { id: 'upper', label: 'An uppercase letter', ok: (v) => /[A-Z]/.test(v) },
  { id: 'digit', label: 'A number', ok: (v) => /[0-9]/.test(v) },
  {
    id: 'symbol',
    label: 'A symbol',
    // Anything that is not a letter, a digit or whitespace. Naming a set of
    // allowed symbols instead would quietly reject the ones a password
    // manager likes to generate.
    ok: (v) => /[^A-Za-z0-9\s]/.test(v),
  },
];

export type PasswordCheck = {
  ok: boolean;
  failed: PasswordRule[];
  /** How many rules pass, for the strength meter. */
  met: number;
  total: number;
};

export function checkPassword(value: string): PasswordCheck {
  const failed = PASSWORD_RULES.filter((rule) => !rule.ok(value));
  return {
    ok: failed.length === 0,
    failed,
    met: PASSWORD_RULES.length - failed.length,
    total: PASSWORD_RULES.length,
  };
}
