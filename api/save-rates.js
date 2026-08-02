export default async function handler(req, res) {
  // Faqat Vercel Cron yoki maxfiy token orqali
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const currencies = ['USD', 'EUR', 'RUB', 'GBP', 'KGS', 'KZT', 'TJS', 'TMT', 'AZN', 'AMD', 'GEL', 'BYN', 'UAH', 'KRW', 'JPY', 'AED', 'SAR', 'EGP', 'AUD', 'CNY', 'TRY', 'CHF'];
  const today = new Date().toISOString().split('T')[0];

  try {
    // Bugungi barcha kurslarni CBU dan olamiz
    const cbuRes = await fetch('https://cbu.uz/uz/arkhiv-kursov-valyut/json/', {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const cbuData = await cbuRes.json();

    // Faqat kerakli valyutalarni filtr qilamiz
    const rates = {};
    cbuData.forEach(item => {
      if (currencies.includes(item.Ccy)) {
        rates[item.Ccy] = parseFloat(item.Rate) / parseInt(item.Nominal || 1);
      }
    });

    // Upstash Redis ga saqlaymiz
    const key = `rates:${today}`;
    const upstashUrl = process.env.KV_REST_API_URL;
    const upstashToken = process.env.KV_REST_API_TOKEN;

    await fetch(`${upstashUrl}/set/${key}/${encodeURIComponent(JSON.stringify(rates))}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${upstashToken}` }
    });

    // 90 kunlik ma'lumot saqlansin — eskilarini o'chirmaymiz
    // Lekin key larga 100 kun muddati qo'yamiz
    await fetch(`${upstashUrl}/expire/${key}/8640000`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${upstashToken}` }
    });

    res.status(200).json({ success: true, date: today, rates });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}