/* eslint-disable import/no-anonymous-default-export */

function handleOptions(request) {
  let headers = request.headers

  // Make sure the necessary headers are present for this to be a valid preflight request
  if (
    headers.get('Origin') !== null &&
    headers.get('Access-Control-Request-Method') !== null
  ) {
    // Handle CORS preflight request
    let respHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': headers.get(
        'Access-Control-Request-Headers'
      ),
    }

    return new Response(null, {
      headers: respHeaders,
    })
  } else {
    // Handle standard OPTIONS request
    return new Response(null, {
      headers: {
        Allow: 'GET, POST, HEAD, OPTIONS',
      },
    })
  }
}

export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight request
    if (request.method === 'OPTIONS') {
      return handleOptions(request)
    }

    // 1) Extract session and request body
    try {
      const body = await request.json()
      const { message, fileId, sessionId, token } = body

      if (!sessionId || !token) {
        return new Response('Unauthorized', { status: 401 })
      }

      if (!message || !fileId) {
        return new Response('Invalid data', { status: 400 })
      }

      const headers = {
        Authorization: `Bearer ${env.PARLANO_CLOUDWORKER_SECRET}`,
        'Content-Type': 'application/json',
      }

      // Request prompt from backend
      const response = await fetch(`${env.NEXT_PUBLIC_URL}/api/message`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message,
          fileId,
          sessionId,
          token,
        }),
      })

      if (!response.ok) {
        return new Response('Request failed', { status: response.status })
      }

      // 2) Extract prompt messages from response
      try {
        const data = await response.json()
        const { messages } = data

        // 3) OpenAI request
        const url = 'https://api.openai.com/v1/chat/completions'
        const openAIHeaders = {
          Authorization: `Bearer ${env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        }
        const body = JSON.stringify({
          model: 'gpt-3.5-turbo',
          temperature: 0,
          stream: true,
          messages,
        })

        const openAIResponse = await fetch(url, {
          method: 'POST',
          headers: openAIHeaders,
          body: body,
        })

        // Stream handling
        const { readable, writable } = new TransformStream()
        const writer = writable.getWriter()

        const reader = openAIResponse.body.getReader()
        let buffer = ''
        let completeMessage = ''

        ;(async function readAndForward() {
          while (true) {
            const { value, done } = await reader.read()
            if (done) {
              // After stream ends, send complete message to backend to save in db
              await fetch(`${env.NEXT_PUBLIC_URL}/api/post-stream`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                  message: completeMessage,
                  fileId,
                  sessionId,
                  token,
                }),
              })
              break
            }
            const valueDecoded = new TextDecoder().decode(value)
            buffer += valueDecoded

            // if value contains message chunk add it to the message
            const startOfJson =
              buffer.indexOf('data: ') !== -1
                ? buffer.indexOf('data: ') + 6
                : -1
            if (startOfJson !== -1) {
              const endOfJson = buffer.indexOf('\n', startOfJson)

              if (endOfJson !== -1) {
                const jsonPart = buffer.substring(startOfJson, endOfJson)
                buffer = buffer.substring(endOfJson + 1)

                try {
                  const valueJson = JSON.parse(jsonPart)
                  // Extract message content
                  const messageChunk =
                    valueJson?.choices
                      ?.map((choice) => choice.delta?.content)
                      .join('') ?? ''
                  completeMessage += messageChunk
                  //await writer.write(messageChunk);
                } catch (error) {
                  // Handle potential JSON parse error
                  console.error('Error parsing JSON:', error)
                }
              }
            }

            await writer.write(value)
          }
          writer.close()
        })()

        // 4) Stream to client
        const corsHeaders = {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': '*',
        }

        const streamResponse = new Response(readable, {
          status: openAIResponse.status,
          statusText: openAIResponse.statusText,
          headers: corsHeaders,
        })

        return streamResponse
      } catch (error) {
        console.error(error)
        return new Response('Internal server error', { status: 500 })
      }
    } catch (error) {
      return new Response('Bad request', { status: 400 })
    }
  },
}
