import { protectedProcedure, publicProcedure } from "../lib/orpc";
import { db } from "../db";
import { user } from "../db/schema/auth";
import { eq } from "drizzle-orm";
import { find } from "../lib/dal";
export const userRouter = {
  getRole: protectedProcedure.handler(async ({ context }) => {
    if (!context.session?.user?.id) {
      return null;
    }
    const userData = await find<{ role: string | null }>(db, user, {
      columns: { role: user.role },
      where: eq(user.id, context.session.user.id),
      limit: 1,
    });

    return userData[0]?.role || null;
  }),
};