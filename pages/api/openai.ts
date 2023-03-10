// import { Configuration, OpenAIApi } from 'openai'
// import { ChatGPTAPI } from 'chatgpt'
import { createParser, ParsedEvent, ReconnectInterval } from 'eventsource-parser'
// import { NextApiRequest, NextApiResponse } from 'next'

if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
  throw new Error('Missing env var from OpenAI')
}

export const config = {
  runtime: 'edge',
}

// const api = new ChatGPTAPI({
//   apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
// })
// const configuration = new Configuration({
//   apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
// })
// const openai = new OpenAIApi(configuration)

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
  stop?: string
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
  // const { prompt } = req.body

  if (!prompt) {
    return new Response('No prompt in the request', { status: 400 })
    // res.status(400).json({ message: 'No prompt in the request' })
  }

  const payload: OpenAIStreamPayload = {
    model: 'text-davinci-003',
    prompt,
    temperature: 0.8,
    top_p: 1.0,
    presence_penalty: 1.0,
    max_tokens: 1000,
    stream: true,
  }

  try {
    const stream = await handleStream(payload)
    return new Response(stream)
    // const encoder = new TextEncoder()
    // const readable = new ReadableStream({
    //   async start(controller) {
    //     await api.sendMessage(payload.prompt, {
    //       onProgress: (partialResponse) => {
    //         controller.enqueue(encoder.encode(partialResponse.text))
    //       },
    //       timeoutMs: 2 * 60 * 1000,
    //     })
    //     controller.close()
    //   },
    // })
    // api
    //   .sendMessage(payload.prompt, {
    //     onProgress: (partialResponse) => {
    //       res.write(encoder.encode(partialResponse.text))
    //       res.status(200)
    //     },
    //     timeoutMs: 2 * 60 * 1000,
    //   })
    //   .then(() => res.end())
    // res.status(200).json(readable)
  } catch (error) {
    return new Response('Failed to received answers', { status: 500 })
    // res.status(500).json({ message: 'Failed to received answers' })
  }
}

export default handler
