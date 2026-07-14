CREATE TABLE IF NOT EXISTS "SmokeTest" (
	"id" text PRIMARY KEY NOT NULL,
	"message" text NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL
);
