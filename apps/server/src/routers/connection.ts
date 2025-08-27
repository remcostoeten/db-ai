import { ORPCError } from '@orpc/server';
import { eq, and } from 'drizzle-orm';
import z from 'zod';
import { db } from '../db';
import { connections } from '../db/schema/connections';
import { protectedProcedure } from '../lib/orpc';
import { create, find, update, destroy } from '../lib/dal';
import { generateId } from 'better-auth';

export const connectionRouter = {
	create: protectedProcedure
		.input(
			z.object({
				type: z.string().min(1, 'Type is required'),
				name: z.string().min(1, 'Name is required'),
				url: z.string().min(1, 'URL is required'),
				authToken: z.string().default(''),
				description: z.string().default(''),
				color: z.string().default(''),
			})
		)
		.handler(async ({ input, context }) => {
			console.log('Connection create input:', JSON.stringify(input, null, 2));
			console.log('User ID:', context.session!.user.id);
			
			const connectionData = {
				id: generateId(),
				...input,
				user_id: context.session!.user.id,
			};
			
			console.log('Connection data to insert:', JSON.stringify(connectionData, null, 2));
			
			const result = await create(db, connections, connectionData);

			return result[0];
		}),

	getAll: protectedProcedure.handler(async ({ context }) => {
		return await find(db, connections, {
			where: eq(connections.user_id, context.session!.user.id),
		});
	}),

	getById: protectedProcedure
		.input(z.object({ id: z.string() }))
		.handler(async ({ input, context }) => {
			const result = await find(db, connections, {
				where: and(
					eq(connections.id, input.id),
					eq(connections.user_id, context.session!.user.id)
				),
				limit: 1,
			});

			if (!result[0]) {
				throw new ORPCError('NOT_FOUND');
			}

			return result[0];
		}),

	update: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				type: z.string().optional(),
				name: z.string().optional(),
				url: z.string().url().optional(),
				authToken: z.string().optional(),
				description: z.string().optional(),
				color: z.string().optional(),
			})
		)
		.handler(async ({ input, context }) => {
			const { id, ...updateData } = input;

			const result = await update(
				db,
				connections,
				id,
				updateData,
				eq(connections.user_id, context.session!.user.id)
			);

			if (!result) {
				throw new ORPCError('NOT_FOUND');
			}

			return result;
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.handler(async ({ input, context }) => {
			const result = await destroy(
				db,
				connections,
				input.id,
				eq(connections.user_id, context.session!.user.id)
			);

			if (!result) {
				throw new ORPCError('NOT_FOUND');
			}

			return result;
		}),
};
