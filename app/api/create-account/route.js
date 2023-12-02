import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    // Check if the username already exists
    const user = await sql`
      SELECT * FROM Users WHERE Username = ${username};
    `;

    if (user.rowCount > 0) {
      return NextResponse.json(
        { message: "Username already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      await sql`BEGIN`;
      await sql`
      INSERT INTO Users (Username, Hash)
      VALUES (${username}, ${hashedPassword});
    `;

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
      await sql`ROLLBACK`;
      return NextResponse.json({ error }, { status: 500 });
    }
  } catch (error) {
    // undo the user insertion if it fails

    console.log(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
