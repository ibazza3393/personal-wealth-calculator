import { NextResponse } from 'next/server';
import { mapAkahuAccounts, type AkahuAccountsResponse } from '@/lib/providers/akahu-map';

export const dynamic = 'force-dynamic';

function tokens() {
  const appToken = process.env.AKAHU_APP_TOKEN?.trim() ?? '';
  const userToken = process.env.AKAHU_USER_TOKEN?.trim() ?? '';
  return { appToken, userToken, configured: Boolean(appToken && userToken) };
}

function authorized(req: Request): boolean {
  const expected = process.env.WEALTH_PERSONAL_KEY?.trim();
  if (process.env.NODE_ENV !== 'production' && !expected) return true;
  if (!expected) return false;
  const got = req.headers.get('x-wealth-key')?.trim() ?? '';
  return got.length > 0 && got === expected;
}

export async function GET() {
  const { configured } = tokens();
  const needsKey = process.env.NODE_ENV === 'production' || Boolean(process.env.WEALTH_PERSONAL_KEY);
  return NextResponse.json({
    configured,
    needsKey,
    ready: configured && (process.env.NODE_ENV !== 'production' || Boolean(process.env.WEALTH_PERSONAL_KEY)),
  });
}

export async function POST(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json(
      {
        error:
          'Akahu sync is locked on this host. Use .env.local on your machine, or set WEALTH_PERSONAL_KEY so a public deploy cannot read your banks.',
      },
      { status: 403 },
    );
  }

  const { appToken, userToken, configured } = tokens();
  if (!configured) {
    return NextResponse.json(
      {
        error:
          'Create a Personal App at my.akahu.nz/developers (free, your accounts only). Put AKAHU_APP_TOKEN and AKAHU_USER_TOKEN in .env.local. Never paste them in the UI.',
      },
      { status: 501 },
    );
  }

  const res = await fetch('https://api.akahu.io/v1/accounts', {
    cache: 'no-store',
    headers: {
      Authorization: `Bearer ${userToken}`,
      'X-Akahu-Id': appToken,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: `Akahu returned ${res.status}. Check tokens and that a bank is connected in my.akahu.nz.` },
      { status: 502 },
    );
  }

  const payload = (await res.json()) as AkahuAccountsResponse;
  const mapped = mapAkahuAccounts(payload);
  return NextResponse.json({
    connections: mapped.connections,
    accounts: mapped.accounts,
    count: mapped.accounts.length,
  });
}
