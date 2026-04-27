export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const { date } = req.query;
  if (!date) return res.json({ booked: [] });

  try {
    const notionRes = await fetch(
      `https://api.notion.com/v1/databases/${process.env.NOTION_DATABASE_ID}/query`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28',
        },
        body: JSON.stringify({
          filter: { property: 'Date du rendez-vous', date: { equals: date } },
        }),
      }
    );

    const data = await notionRes.json();

    const fmt = new Intl.DateTimeFormat('en-US', {
      hour: '2-digit', minute: '2-digit',
      timeZone: 'America/Toronto', hour12: false,
    });

    const booked = (data.results || []).map(page => {
      const iso = page.properties['Date du rendez-vous']?.date?.start;
      if (!iso) return null;
      const parts = fmt.formatToParts(new Date(iso));
      const h = parseInt(parts.find(p => p.type === 'hour').value);
      const m = parts.find(p => p.type === 'minute').value;
      return `${h}h${m}`;
    }).filter(Boolean);

    res.json({ booked });
  } catch (e) {
    console.error('Slots error:', e.message);
    res.json({ booked: [] });
  }
}
