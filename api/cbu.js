export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 's-maxage=3600');

  const { cur, date } = req.query;

  let url;
  if (cur && date) {
    // date = YYYY-MM-DD formatida keladi
    const [y, m, d] = date.split('-');
    // CBU API DD.MM.YYYY formatini qabul qiladi
    url = `https://cbu.uz/uz/arkhiv-kursov-valyut/json/${cur}/${d}.${m}.${y}/`;
  } else {
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