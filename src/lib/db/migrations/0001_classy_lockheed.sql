CREATE TYPE "public"."vehicle_type" AS ENUM('PETROL_CAR', 'DIESEL_CAR', 'CNG_CAR', 'MOTORCYCLE', 'EV');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "collection_destinations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"collection_id" uuid NOT NULL,
	"destination_id" uuid NOT NULL,
	"sequence" integer NOT NULL,
	"editorial_note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "collections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"short_description" varchar(500) NOT NULL,
	"description" text NOT NULL,
	"cover_image_url" text,
	"region" varchar(100),
	"theme" varchar(100),
	"editorial_status" "editorial_status" DEFAULT 'draft' NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "collections_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"full_name" varchar(255),
	"role" varchar(50) DEFAULT 'user' NOT NULL,
	"marketing_email_opt_in" boolean DEFAULT false NOT NULL,
	"marketing_email_opted_in_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "saved_destinations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"destination_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "trip_destinations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trip_id" uuid NOT NULL,
	"destination_id" uuid NOT NULL,
	"sequence" integer NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "trips" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"start_location" varchar(255),
	"start_location_label" varchar(255),
	"start_latitude" double precision,
	"start_longitude" double precision,
	"is_start_location_saved" boolean DEFAULT false NOT NULL,
	"vehicle_type" "vehicle_type" DEFAULT 'PETROL_CAR' NOT NULL,
	"trip_start_date" date,
	"trip_end_date" date,
	"notes" text,
	"is_shared" boolean DEFAULT false NOT NULL,
	"share_token" varchar(100),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "trips_share_token_unique" UNIQUE("share_token")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "collection_destinations" ADD CONSTRAINT "collection_destinations_collection_id_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."collections"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "collection_destinations" ADD CONSTRAINT "collection_destinations_destination_id_destinations_id_fk" FOREIGN KEY ("destination_id") REFERENCES "public"."destinations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "saved_destinations" ADD CONSTRAINT "saved_destinations_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "saved_destinations" ADD CONSTRAINT "saved_destinations_destination_id_destinations_id_fk" FOREIGN KEY ("destination_id") REFERENCES "public"."destinations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "trip_destinations" ADD CONSTRAINT "trip_destinations_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "trip_destinations" ADD CONSTRAINT "trip_destinations_destination_id_destinations_id_fk" FOREIGN KEY ("destination_id") REFERENCES "public"."destinations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "trips" ADD CONSTRAINT "trips_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "coll_dest_unique_idx" ON "collection_destinations" USING btree ("collection_id","destination_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "coll_seq_unique_idx" ON "collection_destinations" USING btree ("collection_id","sequence");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "coll_dest_coll_idx" ON "collection_destinations" USING btree ("collection_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "coll_dest_dest_idx" ON "collection_destinations" USING btree ("destination_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "collections_slug_idx" ON "collections" USING btree ("slug");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "collections_status_idx" ON "collections" USING btree ("editorial_status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "profiles_email_idx" ON "profiles" USING btree ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "profiles_role_idx" ON "profiles" USING btree ("role");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "saved_dest_user_dest_idx" ON "saved_destinations" USING btree ("user_id","destination_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "saved_dest_user_idx" ON "saved_destinations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "saved_dest_dest_idx" ON "saved_destinations" USING btree ("destination_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "trip_dest_trip_seq_idx" ON "trip_destinations" USING btree ("trip_id","sequence");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "trip_dest_trip_idx" ON "trip_destinations" USING btree ("trip_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "trip_dest_dest_idx" ON "trip_destinations" USING btree ("destination_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "trips_user_idx" ON "trips" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "trips_share_token_idx" ON "trips" USING btree ("share_token");