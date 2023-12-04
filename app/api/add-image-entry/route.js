import { Client } from "pg";
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
      // Insert the new entry into the Content table
      const contentInsert = await client.query(
        `
        INSERT INTO Content (username, contenttype, title, tags)
        VALUES ($1, 'Image', $2, $3)
        RETURNING contentid;
    `,
        [decoded.username, title, tags]
      );

      const contentid = contentInsert.rows[0].contentid;

      await client.query(
        `
        INSERT INTO Image (contentid, imagetype, imagedata)
        VALUES ($1, $2, $3);
    `,
        [contentid, imagetype, decodedImageData]
      );
      await client.query(`COMMIT`);
    } catch (error) {
      await client.query(`ROLLBACK`);
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
