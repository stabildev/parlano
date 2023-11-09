import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'

import { privateProcedure, publicProcedure, router } from './trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { INFINITE_QUERY_LIMIT } from '@/config/infinite-query'

import { $Enums } from '@prisma/client'
import { db } from '@/db'

import { getUserSubscriptionPlan, stripe } from '@/lib/stripe'
import { PLANS } from '@/config/stripe'
import { utapi } from '@/server/utapi'

export const appRouter = router({
  authCallback: publicProcedure.query(async () => {
    const { getUser } = getKindeServerSession()
    const user = await getUser()

    if (!user?.id || !user.email) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Unauthorized',
      })
    }

    // check if user is in db
    const dbUser = await db.user.findUnique({
      where: {
        id: user.id,
      },
    })

    if (!dbUser) {
      // create db user
      await db.user.create({
        data: {
          id: user.id,
          email: user.email,
        },
      })
    }

    return {
      success: true,
    }
  }),

  getUserFiles: privateProcedure.query(async ({ ctx }) => {
    const files = await db.file.findMany({
      where: {
        userId: ctx.userId,
      },
      include: {
        _count: {
          select: {
            messages: true,
          },
        },
      },
    })

    return files
  }),

  getFile: privateProcedure
    .input(z.object({ key: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const file = await db.file.findFirst({
        where: {
          key: input.key,
          userId: ctx.userId,
        },
      })

      if (!file) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'File not found',
        })
      }

      return file
    }),

  getFileUploadStatus: privateProcedure
    .input(
      z.object({
        fileId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const file = await db.file.findFirst({
        where: {
          id: input.fileId,
          userId: ctx.userId,
        },
      })

      if (!file) {
        return $Enums.UploadStatus.PENDING
      }

      return file.uploadStatus
    }),

  deleteFile: privateProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const file = await db.file.findFirst({
        where: {
          id: input.id,
          userId: ctx.userId,
        },
      })

      if (!file) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'File not found',
        })
      }

      // delete from uploadthing
      const deleted = await utapi.deleteFiles(file.key)

      if (!deleted) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete file from server',
        })
      }

      await db.file.delete({
        where: {
          id: input.id,
        },
      })

      return file
    }),

  getFileMessages: privateProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(),
        fileId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { userId } = ctx
      const { cursor, fileId } = input
      const limit = input.limit ?? INFINITE_QUERY_LIMIT

      const file = await db.file.findUnique({
        where: {
          id: fileId,
          userId,
        },
      })

      if (!file) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'File not found',
        })
      }

      const messages = await db.message.findMany({
        where: {
          fileId,
          userId,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        select: {
          id: true,
          isUserMessage: true,
          createdAt: true,
          text: true,
        },
      })

      const nextCursor = messages.length > limit ? messages.pop()?.id : null

      return {
        messages,
        nextCursor,
      }
    }),

  createStripeSession: privateProcedure.mutation(async ({ ctx }) => {
    const { userId } = ctx

    const billingUrl = `${process.env.NEXT_PUBLIC_URL}/dashboard/billing`

    if (!userId) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Unauthorized',
      })
    }

    const dbUser = await db.user.findUnique({
      where: {
        id: userId,
      },
    })

    if (!dbUser) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User not found',
      })
    }

    const subscriptionPlan = await getUserSubscriptionPlan()

    if (subscriptionPlan.isSubscribed && dbUser.stripeCustomerId) {
      const stripeSession = await stripe.billingPortal.sessions.create({
        customer: dbUser.stripeCustomerId,
        return_url: billingUrl,
      })

      return { url: stripeSession.url }
    }

    const stripeSession = await stripe.checkout.sessions.create({
      success_url: billingUrl,
      cancel_url: billingUrl,
      payment_method_types: ['card', 'paypal'],
      mode: 'subscription',
      billing_address_collection: 'auto',
      line_items: [
        {
          price: PLANS.find((plan) => plan.name === 'Pro')?.price.priceIds.test,
          quantity: 1,
        },
      ],
      metadata: {
        userId,
      },
    })

    return { url: stripeSession.url }
  }),
})
export type AppRouter = typeof appRouter
