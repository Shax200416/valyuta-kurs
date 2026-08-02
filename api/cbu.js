export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 's-maxage=3600');

  const { cur, date, month, year } = req.query;

  let url;
  if (cur && month && year) {
    // Oylik tarixiy kurs: /api/cbu?cur=USD&month=07&year=2026
    url = `https://cbu.uz/uz/arkhiv-kursov-valyut/json/${cur}/${month}.${year}/`;
  } else if (cur && date) {
    // Kunlik tarixiy kurs: /api/cbu?cur=USD&date=2026-07-01
    const [y, m, d] = date.split('-');
    url = `https://cbu.uz/uz/arkhiv-kursov-valyut/json/${cur}/${d}.${m}.${y}/`;
  } else {
    // Bugungi barcha kurslar
    url = `https://cbu.uz/uz/arkhiv-kursov-valyut/json/`;
  }

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const data = await response.json();
    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: 'CBU API xatosi' });
  }
}