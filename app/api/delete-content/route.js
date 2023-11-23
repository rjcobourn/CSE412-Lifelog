import { sql } from "@vercel/postgres";
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

    // Get the contentid of the entry to be deleted
    const content = await sql`
        SELECT * FROM Content WHERE contentid = ${contentid};
    `;

    if (content.rowCount === 0) {
      return NextResponse.json(
        { message: "Content does not exist" },
        { status: 404 }
      );
    }

    // Check if the user is the owner of the content
    if (content.rows[0].username !== decoded.username) {
      return NextResponse.json(
        { message: "You are not the owner of this content" },
        { status: 401 }
      );
    }

    await sql`
        DELETE FROM Content WHERE contentid = ${contentid};
    `;

    return NextResponse.json({ message: "Success" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
