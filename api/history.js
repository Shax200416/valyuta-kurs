export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=3600');

  const { cur, days = 30 } = req.query;
  if (!cur) return res.status(400).json({ error: 'cur required' });

  const upstashUrl = process.env.KV_REST_API_URL;
  const upstashToken = process.env.KV_REST_API_READ_ONLY_TOKEN;

  const result = [];
  const end = new Date();

  // So'nggi N kun uchun ma'lumot olamiz
  const promises = [];
  for (let i = parseInt(days); i >= 0; i--) {
    const d = new Date(end);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    promises.push(
      fetch(`${upstashUrl}/get/rates:${dateStr}`, {
        headers: { Authorization: `Bearer ${upstashToken}` }
      })
        .then(r => r.json())
        .then(data => {
          if (data.result) {
            const rates = JSON.parse(decodeURIComponent(data.result));
            if (rates[cur]) {
              result.push({ date: dateStr, rate: rates[cur] });
            }
          }
        })
        .catch(() => {})
    );
  }

  await Promise.all(promises);
  result.sort((a, b) => a.date.localeCompare(b.date));

  res.status(200).json(result);
}
