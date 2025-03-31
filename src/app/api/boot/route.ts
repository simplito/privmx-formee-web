import { NextResponse } from 'next/server';
import { createFirstToken } from '@/lib/db/invite-tokens/inviteTokens';

export async function GET() {
    try {
        await createFirstToken();
        return NextResponse.json(
            { message: 'Ok' },
            {
                status: 200
            }
        );
    } catch (e) {
        console.error(e);
        return NextResponse.json({ token: '' });
    }
}

export const OPTIONS = async () => {
    return NextResponse.json(
        {},
        {
            status: 200
        }
    );
};

export const dynamic = 'force-dynamic';
