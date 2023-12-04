import { Client } from "pg";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function POST(request) {
  try {
    const { username, password } = await request.json();

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

    // Check if the username already exists
    const user = await client.query(
      `
      SELECT * FROM Users WHERE Username = $1;
    `,
      [username]
    );

    if (user.rowCount > 0) {
      return NextResponse.json(
        { message: "Username already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      await client.query(`BEGIN`);
      await client.query(
        `
      INSERT INTO Users (Username, Hash)
      VALUES ($1, $2);
    `,
        [username, hashedPassword]
      );
      await client.query(`COMMIT`);

      const token = jwt.sign({ username: username }, process.env.JWT_SECRET, {
        expiresIn: "24h",
      });

      const response = NextResponse.json(
        { message: "User added successfully" },
        { status: 200 }
      );

      // Set the HttpOnly, Secure, and SameSite cookie attributes
      response.headers.set(
        "Set-Cookie",
        `authToken=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=86400`
      );

      return response;
    } catch (error) {
      await client.query(`ROLLBACK`);
      return NextResponse.json({ error }, { status: 500 });
    } finally {
      client.end();
    }
  } catch (error) {
    // undo the user insertion if it fails

    console.log(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
