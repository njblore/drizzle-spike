import { jsonb, pgTable, primaryKey, varchar } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: varchar({ length: 255 }).notNull().primaryKey(),
  contentPreferences: jsonb(),
});

export const bookmarksTable = pgTable(
  "bookmarks",
  {
    slug: varchar({ length: 255 })
      .notNull()
      .references(() => curriculumTable.slug), //foreign key
    userId: varchar({ length: 255 })
      .notNull()
      .references(() => usersTable.id),
  },
  (table) => {
    return {
      // composite primary key
      pk: primaryKey({ columns: [table.slug, table.userId] }),
    };
  }
);

export const curriculumTable = pgTable("curriculum", {
  slug: varchar({ length: 255 }).notNull().primaryKey(),
  type: varchar({ length: 255 }).notNull(),
});

export type User = typeof usersTable.$inferSelect;
export type Bookmark = typeof bookmarksTable.$inferSelect;
export type Curriculum = typeof curriculumTable.$inferSelect;
