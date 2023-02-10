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

    const response = await fetch('/api/openai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
      }),
    })

    if (!response.ok) {
      // throw new Error(response.statusText)
      toast(response.statusText)
      setLoading(false)
      return
    }

    const data = response.body
    if (!data) {
      return ''
    }

    let done = false
    const reader = data.getReader()
    const decoder = new TextDecoder()

    while (!done) {
      const { value, done: doneReading } = await reader.read()
      done = doneReading
      const chunkValue = decoder.decode(value)
      setCompletion((prev) => prev + chunkValue)
    }

    setLoading(false)
  }

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      <Toaster position="top-center" reverseOrder={false} toastOptions={{ duration: 2000 }} />

      <div className="space-y-2 pt-6 pb-8 md:space-y-5">
        <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
          ChatGPT
        </h1>
        <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">
          Generate your answer in seconds
        </p>
      </div>

      <main className="flex w-full flex-1 flex-col items-center justify-center px-4 text-center">
        <div className="container flex w-full max-w-xl flex-col items-center py-12">
          <div className="mt-10 flex items-center space-x-3">
            <p className="text-center text-lg font-medium">Make your prompt below</p>
          </div>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            className="my-5 w-full rounded-md shadow-sm focus:border-black focus:ring-black dark:bg-neutral-900 dark:focus:border-white dark:focus:ring-white"
            placeholder={'e.g. How to be a programmer?'}
          />
          <button
            className="mt-4 rounded-xl bg-black px-8 py-2 font-medium text-white hover:bg-black/80 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
            onClick={(e) => generate(e)}
          >
            {loading ? (
              <LoadingDots color={theme === 'dark' ? 'black' : 'white'} style="large" />
            ) : (
              <>Generate your answer &rarr;</>
            )}
          </button>
        </div>

        <ResizablePanel>
          <AnimatePresence mode="wait">
            <motion.div className="mb-2 space-y-10">
              {completion && (
                <>
                  <div className="mx-auto flex max-w-xl flex-col items-center justify-center space-y-8">
                    <div
                      className="cursor-copy rounded-xl border bg-white p-4 shadow-md transition hover:bg-gray-100 dark:bg-neutral-900 dark:hover:bg-gray-800"
                      onClick={() => {
                        navigator.clipboard.writeText(completion)
                        toast('Answer copied to clipboard', {
                          icon: '✂️',
                        })
                      }}
                      key={completion}
                    >
                      <p>{completion}</p>
                    </div>
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
