import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { code, refresh_token } = await request.json();

    const clientId = process.env.STRAVA_CLIENT_ID;
    const clientSecret = process.env.STRAVA_CLIENT_SECRET;
    
    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: 'Strava client credentials not configured' },
        { status: 500 }
      );
    }

    let url = 'https://www.strava.com/oauth/token?';
    
    if (code) {
      // Initial authorization
      url += `client_id=${clientId}&client_secret=${clientSecret}&code=${code}&grant_type=authorization_code`;
    } else if (refresh_token) {
      // Token refresh
      url += `client_id=${clientId}&client_secret=${clientSecret}&refresh_token=${refresh_token}&grant_type=refresh_token`;
    } else {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const response = await fetch(url, { method: 'POST' });
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || 'Failed to authenticate with Strava' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Strava token error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Authentication failed' },
      { status: 500 }
    );
  }
}

// Add this to ensure only POST method is allowed
export async function GET() {
  return NextResponse.json(
    { error: 'Method Not Allowed' },
    { status: 405, headers: { 'Allow': 'POST' } }
  );
}