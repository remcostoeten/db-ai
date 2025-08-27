ALTER TABLE "user" ADD COLUMN "role" text DEFAULT 'regular' NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "last_sign_in_at" timestamp;