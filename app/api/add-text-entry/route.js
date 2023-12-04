import { Client } from "pg";
import { NextResponse } from "next/server";
import { authenticateToken } from "../utils";

export async function POST(request) {
  let contentid;
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
    const client = new Client({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      ssl: {
        rejectUnauthorized: false,
      },
    });
    await client.connect();
    try {
      await client.query(`BEGIN`);
      // Convert the array of tags into a PostgreSQL array string
      const tagsArrayString = `{${tags.join(",")}}`;
      // Insert the new entry into the Content table
      const contentInsert = await client.query(
        `
        INSERT INTO Content (username, contenttype, title, tags)
        VALUES ($1, 'Entry', $2, $3)
        RETURNING contentid;
    `,
        [decoded.username, title, tagsArrayString]
      );

      contentid = contentInsert.rows[0].contentid;

      await client.query(
        `
        INSERT INTO Entry (contentid, entrytext)
        VALUES ($1, $2);
    `,
        [contentid, text]
      );
      await client.query(`COMMIT`);
    } catch (error) {
      await client.query(`ROLLBACK`);
      console.log(error);
      return NextResponse.json({ error }, { status: 500 });
    } finally {
      client.end();
    }

    return NextResponse.json(
      { contentid, message: "Success" },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
