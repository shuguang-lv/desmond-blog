/* eslint-disable no-constant-condition */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { AnimatePresence, motion } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { Toaster, toast } from 'react-hot-toast'
import ResizablePanel from '@/components/ResizablePanel'
import LoadingDots from '@/components/LoadingDots'

export interface ChatResponse {
  text: string
  id: string
  conversationId: string
}

export default function ChatGPT() {
  const [loading, setLoading] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [completion, setCompletion] = useState('')
  const [messages, setMessages] = useState([])
  const [parentMessageId, setParentMessageId] = useState('')
  const [conversationId, setConversationId] = useState('')
  const pageEndRef = useRef(null)

  const scrollToBottom = () => {
    pageEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    setMessages((messages) =>
      messages.map((message, idx) => {
        if (idx === messages.length - 1 && message.type === 'ai') {
          message.content = completion
          return message
        } else {
          return message
        }
      })
    )
    scrollToBottom()
  }, [completion])

  const generate = async (e: any) => {
    e.preventDefault()
    setCompletion('')
    setLoading(true)

    let response
    try {
      response = await fetch(process.env.NEXT_PUBLIC_SERVER_URL + '/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: prompt,
          conversationId,
          parentMessageId,
        }),
      })
    } catch (error) {
      toast(error.message)
      setLoading(false)
      return
    }

    if (!response.ok) {
      // throw new Error(response.statusText)
      toast(response.statusText)
      setLoading(false)
      return
    }

    const data: ReadableStream = response.body
    if (!data) {
      setLoading(false)
      return
    }

    const reader = data.getReader()
    const decoder = new TextDecoder()

    do {
      const { value, done } = await reader.read()
      if (done) {
        break
      }
      const decodedValue = decoder.decode(value)
      try {
        const res: ChatResponse = JSON.parse(decodedValue)
        setConversationId(res.conversationId)
        setParentMessageId(res.id)
        setCompletion((prev) => res.text)
      } catch (error) {
        console.log(error.message)
      }
    } while (true)

    setLoading(false)
  }

  return (
    <div className="flex flex-col">
      <Toaster position="top-center" reverseOrder={false} toastOptions={{ duration: 2000 }} />
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={async (e) => {
          if (e.key === 'Enter' && e.shiftKey === false) {
            setMessages([
              ...messages,
              { type: 'human', content: prompt },
              { type: 'ai', content: '' },
            ])
            setPrompt('')
            generate(e)
          }
        }}
        rows={4}
        className="textarea-bordered textarea fixed bottom-5 z-50 m-5 w-10/12 border-2 text-lg shadow-xl md:w-1/2"
        placeholder={'Make your prompt here\ne.g. How to be a programmer?'}
      />

      <div className="space-y-2 md:space-y-5">
        <div className="divider"></div>
        <h1 className="md:leading-14 text-3xl font-extrabold leading-9 tracking-tight sm:text-4xl sm:leading-10 md:text-6xl">
          ChatGPT
        </h1>
        <p className="text-lg leading-7">Generate your answer in seconds</p>
        <div className="divider"></div>
      </div>

      <main className="flex w-full flex-1 flex-col items-center justify-center px-4 text-center">
        <div className="alert my-8 hidden w-4/5 shadow-lg md:block">
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="h-6 w-6 flex-shrink-0 stroke-info"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <span>
              You can talk to ChatGPT like talking to a real human. Just type your question in the
              text input at the bottom, hit <code className="text-info">Enter</code> and go!
            </span>
          </div>
        </div>

        <div className="flex w-full flex-col px-2">
          {messages.map((message, idx) => (
            <ResizablePanel key={idx}>
              <AnimatePresence mode="wait">
                <motion.div>
                  {message.type === 'human' ? (
                    <div className="chat chat-end w-full self-end">
                      <div className="chat-image avatar">
                        <div className="w-10 rounded-full">
                          <img src="https://api.dicebear.com/5.x/adventurer-neutral/svg?seed=you" />
                        </div>
                      </div>
                      <div className="chat-header">You</div>
                      <div className="chat-bubble chat-bubble-warning text-justify">
                        {message.content}
                      </div>
                    </div>
                  ) : (
                    <div className="chat chat-start w-full self-start">
                      <div className="chat-image avatar">
                        <div className="w-10 rounded-full">
                          <img src="https://api.dicebear.com/5.x/bottts-neutral/svg?seed=Aneka&backgroundColor=b6e3f4" />
                        </div>
                      </div>
                      <div className="chat-header">ChatGPT</div>
                      <div
                        className="chat-bubble chat-bubble-accent cursor-copy text-justify transition"
                        onClick={() => {
                          navigator.clipboard.writeText(message.content)
                          toast('Answer copied to clipboard', {
                            icon: '✂️',
                          })
                        }}
                      >
                        {loading && !completion && idx === messages.length - 1 ? (
                          <LoadingDots />
                        ) : (
                          message.content
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </ResizablePanel>
          ))}
        </div>

        <div ref={pageEndRef}></div>
      </main>
    </div>
  )
}
