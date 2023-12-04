import { Client } from "pg";
import { NextResponse } from "next/server";
import { authenticateToken } from "../utils";

export async function POST(request) {
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

  try {
    const { contentid } = await request.json();

    // Authenticate the user
    const authResult = await authenticateToken(request);
    if (authResult.error) {
      return NextResponse.json(
        { message: authResult.error },
        { status: authResult.status }
      );
    }

    const { decoded } = authResult;

    await client.connect();

    // Get the contentid of the entry to be deleted
    const content = await client.query(
      `
        SELECT * FROM Content WHERE contentid = $1;
    `,
      [contentid]
    );

    if (content.rowCount === 0) {
      client.end();
      return NextResponse.json(
        { message: "Content does not exist" },
        { status: 404 }
      );
    }

    // Check if the user is the owner of the content
    if (content.rows[0].username !== decoded.username) {
      client.end();
      return NextResponse.json(
        { message: "You are not the owner of this content" },
        { status: 401 }
      );
    }

    await client.query(
      `
        DELETE FROM Content WHERE contentid = $1};
    `,
      [contentid]
    );

    client.end();
    return NextResponse.json({ message: "Success" }, { status: 200 });
  } catch (error) {
    client.end();
    console.log(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
