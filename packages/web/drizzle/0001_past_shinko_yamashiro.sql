CREATE TABLE IF NOT EXISTS "UpiTag" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"name" text NOT NULL,
	"color" text NOT NULL,
	"deletedAt" timestamp (3),
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "UpiTransaction" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"payeeVpa" text NOT NULL,
	"payeeName" text,
	"amountPaise" integer NOT NULL,
	"status" text NOT NULL,
	"origin" text NOT NULL,
	"note" text,
	"occurredAt" timestamp (3) NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) DEFAULT now() NOT NULL,
	CONSTRAINT "UpiTransaction_amountPaise_positive" CHECK ("UpiTransaction"."amountPaise" > 0),
	CONSTRAINT "UpiTransaction_status_enum" CHECK ("UpiTransaction"."status" in ('pending', 'success', 'failed', 'unconfirmed')),
	CONSTRAINT "UpiTransaction_origin_enum" CHECK ("UpiTransaction"."origin" in ('scanned', 'manual'))
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "UpiTransactionTag" (
	"id" text PRIMARY KEY NOT NULL,
	"transactionId" text NOT NULL,
	"tagId" text NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) DEFAULT now() NOT NULL,
	CONSTRAINT "UpiTransactionTag_transactionId_tagId_unique" UNIQUE("transactionId","tagId")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "UpiTransactionTag" ADD CONSTRAINT "UpiTransactionTag_transactionId_UpiTransaction_id_fk" FOREIGN KEY ("transactionId") REFERENCES "public"."UpiTransaction"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "UpiTransactionTag" ADD CONSTRAINT "UpiTransactionTag_tagId_UpiTag_id_fk" FOREIGN KEY ("tagId") REFERENCES "public"."UpiTag"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
