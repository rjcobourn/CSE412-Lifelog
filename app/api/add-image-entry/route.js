import { db } from "@vercel/postgres";
import { NextResponse } from "next/server";
import { authenticateToken } from "../utils";

export async function POST(request) {
  try {
    const { title, imagetype, imagedata, tags } = await request.json();

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
    const decodedImageData = Buffer.from(imagedata, "base64");
    const client = await db.connect();
    try {
      await client.sql`BEGIN`;
      // Insert the new entry into the Content table
      const contentInsert = await client.sql`
        INSERT INTO Content (username, contenttype, title, tags)
        VALUES (${decoded.username}, 'Image', ${title}, ${tags})
        RETURNING contentid;
    `;

      const contentid = contentInsert.rows[0].contentid;

      await client.sql`
        INSERT INTO Image (contentid, imagetype, imagedata)
        VALUES (${contentid}, ${imagetype}, ${decodedImageData});
    `;
      await client.sql`COMMIT`;
    } catch (error) {
      await client.sql`ROLLBACK`;
      console.log(error);
      return NextResponse.json({ error }, { status: 500 });
    } finally {
      client.end();
    }

    return NextResponse.json({ message: "Success" }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
