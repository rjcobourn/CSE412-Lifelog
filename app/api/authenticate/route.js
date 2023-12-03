import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { token } = await request.json();
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return NextResponse.json(
      { message: "Success", decoded: decoded },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
