import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { task, user_identifier } = await request.json();

  const n8nWebhookUrl =
    process.env.NODE_ENV === 'production'
      ? process.env.N8N_WEBHOOK_URL_PROD
      : process.env.N8N_WEBHOOK_URL_TEST;

  if (!n8nWebhookUrl) {
    return NextResponse.json(
      { error: 'N8N_WEBHOOK_URL is not configured in environment variables.' },
      { status: 500 }
    );
  }

  try {
    const url = new URL(n8nWebhookUrl);
    url.searchParams.append('task', task);
    url.searchParams.append('user_identifier', user_identifier);

    const n8nResponse = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ task, user_identifier }),
    });

    if (!n8nResponse.ok) {
      const errorBody = await n8nResponse.text();
      console.error('N8N workflow execution error:', errorBody);
      return NextResponse.json(
        { error: 'The N8N workflow returned an error.' },
        { status: n8nResponse.status }
      );
    }

    const responseData = await n8nResponse.json();

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error('Error forwarding request to N8N:', error);
    return NextResponse.json(
      { error: 'Failed to connect to the N8N workflow.' },
      { status: 500 }
    );
  }
}
