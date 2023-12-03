import { db } from "@vercel/postgres";
import { NextResponse } from "next/server";
import { authenticateToken } from "../utils";

export async function POST(request) {
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

    const client = await db.connect();

    // Get the contentid of the entry to be deleted
    const content = await client.sql`
        SELECT * FROM Content WHERE contentid = ${contentid};
    `;

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

    await client.sql`
        DELETE FROM Content WHERE contentid = ${contentid};
    `;

    return NextResponse.json({ message: "Success" }, { status: 200 });
  } catch (error) {
    client.end();
    return NextResponse.json({ error }, { status: 500 });
  }
}
