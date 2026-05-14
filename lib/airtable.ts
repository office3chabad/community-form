const KEY = process.env.AIRTABLE_API_KEY!;
const BASE = process.env.AIRTABLE_BASE_ID!;
const MASTER = "tbl1U680WUrcUwfaT";
const CALENDAR = "tblqrSmfyIpmKe3gE";

const FIELDS = {
  firstName: "fld8Q1JXSR1wxPA5r",
  lastName: "fldIIZCE8OzMoPTHr",
  phone: "fldbDUBmK1WOWdMnS",
  email: "fld5DtvNkxBgt8rgC",
  address: "fldoGCdq19kyYtXw7",
  gender: "fldQuGYA7NQKVLNDX",
  spouseText: "fldVvVWskD7n9ZE0M",
  spouseLinked: "fldgGviQX8PFR1k9U",
  children: "fldgXNSfmHItGagpL",
  parents: "fld4JSKbje2UG0iNH",
  calendarLink: "fldOqIQ2zybXI6K57",
  filledQuestionnaire: "fldNQE95A4n8oMq7W",
  phoneClean: "fldC4ddtzTmK5oxXP",
} as const;

const CAL_FIELDS = {
  name: "fldZEe2TWRtRgVMG7",
  linkedTo: "fldQw1cJ3xCUrIrLC",
  dateGregorian: "fldqcf0Z2MtCQZEoc",
  hebrewDay: "fldeTHcFS5UjWK0W1",
  hebrewMonth: "fldD65k2BwVwjRqcU",
  hebrewYear: "fldHx2Y7ekJ3ZQTpp",
  eventType: "fldooJD89rE663l0p",
  relation: "fldslOLw5cfstIs8y",
  gender: "fldTVmKjXDyA5sPOp",
} as const;

async function at(path: string, options: RequestInit = {}) {
  const res = await fetch(`https://api.airtable.com/v0${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${KEY}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Airtable ${res.status}: ${err}`);
  }
  return res.json();
}

function cleanPhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

export async function findMember(phone: string, email: string): Promise<string | null> {
  if (phone) {
    const clean = cleanPhone(phone);
    const formula = encodeURIComponent(`SUBSTITUTE(SUBSTITUTE(SUBSTITUTE({טלפון ראשי},"-",""),"(",""),")","")="${clean}"`);
    const res = await at(`/${BASE}/${MASTER}?filterByFormula=${formula}&maxRecords=1`);
    if (res.records?.length > 0) return res.records[0].id;
  }
  if (email) {
    const formula = encodeURIComponent(`{כתובת מייל}="${email}"`);
    const res = await at(`/${BASE}/${MASTER}?filterByFormula=${formula}&maxRecords=1`);
    if (res.records?.length > 0) return res.records[0].id;
  }
  return null;
}

export async function upsertMember(data: {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  gender: string;
  spouseName: string;
  spousePhone?: string;
}): Promise<string> {
  const existing = await findMember(data.phone, data.email);
  const fields: Record<string, string> = {
    [FIELDS.firstName]: data.firstName,
    [FIELDS.lastName]: data.lastName,
  };
  if (data.phone) fields[FIELDS.phone] = data.phone;
  if (data.email) fields[FIELDS.email] = data.email;
  if (data.address) fields[FIELDS.address] = data.address;
  if (data.gender) fields[FIELDS.gender] = data.gender;
  if (data.spouseName) fields[FIELDS.spouseText] = data.spouseName;
  if (data.spousePhone) {
    const spouseId = await findMember(data.spousePhone, "");
    if (spouseId) {
      (fields as Record<string, unknown>)[FIELDS.spouseLinked] = [spouseId];
    }
  }
  fields[FIELDS.filledQuestionnaire] = new Date().toISOString().split("T")[0];

  if (existing) {
    await at(`/${BASE}/${MASTER}/${existing}`, {
      method: "PATCH",
      body: JSON.stringify({ fields }),
    });
    return existing;
  } else {
    const res = await at(`/${BASE}/${MASTER}`, {
      method: "POST",
      body: JSON.stringify({ fields }),
    });
    return res.id;
  }
}

export async function upsertChild(
  child: {
    firstName: string;
    lastName: string;
    gender: string;
  },
  parentId: string
): Promise<string> {
  const formula = encodeURIComponent(
    `AND({שם פרטי}="${child.firstName}",{שם משפחה}="${child.lastName}",FIND("${parentId}",ARRAYJOIN({הורים})))`
  );
  const res = await at(`/${BASE}/${MASTER}?filterByFormula=${formula}&maxRecords=1`);

  const fields: Record<string, unknown> = {
    [FIELDS.firstName]: child.firstName,
    [FIELDS.lastName]: child.lastName,
    [FIELDS.parents]: [parentId],
  };
  if (child.gender) fields[FIELDS.gender] = child.gender;

  if (res.records?.length > 0) {
    const childId = res.records[0].id;
    await at(`/${BASE}/${MASTER}/${childId}`, {
      method: "PATCH",
      body: JSON.stringify({ fields }),
    });
    return childId;
  } else {
    const created = await at(`/${BASE}/${MASTER}`, {
      method: "POST",
      body: JSON.stringify({ fields }),
    });
    return created.id;
  }
}

export async function addCalendarEntry(entry: {
  name: string;
  memberId: string;
  eventType: "יום הולדת" | "יארצייט" | "יום נישואין";
  relation: string;
  gender?: string;
  dateGregorian?: string;
  hebrewDay?: string;
  hebrewMonth?: string;
  hebrewYear?: string;
}): Promise<void> {
  const fields: Record<string, unknown> = {
    [CAL_FIELDS.name]: entry.name,
    [CAL_FIELDS.linkedTo]: [entry.memberId],
    [CAL_FIELDS.eventType]: entry.eventType,
    [CAL_FIELDS.relation]: entry.relation,
  };
  if (entry.dateGregorian) fields[CAL_FIELDS.dateGregorian] = entry.dateGregorian;
  if (entry.hebrewDay) fields[CAL_FIELDS.hebrewDay] = entry.hebrewDay;
  if (entry.hebrewMonth) fields[CAL_FIELDS.hebrewMonth] = entry.hebrewMonth;
  if (entry.hebrewYear) fields[CAL_FIELDS.hebrewYear] = entry.hebrewYear;
  if (entry.gender) fields[CAL_FIELDS.gender] = entry.gender;

  await at(`/${BASE}/${CALENDAR}`, {
    method: "POST",
    body: JSON.stringify({ fields }),
  });

  await at(`/${BASE}/${MASTER}/${entry.memberId}`, {
    method: "PATCH",
    body: JSON.stringify({
      fields: { [FIELDS.calendarLink]: [entry.memberId] },
    }),
  });
}
