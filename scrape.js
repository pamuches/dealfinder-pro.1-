export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: 'API key not configured'
      });
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 4000,
        messages: [{
          role: "user",
          content: `Busca las mejores ofertas actuales en México de estos sitios:

1. Promodescuentos.com
2. Amazon México  
3. Liverpool
4. Mercado Libre

Para cada oferta encontrada:
- Nombre completo del producto
- Precio original
- Precio con descuento
- Porcentaje de descuento
- Categoría (Electrónica, Audio, Hogar, etc.)
- Tienda exacta
- URL REAL y directa al producto
- Descripción breve
- Temperatura (0-100, donde 100 es la mejor oferta)

Encuentra al menos 15 ofertas con descuentos mayores al 15%.

Devuelve SOLO un objeto JSON válido, sin markdown, sin texto adicional:
{
  "deals": [{
    "id": "deal_1",
    "title": "nombre exacto del producto",
    "originalPrice": 10000,
    "discountPrice": 7500,
    "discount": 25,
    "category": "Electrónica",
    "store": "Amazon México",
    "url": "https://www.amazon.com.mx/...",
    "description": "descripción del producto",
    "temperature": 90
  }]
}`
        }],
        tools: [{
          type: "web_search_20250305",
          name: "web_search"
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({
        success: false,
        error: `Anthropic API error: ${response.status}`,
        details: errorText
      });
    }

    const data = await response.json();
    
    let textResponse = '';
    if (data.content) {
      for (const item of data.content) {
        if (item.type === 'text') {
          textResponse += item.text;
        }
      }
    }

    let cleanResponse = textResponse.trim();
    const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanResponse = jsonMatch[0];
    }
    cleanResponse = cleanResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const parsed = JSON.parse(cleanResponse);
    
    const validDeals = (parsed.deals || [])
      .filter(deal => deal.url && deal.url.startsWith('http'))
      .map(deal => ({
        ...deal,
        id: deal.id || `deal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        scrapedAt: new Date().toISOString(),
        priceHistory: [{
          date: new Date().toISOString().split('T')[0],
          price: deal.discountPrice,
          timestamp: Date.now()
        }]
      }));

    return res.status(200).json({
      success: true,
      deals: validDeals,
      count: validDeals.length,
      scrapedAt: new Date().toISOString()
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to scrape deals'
    });
  }
}
