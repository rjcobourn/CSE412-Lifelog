import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    const result = await sql`
      SELECT * FROM Users WHERE Username = ${username};
    `;

    if (result.rowCount === 0) {
      return NextResponse.json(
        { message: "Username does not exist" },
        { status: 404 }
      );
    }

    // User exists, now verify the password
    const user = result.rows[0];

    const passwordIsValid = await bcrypt.compare(password, user.hash);

    if (!passwordIsValid) {
      return NextResponse.json(
        { message: "Invalid password" },
        { status: 401 }
      );
    }

    // Password is valid, generate a JWT
    const token = jwt.sign({ username: username }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    // Return the JWT token
    return NextResponse.json(
      { message: "Login successful", token },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
