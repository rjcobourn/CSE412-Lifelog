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
    const result = await client.query(
      `
      SELECT * FROM users WHERE Username = $1;
    `,
      [username]
    );

    client.end();

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

    const response = NextResponse.json(
      { message: "Login successful" },
      { status: 200 }
    );

    // Set the HttpOnly, Secure, and SameSite cookie attributes
    response.headers.set(
      "Set-Cookie",
      `authToken=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=86400`
    );

    // Return the response with the cookie
    return response;
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
