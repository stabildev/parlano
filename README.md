# Chat with your PDFs!

> Originally inspired by the SaaS tutorial by Josh tried coding on YT: https://www.youtube.com/watch?v=ucX2zXAZ1I0

## Prerequisites

This project uses the following services:

- [Unkey](https://unkey.dev)
- [Clerk](https://clerk.dev)
- [Stripe](https://stripe.com)
- [Cloudflare](https://cloudflare.com)
- [OpenAI](https://openai.com)
- [Planetscale](https://planetscale.com)
- [Pinecone](https://pinecone.io)
- [Uploadthing](https://uploadthing.com)
- [Vercel](https://vercel.com) (optional)

## Architecture

This project is a monorepo (using [Turborepo](https://turbo.build)) that contains the following:

- A [Nextjs](https://nextjs.org) fullstack app
- Two [Cloudflare Workers](https://workers.cloudflare.com)
  - A worker that handles and authenticates requests to OpenAI. Called by the frontend. Communicates with OpenAI, Unkey, Clerk, and the backend.
  - A worker that integrates Clerk and Unkey. Called by Clerk webhooks on user creation and update.

## Installation

1. Clone the repo
2. Set up Clerk
3. Set up Unkey
4. Set up Stripe, create a product and a price, and set up a webhook for the product
5. Set up Cloudflare and Wrangler CLI
6. Set up OpenAI
7. Generate a secret key for your backend
8. Set up the required environment variables in .dev.vars.example for each worker using `npx wrangler secret put <VARIABLE>`
9. Deploy the workers using `npx wrangler deploy`
10. Set up the required environment variables in .env.example for the Nextjs project
11. Create a webhook in Clerk that calls the `post-signup-worker` worker
12. Deploy the project and set all the environment variables in Vercel

## Changelog

- Implemente API rate limiting w/ Unkey
- Switched to Turborepo for cloudflare worker
- Switched to Clerk
- Improved prompt
- Fixed serverless function timeout by routing openai requests through cloudflare worker
- Fixed mobile uploads
- Implemented file deletion
- Fixed uploadthing urls
- Tabbed chat layout on mobile
- Dark Mode
- Fixed Pinecone
- Migrated to React Query 5

## To do

- Propagate stripe renewal to Unkey & Clerk
- Optimize code and env var sharing within monorepo
- Handle Uploadthing timeouts gracefully
- Fix a layout issue in chat view
- Remove Pinecone dependency
