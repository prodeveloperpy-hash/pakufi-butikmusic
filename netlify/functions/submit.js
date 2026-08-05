// BUTIK — Artist Application → Notion
// Receives the form POST and creates a row in the Artist Applications database.
// The Notion secret is read from the NOTION_TOKEN environment variable
// (set in Netlify: Site settings → Environment variables). Never hard-code it.

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const DATABASE_ID = process.env.DB_ID;
const NOTION_VERSION = "2022-06-28";

// --- helpers to build Notion property values, skipping empties ---
const richText = (v) =>
  v
    ? { rich_text: [{ text: { content: String(v).slice(0, 2000) } }] }
    : undefined;
const title = (v) => ({
  title: [{ text: { content: String(v || "Untitled").slice(0, 2000) } }],
});
const url = (v) => (v ? { url: String(v) } : undefined);
const email = (v) => (v ? { email: String(v) } : undefined);
const phone = (v) => (v ? { phone_number: String(v) } : undefined);
const number = (v) =>
  v !== "" && v != null && !isNaN(Number(v))
    ? { number: Number(v) }
    : undefined;
const select = (v) => (v ? { select: { name: String(v) } } : undefined);
const multi = (arr) =>
  Array.isArray(arr) && arr.length
    ? { multi_select: arr.map((name) => ({ name: String(name) })) }
    : undefined;
const date = (v) => (v ? { date: { start: String(v) } } : undefined);

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }
  if (!NOTION_TOKEN) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Server not configured (missing NOTION_TOKEN)",
      }),
    };
  }

  let d;
  try {
    d = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  const links = d.links || {};

  // Map form fields → Notion properties. undefined values are stripped below.
  const rawProps = {
    "Artist Name": title(d.artistName || d.fullName),
    Status: { select: { name: "New" } },
    "Full Name": richText(d.fullName),
    Email: email(d.email),
    Phone: phone(d.phone),
    Country: richText(d.country),
    City: richText(d.city),
    Nationality: richText(d.nationality),
    "Date of Birth": date(d.dob),
    Discipline: select(
      d.discipline === "Other" && d.disciplineOther
        ? d.disciplineOther
        : d.discipline,
    ),
    Genres: multi(d.genres),
    "Years Active": richText(d.yearsActive),
    "Current Location": richText(d.currentLocation),
    Bio: richText(d.bio),
    Spotify: url(links.spotify),
    SoundCloud: url(links.soundcloud),
    Bandcamp: url(links.bandcamp),
    "Apple Music": url(links.appleMusic),
    Beatport: url(links.beatport),
    YouTube: url(links.youtube),
    Instagram: url(links.instagram),
    "Resident Advisor": url(links.residentAdvisor),
    Website: url(links.website),
    "Press Kit": url(links.pressKit),
    Photos: url(links.photos),
    Logo: url(links.logo),
    "Track Links": url(links.trackLinks),
    "Latest Release": richText(d.latestRelease),
    "Upcoming Releases": richText(d.upcomingReleases),
    Labels: richText(d.labels),
    "Countries Performed": richText(d.countriesPerformed),
    "Notable Venues": richText(d.notableVenues),
    "Recent Gigs": richText(d.recentGigs),
    "Upcoming Bookings": richText(d.upcomingBookings),
    Touring: richText(d.touringAvailability),
    "Passport Available": select(d.passportAvailable),
    "Visa Restrictions": richText(d.visaRestrictions),
    Represented: select(d.represented),
    "Agency Name": richText(d.repName),
    Exclusive: richText(d.repExclusive),
    "IG Followers": number(d.igFollowers),
    "Spotify Listeners": number(d.spotifyListeners),
    "YouTube Subs": number(d.ytSubs),
    Newsletter: richText(d.newsletter),
    "Why BUTIK": richText(d.whyButik),
    Goals: richText(d.goals),
    "How Help": richText(d.howHelp),
    Additional: richText(d.additional),
    "Submitted At": date(
      (d.submittedAt || new Date().toISOString()).slice(0, 10),
    ),
  };

  const properties = {};
  for (const [k, v] of Object.entries(rawProps)) {
    if (v !== undefined) properties[k] = v;
  }

  try {
    const resp = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${NOTION_TOKEN}`,
        "Content-Type": "application/json",
        "Notion-Version": NOTION_VERSION,
      },
      body: JSON.stringify({
        parent: { database_id: DATABASE_ID },
        properties,
      }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error("Notion API error:", resp.status, text);
      return {
        statusCode: 502,
        body: JSON.stringify({
          error: "Notion rejected the submission",
          detail: text,
        }),
      };
    }

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    console.error("Function error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to reach Notion" }),
    };
  }
};
