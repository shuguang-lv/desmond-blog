/* eslint-disable no-constant-condition */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { Toaster, toast } from 'react-hot-toast'
import { useTheme } from 'next-themes'
import LoadingDots from '@/components/LoadingDots'
import ResizablePanel from '@/components/ResizablePanel'

export default function ChatGPT() {
  const [loading, setLoading] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [completion, setCompletion] = useState('')
  const { theme } = useTheme()

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

    while (true) {
      const { value, done } = await reader.read()
      if (done) {
        break
      }
      const chunkValue = decoder.decode(value)
      setCompletion((prev) => chunkValue)
    }

    setLoading(false)
  }

  return (
    <div className="flex flex-col">
      <Toaster position="top-center" reverseOrder={false} toastOptions={{ duration: 2000 }} />

      <div className="space-y-2 md:space-y-5">
        <div className="divider"></div>
        <h1 className="md:leading-14 text-3xl font-extrabold leading-9 tracking-tight sm:text-4xl sm:leading-10 md:text-6xl">
          ChatGPT
        </h1>
        <p className="text-lg leading-7">Generate your answer in seconds</p>
        <div className="divider"></div>
      </div>

      <main className="flex w-full flex-1 flex-col items-center justify-center px-4 text-center">
        <div className="container flex w-full max-w-xl flex-col items-center py-8 md:py-16">
          <div className="flex items-center space-x-3">
            <p className="text-center text-lg font-medium">Make your prompt below</p>
          </div>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            className="textarea-bordered textarea my-5 w-full border-2 shadow-md"
            placeholder={'e.g. How to be a programmer?'}
          />
          <div className="mt-4 flex items-center">
            <button
              className={`btn mr-8 border-2 ${loading && 'loading'}`}
              onClick={(e) => generate(e)}
            >
              Generate your answer
            </button>
            <button className="btn-outline btn border-2" onClick={() => setPrompt('')}>
              Clear your prompt
            </button>
          </div>
        </div>

        <ResizablePanel>
          <AnimatePresence mode="wait">
            <motion.div className="my-2 space-y-10">
              {completion && (
                <>
                  <div className="mx-auto flex max-w-xl flex-col items-center justify-center space-y-8">
                    <kbd
                      className="kbd cursor-copy p-4 shadow-md transition"
                      onClick={() => {
                        navigator.clipboard.writeText(completion)
                        toast('Answer copied to clipboard', {
                          icon: '✂️',
                        })
                      }}
                      key={completion}
                    >
                      {' '}
                      <p>{completion}</p>
                    </kbd>
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </ResizablePanel>
      </main>
    </div>
  )
}
