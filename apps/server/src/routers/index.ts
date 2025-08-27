import type { RouterClient } from '@orpc/server';
import { protectedProcedure, publicProcedure } from '../lib/orpc';
import { adminRouter } from './admin';
import { todoRouter } from './todo';
import { userRouter } from './user';
import { connectionRouter } from './connection';

export const appRouter = {
	healthCheck: publicProcedure.handler(() => {
		return 'OK';
	}),
	privateData: protectedProcedure.handler(({ context }) => {
		return {
			message: 'This is private',
			user: context.session?.user,
		};
	}),
	todo: todoRouter,
	admin: adminRouter,
	user: userRouter,
	connection: connectionRouter,
};
export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
