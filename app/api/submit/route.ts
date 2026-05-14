import { NextRequest, NextResponse } from "next/server";
import { upsertMember, upsertChild, addCalendarEntry } from "@/lib/airtable";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    const memberId = await upsertMember({
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      email: data.email,
      address: data.address,
      gender: data.gender,
      spouseName: data.spouseName,
    });

    if (data.birthdayGregorian || data.hebrewDay) {
      await addCalendarEntry({
        name: `${data.firstName} ${data.lastName}`,
        memberId,
        eventType: "יום הולדת",
        relation: "איש הקשר בעצמו",
        gender: data.gender,
        dateGregorian: data.birthdayGregorian || undefined,
        hebrewDay: data.hebrewDay || undefined,
        hebrewMonth: data.hebrewMonth || undefined,
        hebrewYear: data.hebrewYear || undefined,
      });
    }

    for (const child of data.children || []) {
      if (!child.firstName) continue;
      const childId = await upsertChild(
        {
          firstName: child.firstName,
          lastName: child.lastName || data.lastName,
          gender: child.gender,
        },
        memberId
      );
      if (child.birthdayGregorian || child.hebrewDay) {
        await addCalendarEntry({
          name: `${child.firstName} ${child.lastName || data.lastName}`,
          memberId: childId,
          eventType: "יום הולדת",
          relation: child.gender === "נקבה" ? "בת" : "בן",
          gender: child.gender,
          dateGregorian: child.birthdayGregorian || undefined,
          hebrewDay: child.hebrewDay || undefined,
          hebrewMonth: child.hebrewMonth || undefined,
          hebrewYear: child.hebrewYear || undefined,
        });
      }
    }

    for (const y of data.yahrzeits || []) {
      if (!y.name) continue;
      await addCalendarEntry({
        name: y.name,
        memberId,
        eventType: "יארצייט",
        relation: y.relation || "אחר",
        dateGregorian: y.dateGregorian || undefined,
        hebrewDay: y.hebrewDay || undefined,
        hebrewMonth: y.hebrewMonth || undefined,
        hebrewYear: y.hebrewYear || undefined,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "שגיאה בשמירת הנתונים" }, { status: 500 });
  }
}
