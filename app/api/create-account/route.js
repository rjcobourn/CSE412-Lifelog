import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    // Check if the username already exists
    const user = await sql`
      SELECT * FROM users WHERE Username = ${username};
    `;

    if (user.rowCount > 0) {
      return NextResponse.json(
        { message: "Username already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user into the Users table
    await sql`
      INSERT INTO Users (Username, Hash)
      VALUES (${username}, ${hashedPassword});
    `;

    return NextResponse.json(
      { message: "User added successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
