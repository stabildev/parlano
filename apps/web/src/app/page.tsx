import { HoverShine } from '../components/HoverShine'
import MaxWidthWrapper from '../components/MaxWidthWrapper'
import { buttonVariants } from '../components/ui/button'
import { ArrowRightIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  return (
    <>
      <MaxWidthWrapper className="mb-12 mt-28 flex flex-col items-center justify-center text-center sm:mt-40">
        <div className="border-border from-border/25 to-border hover:bg-border dark:border-border/10 dark:hover:border-border/50 group relative mx-auto mb-4 cursor-default rounded-full border bg-gradient-to-b px-5 py-1.5 shadow transition-all">
          <div className="absolute -inset-2 hidden bg-gradient-to-r from-violet-600 to-rose-600 opacity-40 blur-2xl dark:block" />
          <p className="text-sm font-medium text-zinc-600 transition-colors group-hover:text-zinc-800 dark:text-zinc-400 dark:group-hover:text-zinc-200">
            parlano is now public!
          </p>
        </div>
        <h1 className="max-w-4xl text-5xl font-bold md:text-6xl lg:text-7xl">
          Chat with your{' '}
          <span className="bg-gradient-to-r from-violet-600 to-rose-600 bg-clip-text text-transparent">
            documents
          </span>{' '}
          in seconds.
        </h1>
        <p className="mt-5 max-w-prose text-zinc-700 dark:text-zinc-400 sm:text-lg">
          Parlano allows you to have conversations with any PDF document. Simply
          upload your file and start asking questions right away.
        </p>
        <HoverShine className="mt-5">
          <Link
            className={buttonVariants({
              size: 'lg',
              variant: 'secondary',
              className: 'bg-gradient-to-r from-violet-600 to-rose-600 shadow',
            })}
            href="/dashboard"
            target="_blank"
          >
            Get started <ArrowRightIcon className="ml-2 h-5 w-5" />
          </Link>
        </HoverShine>
      </MaxWidthWrapper>

      {/* Value proposition section */}
      <div>
        <div className="relative">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
          >
            <div
              style={{
                clipPath:
                  'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
              }}
              className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-violet-600 to-rose-600 opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            />
          </div>

          <div>
            <div className="mx-auto max-w-6xl px-6 lg:px-8">
              <div className="mt-16 flow-root sm:mt-24">
                <div className="-m-2 rounded-xl bg-zinc-900/5 p-2 ring-1 ring-inset ring-zinc-900/10 dark:bg-white/10 dark:ring-white/20 lg:-m-4 lg:rounded-2xl lg:p-4">
                  <Image
                    src="/dashboard-preview.jpg"
                    alt="product preview"
                    priority
                    width={1364}
                    height={866}
                    quality={100}
                    className="rounded-md bg-white p-2 shadow-2xl ring-1 ring-zinc-900/10 sm:p-8 md:p-20"
                  />
                </div>
              </div>
            </div>
          </div>

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
          >
            <div
              style={{
                clipPath:
                  'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
              }}
              className="relative left-[calc(50%-13rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-violet-600 to-rose-600 opacity-20 sm:left-[calc(50%-36rem)] sm:w-[72.1875rem]"
            />
          </div>
        </div>
      </div>

      {/* Feature section */}
      <div className="max-w5xl mx-auto mb-32 mt-32 w-[calc(100%-1rem)] max-w-5xl sm:mt-56 sm:w-[calc(100%-3rem)]">
        <div className="mb-12 px-6 lg:px-8">
          <div className="mx-auto max-w-2xl sm:text-center">
            <h2 className="mt-2 py-2 text-4xl font-bold sm:text-5xl">
              <span className="bg-gradient-to-r from-violet-600 to-rose-600 bg-clip-text text-transparent">
                Start chatting
              </span>{' '}
              in minutes
            </h2>
            <p className="mt-4 text-lg text-zinc-700 dark:text-zinc-400 ">
              Chatting to PDF files has never been easier than with Parlano.
            </p>
          </div>
        </div>

        {/* Steps */}
        <ol className="my-8 space-y-4 pt-8 md:flex md:space-x-12 md:space-y-0">
          <li className="md:flex-1">
            <div className="flex flex-col space-y-2 border-l-4 border-zinc-300 py-2 pl-4 dark:border-zinc-800 md:border-l-0 md:border-t-2 md:pb-0 md:pl-0 md:pt-4">
              <span className="text-sml font-medium text-rose-400">Step 1</span>
              <span className="text-xl font-semibold">
                Sign up for an account
              </span>
              <span className="mt-2 text-zinc-700 dark:text-zinc-500">
                Either starting out with a free plan or choose our{' '}
                <Link
                  href="/pricing"
                  className="text-rose-400 underline underline-offset-2"
                >
                  pro plan
                </Link>
                .
              </span>
            </div>
          </li>
          <li className="md:flex-1">
            <div className="flex flex-col space-y-2 border-l-4 border-zinc-300 py-2 pl-4 dark:border-zinc-800 md:border-l-0 md:border-t-2 md:pb-0 md:pl-0 md:pt-4">
              <span className="text-sml font-medium text-rose-400">Step 2</span>
              <span className="text-xl font-semibold">
                Upload your PDF file
              </span>
              <span className="mt-2 text-zinc-700 dark:text-zinc-500">
                We&apos;ll process your file and make it ready for you to chat
                with.
              </span>
            </div>
          </li>
          <li className="md:flex-1">
            <div className="flex flex-col space-y-2 border-l-4 border-zinc-300 py-2 pl-4 dark:border-zinc-800 md:border-l-0 md:border-t-2 md:pb-0 md:pl-0 md:pt-4">
              <span className="text-sml font-medium text-rose-400">Step 3</span>
              <span className="text-xl font-semibold">
                Start asking questions
              </span>
              <span className="mt-2 text-zinc-700 dark:text-zinc-500">
                It&apos;s that simple. Try out Parlano today – it really takes
                less than a minute.
              </span>
            </div>
          </li>
        </ol>

        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="mt-16 flow-root sm:mt-24">
            <div className="-m-2 rounded-xl bg-zinc-900/5 p-2 ring-1 ring-inset ring-zinc-900/10 dark:bg-white/10 dark:ring-white/20 lg:-m-4 lg:rounded-2xl lg:p-4">
              <Image
                src="/file-upload-preview.jpg"
                alt="uploading preview"
                width={1419}
                height={732}
                quality={100}
                className="rounded-md bg-white p-2 shadow-2xl ring-1 ring-zinc-900/10 sm:p-8 md:p-20"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
