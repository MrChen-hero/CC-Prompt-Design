/**
 * Vercel Serverless Function - Anthropic API Proxy
 *
 * 代理前端请求到 Anthropic API，解决 CORS 问题
 */

export const config = {
  runtime: 'edge',
}

export default async function handler(request: Request) {
  // 只允许 POST 请求
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    // 获取请求头中的 API Key
    const apiKey = request.headers.get('x-api-key')

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: { message: 'API Key is required', type: 'auth_error' } }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // 获取请求体
    const body = await request.json()

    // 转发请求到 Anthropic API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    })

    // 检查是否为流式响应
    const isStream = body.stream === true

    if (isStream) {
      // 流式响应：直接透传
      return new Response(response.body, {
        status: response.status,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      })
    } else {
      // 非流式响应
      const data = await response.json()

      return new Response(JSON.stringify(data), {
        status: response.status,
        headers: {
          'Content-Type': 'application/json',
        },
      })
    }
  } catch (error) {
    console.error('Anthropic proxy error:', error)

    return new Response(
      JSON.stringify({
        error: {
          message: error instanceof Error ? error.message : 'Internal server error',
          type: 'proxy_error',
        },
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
