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
      console.error('API key missing');
      return res.status(500).json({
        success: false,
        error: 'API key not configured'
      });
    }

    console.log('Calling Anthropic API...');
    
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 4000,
        messages: [{
          role: "user",
          content: `Eres un experto buscador de ofertas en México. Tu tarea es encontrar ofertas REALES y ACTUALES con descuentos mayores al 15%.

INSTRUCCIONES CRÍTICAS:
1. USA web_search para buscar ofertas REALES en estos sitios:
   - Amazon México (amazon.com.mx)
   - Liverpool (liverpool.com.mx)
   - Mercado Libre México
   - Bodega Aurrera

2. Para CADA producto que encuentres:
   - Busca el producto específico en el sitio
   - Obtén la URL REAL y COMPLETA del producto (no inventes URLs)
   - Verifica que tenga descuento real mayor al 15%
   - Copia la URL exacta de la página del producto

3. NUNCA inventes URLs ni uses URLs de ejemplo
4. Si no encuentras la URL real de un producto, NO lo incluyas
5. Las URLs deben ser clickeables y llevar directo al producto

Encuentra 8-10 ofertas reales.

Devuelve SOLO este JSON sin markdown:
{
  "deals": [{
    "id": "único",
    "title": "nombre COMPLETO del producto",
    "originalPrice": precio_original_número,
    "discountPrice": precio_con_descuento_número,
    "discount": porcentaje_número,
    "category": "categoría",
    "store": "nombre exacto de la tienda",
    "url": "URL REAL Y COMPLETA del producto",
    "description": "descripción breve",
    "temperature": número_0_a_100
  }]
}`
        }],
        tools: [{
          type: "web_search_20250305",
          name: "web_search"
        }]
      })
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Anthropic error:', errorText);
      return res.status(500).json({
        success: false,
        error: `Anthropic API error: ${response.status}`,
        details: errorText.substring(0, 200)
      });
    }

    const data = await response.json();
    console.log('Response received, processing...');
    
    // Extraer texto de la respuesta
    let textResponse = '';
    if (data.content && Array.isArray(data.content)) {
      for (const item of data.content) {
        if (item.type === 'text') {
          textResponse += item.text;
        }
      }
    }

    // Limpiar markdown
    let cleanResponse = textResponse.trim();
    cleanResponse = cleanResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    // Extraer JSON
    const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No JSON found in response');
      return res.status(500).json({
        success: false,
        error: 'No JSON found in Claude response',
        rawResponse: cleanResponse.substring(0, 200)
      });
    }

    const parsed = JSON.parse(jsonMatch[0]);
    
    // Filtrar y procesar deals válidos
    const validDeals = (parsed.deals || [])
      .filter(deal => {
        // Solo incluir deals con URLs reales
        return deal.url && 
               deal.url.startsWith('http') && 
               !deal.url.includes('ejemplo') &&
               !deal.url.includes('example') &&
               deal.url.length > 20;
      })
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

    console.log(`Success! Found ${validDeals.length} deals`);

    return res.status(200).json({
      success: true,
      deals: validDeals,
      count: validDeals.length,
      scrapedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
