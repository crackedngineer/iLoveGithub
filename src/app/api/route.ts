import { NextRequest } from 'next/server';

// Reference :- https://nextjs.org/blog/building-apis-with-nextjs

export function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');

    return new Response(
        JSON.stringify({ result: `You searched for: ${query}` }),
        {
            headers: { 'Content-Type': 'application/json' },
        },
    );
}