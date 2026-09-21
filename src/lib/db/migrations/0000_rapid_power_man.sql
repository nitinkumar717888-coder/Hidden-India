CREATE TYPE "public"."difficulty_level" AS ENUM('easy', 'moderate', 'challenging', 'strenuous');--> statement-breakpoint
CREATE TYPE "public"."editorial_status" AS ENUM('draft', 'researching', 'needs_review', 'verified', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."evidence_classification" AS ENUM('DOCUMENTED', 'LOCAL_TRADITION', 'DISPUTED', 'UNKNOWN');--> statement-breakpoint
CREATE TYPE "public"."source_type" AS ENUM('GOVERNMENT', 'ARCHAEOLOGICAL', 'ACADEMIC', 'MUSEUM', 'OFFICIAL_TOURISM', 'ARCHIVAL', 'NEWS', 'OTHER');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "destination_categories" (
	"destination_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	CONSTRAINT "destination_categories_destination_id_category_id_pk" PRIMARY KEY("destination_id","category_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "destination_evidence_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"destination_id" uuid NOT NULL,
	"section_title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"classification" "evidence_classification" NOT NULL,
	"citation_notes" text,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "destination_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"destination_id" uuid NOT NULL,
	"image_url" text NOT NULL,
	"alt_text" varchar(255) NOT NULL,
	"caption" text,
	"credit" varchar(255),
	"license" varchar(100),
	"is_primary" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "destination_sources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"destination_id" uuid NOT NULL,
	"title" varchar(500) NOT NULL,
	"publisher" varchar(255) NOT NULL,
	"url" text,
	"source_type" "source_type" NOT NULL,
	"publication_date" varchar(50),
	"notes" text,
	"verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "destination_visit_info" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"destination_id" uuid NOT NULL,
	"entry_fee" text,
	"currency" varchar(10) DEFAULT 'INR' NOT NULL,
	"fee_type" varchar(50) DEFAULT 'per_person',
	"is_fee_verified" boolean DEFAULT false NOT NULL,
	"opening_information" text,
	"parking_information" text,
	"access_information" text,
	"contact_information" text,
	"best_time_information" text,
	"source_id" uuid,
	"verified_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "destination_visit_info_destination_id_unique" UNIQUE("destination_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "destinations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"short_description" text NOT NULL,
	"long_description" text NOT NULL,
	"state" varchar(100) NOT NULL,
	"district" varchar(100) NOT NULL,
	"locality" varchar(100),
	"latitude" double precision NOT NULL,
	"longitude" double precision NOT NULL,
	"coordinate_source" varchar(255),
	"coordinate_verified_at" timestamp with time zone,
	"historical_period" varchar(100),
	"difficulty" "difficulty_level" DEFAULT 'easy' NOT NULL,
	"estimated_visit_duration" varchar(50) NOT NULL,
	"evidence_classification" "evidence_classification" DEFAULT 'UNKNOWN' NOT NULL,
	"editorial_status" "editorial_status" DEFAULT 'draft' NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "destinations_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "destination_categories" ADD CONSTRAINT "destination_categories_destination_id_destinations_id_fk" FOREIGN KEY ("destination_id") REFERENCES "public"."destinations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "destination_categories" ADD CONSTRAINT "destination_categories_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "destination_evidence_items" ADD CONSTRAINT "destination_evidence_items_destination_id_destinations_id_fk" FOREIGN KEY ("destination_id") REFERENCES "public"."destinations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "destination_images" ADD CONSTRAINT "destination_images_destination_id_destinations_id_fk" FOREIGN KEY ("destination_id") REFERENCES "public"."destinations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "destination_sources" ADD CONSTRAINT "destination_sources_destination_id_destinations_id_fk" FOREIGN KEY ("destination_id") REFERENCES "public"."destinations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "destination_visit_info" ADD CONSTRAINT "destination_visit_info_destination_id_destinations_id_fk" FOREIGN KEY ("destination_id") REFERENCES "public"."destinations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "destination_visit_info" ADD CONSTRAINT "destination_visit_info_source_id_destination_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."destination_sources"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "categories_slug_idx" ON "categories" USING btree ("slug");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "dest_categories_dest_idx" ON "destination_categories" USING btree ("destination_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "dest_categories_cat_idx" ON "destination_categories" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "dest_evidence_dest_id_idx" ON "destination_evidence_items" USING btree ("destination_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "dest_evidence_class_idx" ON "destination_evidence_items" USING btree ("classification");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "destination_images_dest_id_idx" ON "destination_images" USING btree ("destination_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "destination_images_primary_idx" ON "destination_images" USING btree ("is_primary");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "destination_sources_dest_id_idx" ON "destination_sources" USING btree ("destination_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "destination_visit_info_dest_id_idx" ON "destination_visit_info" USING btree ("destination_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "destinations_slug_idx" ON "destinations" USING btree ("slug");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "destinations_coords_idx" ON "destinations" USING btree ("latitude","longitude");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "destinations_state_idx" ON "destinations" USING btree ("state");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "destinations_district_idx" ON "destinations" USING btree ("district");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "destinations_status_idx" ON "destinations" USING btree ("editorial_status");