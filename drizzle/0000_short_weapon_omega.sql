CREATE TABLE IF NOT EXISTS "bookmarks" (
	"slug" varchar(255) NOT NULL,
	"user_id" varchar(255) NOT NULL,
	CONSTRAINT "bookmarks_slug_user_id_pk" PRIMARY KEY("slug","user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "curriculum" (
	"slug" varchar(255) PRIMARY KEY NOT NULL,
	"type" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"content_preferences" jsonb
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_slug_curriculum_slug_fk" FOREIGN KEY ("slug") REFERENCES "public"."curriculum"("slug") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
