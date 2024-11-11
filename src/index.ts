import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import * as functionsFramework from "@google-cloud/functions-framework";
import { eq, sql } from "drizzle-orm";
import { bookmarksTable, curriculumTable, usersTable } from "./db/schema";

const db = drizzle(process.env.DATABASE_URL!);

// prepare reusable queries ahead for performance enhancements
const getUser = db
  .select()
  .from(usersTable)
  .where(eq(usersTable.id, sql.placeholder("id")))
  .prepare("getUser");

functionsFramework.http(
  "getUser",
  async (req: functionsFramework.Request, res: functionsFramework.Response) => {
    const id = req.query.id;
    if (!id || typeof id !== "string") {
      res.status(400).send("id is required");
      return;
    }
    // execute prepared query
    const user = await getUser.execute({ id: parseInt(id) });

    res.send(user[0]);
  }
);

functionsFramework.http("addUser", async (req, res) => {
  const { id, contentPreferences } = req.body;
  if (!id) {
    res.status(400).send("name and age are required");
    return;
  }

  await db
    .insert(usersTable)
    .values({ id, contentPreferences: contentPreferences || {} })
    .execute();

  res.send("User added");
});

functionsFramework.http(
  "addBookmark",
  async (req: functionsFramework.Request, res: functionsFramework.Response) => {
    const { userId, slug, type } = req.body;
    if (!userId || !slug || !type) {
      res.status(400).send("userId, type and slug are required");
      return;
    }

    await db.transaction(async (tx) => {
      await tx
        .insert(curriculumTable)
        .values({ slug, type })
        .onConflictDoNothing();
      await tx
        .insert(bookmarksTable)
        .values({ userId, slug })
        .onConflictDoNothing();
    });

    res.send("Bookmark added");
  }
);

functionsFramework.http(
  "getBookmarksForUser",
  async (req: functionsFramework.Request, res: functionsFramework.Response) => {
    const userId = req.query.userId;
    if (!userId || typeof userId !== "string") {
      res.status(400).send("userId is required");
      return;
    }
    const bookmarks = await db
      .select({ slug: curriculumTable.slug, type: curriculumTable.type })
      .from(bookmarksTable)
      .leftJoin(curriculumTable, eq(bookmarksTable.slug, curriculumTable.slug))
      .where(eq(bookmarksTable.userId, userId))
      .groupBy(curriculumTable.slug, curriculumTable.type);

    res.send(bookmarks);
  }
);
