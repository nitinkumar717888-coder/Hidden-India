ALTER TABLE "destination_images" ADD COLUMN "license_url" text;--> statement-breakpoint
ALTER TABLE "destination_images" ADD COLUMN "source" varchar(255);--> statement-breakpoint
ALTER TABLE "destination_images" ADD COLUMN "source_url" text;--> statement-breakpoint
ALTER TABLE "destination_images" ADD COLUMN "original_file_url" text;--> statement-breakpoint
ALTER TABLE "destination_images" ADD COLUMN "photographer" varchar(255);--> statement-breakpoint
ALTER TABLE "destination_images" ADD COLUMN "capture_date" varchar(100);--> statement-breakpoint
ALTER TABLE "destination_images" ADD COLUMN "attribution" text;--> statement-breakpoint
ALTER TABLE "destination_images" ADD COLUMN "accessed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "destination_images" ADD COLUMN "modification_notes" text;--> statement-breakpoint
ALTER TABLE "destination_images" ADD COLUMN "role" varchar(50) DEFAULT 'hero';--> statement-breakpoint
ALTER TABLE "destination_images" ADD COLUMN "editorial_status" varchar(50) DEFAULT 'PENDING_PHOTOGRAPHY';--> statement-breakpoint
ALTER TABLE "destination_images" ADD COLUMN "requires_editorial_replacement" boolean DEFAULT true;