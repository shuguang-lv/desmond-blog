import { Configuration, OpenAIApi } from 'openai'
import { createParser, ParsedEvent, ReconnectInterval } from 'eventsource-parser'

if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
  throw new Error('Missing env var from OpenAI')
}

export const config = {
  runtime: 'edge',
}

const configuration = new Configuration({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
})
const openai = new OpenAIApi(configuration)

export interface OpenAIStreamPayload {
  model: string
  prompt: string
  suffix?: string
  max_tokens?: number
  temperature?: number
  top_p?: number
  n?: number
  stream?: boolean
  frequency_penalty?: number
  presence_penalty?: number
}

const handleStream = async (payload: OpenAIStreamPayload) => {
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()
  let counter = 0
  // const res = await openai.createCompletion(payload, { responseType: 'stream' })
  const res = await fetch('https://api.openai.com/v1/completions', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY ?? ''}`,
    },
    method: 'POST',
    body: JSON.stringify(payload),
  })

  const stream = new ReadableStream({
    async start(controller) {
      function onParse(event: ParsedEvent | ReconnectInterval) {
        if (event.type === 'event') {
          const data = event.data
          if (data === '[DONE]') {
            controller.close()
            return
          }
          try {
            const json = JSON.parse(data)
            const text = json.choices[0].text
            if (counter < 2 && (text.match(/\n/) || []).length) {
              // this is a prefix character (i.e., "\n\n"), do nothing
              return
            }
            const queue = encoder.encode(text)
            controller.enqueue(queue)
            counter++
          } catch (e) {
            controller.error(e)
          }
        }
      }

      // stream response (SSE) from OpenAI may be fragmented into multiple chunks
      // this ensures we properly read chunks and invoke an event for each SSE event stream
      const parser = createParser(onParse)
      // https://web.dev/streams/#asynchronous-iteration
      for await (const chunk of res.body as any) {
        parser.feed(decoder.decode(chunk))
      }
    },
  })

  return stream
}

const handler = async (req: Request): Promise<Response> => {
  const { prompt } = (await req.json()) as {
    prompt?: string
  }

  if (!prompt) {
    return new Response('No prompt in the request', { status: 400 })
  }

  const payload = {
    model: 'text-davinci-003',
    prompt,
    temperature: 0.2,
    max_tokens: 2048,
    stream: true,
  }

  const stream = await handleStream(payload)
  return new Response(stream)
}

export default handler
