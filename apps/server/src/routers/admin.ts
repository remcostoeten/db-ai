import { ORPCError } from '@orpc/server';
import { and, asc, count, desc, eq, like } from 'drizzle-orm';
import z from 'zod';
import { db } from '../db';
import { session, user } from '../db/schema/auth';
import { protectedProcedure } from '../lib/orpc';
import { find, update } from '../lib/dal';

const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 50;
const RECENT_USERS_LIMIT = 5;

const adminProcedure = protectedProcedure.use(async ({ context, next }) => {
	if (!context.session?.user) {
		throw new ORPCError('UNAUTHORIZED');
	}

	const currentUser = await find(db, user, {
		where: eq(user.id, context.session.user.id),
		limit: 1,
	});

	if (!currentUser[0] || (currentUser[0] as any).role !== 'admin') {
		throw new ORPCError('FORBIDDEN');
	}

	return next({
		context: {
			...context,
			currentUser: currentUser[0] as any,
		},
	});
});

export const adminRouter = {
	getAllUsers: adminProcedure
		.input(
			z.object({
				sort: z
					.enum(['asc', 'desc', 'loginasc', 'logindesc'])
					.default('asc'),
				roles: z.enum(['all', 'admin', 'regular']).default('all'),
				search: z.string().optional(),
				limit: z.number().min(1).max(MAX_LIMIT).default(DEFAULT_LIMIT),
				offset: z.number().min(0).default(0),
			})
		)
		.handler(async ({ input }) => {
			const { sort, roles, search, limit, offset } = input;

			const whereConditions = [];
			if (roles !== 'all') {
				whereConditions.push(eq(user.role, roles));
			}
			if (search) {
				whereConditions.push(like(user.email, `%${search}%`));
			}

			let orderBy;
			switch (sort) {
				case 'desc':
					orderBy = desc(user.createdAt);
					break;
				case 'loginasc':
					orderBy = asc(user.lastSignInAt);
					break;
				case 'logindesc':
					orderBy = desc(user.lastSignInAt);
					break;
				default:
					orderBy = asc(user.createdAt);
			}

			return await find(db, user, {
				columns: {
					id: user.id,
					name: user.name,
					email: user.email,
					emailVerified: user.emailVerified,
					image: user.image,
					role: user.role,
					lastSignInAt: user.lastSignInAt,
					createdAt: user.createdAt,
					updatedAt: user.updatedAt,
				},
				where: whereConditions.length > 0 ? and(...whereConditions) : undefined,
				orderBy,
				limit,
				offset,
			});
		}),

	getUserCount: adminProcedure
		.input(
			z.object({
				role: z.enum(['admin', 'regular']).optional(),
			})
		)
		.handler(async ({ input }) => {
			if (input.role) {
				const result = await db
					.select({ count: count() })
					.from(user)
					.where(eq(user.role, input.role));
				return result[0]?.count || 0;
			} else {
				const result = await db.select({ count: count() }).from(user);
				return result[0]?.count || 0;
			}
		}),

	updateUserRole: adminProcedure
		.input(
			z.object({
				userId: z.string().min(1),
				role: z.enum(['admin', 'regular']),
			})
		)
		.handler(async ({ input, context }) => {
			const { userId, role } = input;

			if (userId === (context.currentUser as any).id && role !== 'admin') {
				throw new ORPCError('BAD_REQUEST');
			}

			const result = await update(db, user, userId, {
				role,
				updatedAt: new Date(),
			});

			if (!result) {
				throw new ORPCError('NOT_FOUND');
			}

			return result;
		}),

	getUserDetails: adminProcedure
		.input(
			z.object({
				userId: z.string().min(1),
			})
		)
		.handler(async ({ input }) => {
			const { userId } = input;

			const userDetails = await find(db, user, {
				columns: {
					id: user.id,
					name: user.name,
					email: user.email,
					emailVerified: user.emailVerified,
					image: user.image,
					role: user.role,
					lastSignInAt: user.lastSignInAt,
					createdAt: user.createdAt,
					updatedAt: user.updatedAt,
				},
				where: eq(user.id, userId),
				limit: 1,
			});

			if (!userDetails[0]) {
				throw new ORPCError('NOT_FOUND');
			}

			const userSessions = await find(db, session, {
				columns: {
					id: session.id,
					createdAt: session.createdAt,
					ipAddress: session.ipAddress,
					userAgent: session.userAgent,
					expiresAt: session.expiresAt,
				},
				where: eq(session.userId, userId),
				orderBy: desc(session.createdAt),
			});

			return {
				user: userDetails[0],
				sessions: userSessions,
			};
		}),

	getDashboardStats: adminProcedure.handler(async () => {
		const totalUsers = await db.select({ count: count() }).from(user);
		const adminUsers = await db
			.select({ count: count() })
			.from(user)
			.where(eq(user.role, 'admin'));
		const regularUsers = await db
			.select({ count: count() })
			.from(user)
			.where(eq(user.role, 'regular'));

		const recentUsers = await find(db, user, {
			columns: {
				id: user.id,
				name: user.name,
				email: user.email,
				role: user.role,
				createdAt: user.createdAt,
			},
			orderBy: desc(user.createdAt),
			limit: RECENT_USERS_LIMIT,
		});

		const activeSessions = await db
			.select({ count: count() })
			.from(session);

		return {
			totalUsers: totalUsers[0]?.count || 0,
			adminUsers: adminUsers[0]?.count || 0,
			regularUsers: regularUsers[0]?.count || 0,
			activeSessions: activeSessions[0]?.count || 0,
			recentUsers,
		};
	}),
};
