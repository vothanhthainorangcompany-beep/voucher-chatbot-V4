export async function POST(req) {
  try {
    const body = await req.json();

    const appsScriptUrl =
      'https://script.google.com/macros/s/AKfycbwMOqvecrCR7XXg-14Xwy46rwTfKddaIBZSah1Zaek-kqxMf5ebhBzStnhrLPfhOsOr/exec';

    const response = await fetch(appsScriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    const text = await response.text();

    if (!response.ok) {
      return Response.json(
        {
          ok: false,
          message: `Apps Script lỗi HTTP ${response.status}`,
          raw: text,
        },
        { status: 500 }
      );
    }

    try {
      const parsed = JSON.parse(text);
      return Response.json(parsed);
    } catch {
      return Response.json({
        ok: false,
        message: text || 'Không đọc được phản hồi từ Apps Script.',
      });
    }
  } catch (error) {
    return Response.json(
      {
        ok: false,
        message: error?.message || 'Proxy error',
      },
      { status: 500 }
    );
  }
}