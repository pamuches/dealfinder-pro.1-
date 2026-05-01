export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // TEST: Devolver datos de ejemplo sin llamar a Anthropic
  return res.json({
    success: true,
    deals: [{
      id: "test_1",
      title: "Producto de Prueba",
      originalPrice: 1000,
      discountPrice: 800,
      discount: 20,
      category: "Test",
      store: "Test Store",
      url: "https://example.com",
      description: "Esto es una prueba",
      temperature: 90,
      scrapedAt: new Date().toISOString(),
      priceHistory: []
    }],
    count: 1
  });
}
