import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";
import { authenticateToken } from "../utils";

export async function POST(request) {
  try {
    const { title, text, tags } = await request.json();

    // Authenticate the user
    const authResult = await authenticateToken(request);
    if (authResult.error) {
      return NextResponse.json(
        { message: authResult.error },
        { status: authResult.status }
      );
    }

    const { decoded } = authResult;

    // We need to wrap the two SQL queries in a transaction so that a failure in entry insertion will not result in a dangling Content entry

    try {
      await sql`BEGIN`;
      // Insert the new entry into the Content table
      const contentInsert = await sql`
        INSERT INTO Content (username, contenttype, title, tags)
        VALUES (${decoded.username}, 'Entry', ${title}, ${tags})
        RETURNING contentid;
    `;

      const contentid = contentInsert.rows[0].contentid;

      await sql`
        INSERT INTO Entry (contentid, entrytext)
        VALUES (${contentid}, ${text});
    `;
    } catch (error) {
      await sql`ROLLBACK`;
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ message: "Success" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}