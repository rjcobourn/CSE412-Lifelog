import { Client } from "pg";
import { NextResponse } from "next/server";
import { authenticateToken } from "../utils";

export async function GET(request) {
  try {
    // Authenticate the user
    const authResult = await authenticateToken(request);
    if (authResult.error) {
      return NextResponse.json(
        { message: authResult.error },
        { status: authResult.status }
      );
    }

    const { decoded } = authResult;
    let timelineData;
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
      const dbResponse = await client.query(
        `
            select *
                from (
                    select cont.contentid, cont.contenttype, cont.title, cont.tags, img.imagetype, img.imagedata, null as entrytext, cont.timestamp
                    from content cont
                    join image img on cont.contentid = img.contentid 
                    where cont.username = $1

                    union

                    select cont.contentid, cont.contenttype, cont.title, cont.tags, null as imagetype, null as imagedata, entry.entrytext, cont.timestamp
                    from content cont
                    join entry on cont.contentid = entry.contentid 
                    where cont.username = $1
                ) as combinedResults
            order by timestamp;
        `,
        [decoded.username]
      );
      timelineData = dbResponse.rows;
    } catch (error) {
      client.end();
      console.log(error);
      return NextResponse.json({ error }, { status: 500 });
    }
    client.end();
    for (let i = 0; i < timelineData.length; i++) {
      if (timelineData[i].imagetype === null) {
        continue;
      }
      let buffer = Buffer.from(timelineData[i].imagedata);
      let base64String = buffer.toString("base64");
      timelineData[i].imagedata = base64String;
    }
    return NextResponse.json({ timelineData }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
