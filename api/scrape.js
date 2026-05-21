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
        max_tokens: 4500,
        messages: [{
          role: "user",
          content: `Eres un experto comparador de precios en México. Encuentra productos que estén disponibles en MÚLTIPLES tiendas para comparar precios.

ESTRATEGIA:
1. Busca productos populares (electrónica, hogar, audio) con descuento >15%
2. Para cada producto, intenta encontrarlo en 2-3 tiendas diferentes
3. Compara precios del MISMO producto entre tiendas

TIENDAS A COMPARAR:
- Amazon México (amazon.com.mx)
- Liverpool (liverpool.com.mx)
- Mercado Libre México
- Bodega Aurrera
- Walmart México
- Best Buy México

REGLAS CRÍTICAS:
1. USA web_search para buscar en cada tienda
2. URLs REALES y completas (NO inventes)
3. Si no encuentras URL real, NO incluyas el producto
4. Verifica que las URLs funcionen

Encuentra 5-7 productos.

JSON (sin markdown):
{
  "deals": [{
    "id": "único",
    "title": "nombre exacto del producto",
    "originalPrice": precio_original,
    "discountPrice": precio_actual,
    "discount": porcentaje,
    "category": "categoría",
    "store": "tienda con mejor precio",
    "url": "URL REAL del mejor precio",
    "description": "descripción",
    "temperature": 0_a_100,
    "priceComparison": [
      {"store": "tienda1", "price": precio1, "url": "url_real1", "available": true},
      {"store": "tienda2", "price": precio2, "url": "url_real2", "available": true}
    ]
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
    
    // Generar historial de precios simulado (últimos 6 meses)
    const generatePriceHistory = (currentPrice) => {
      const history = [];
      const today = new Date();
      
      // Generar 6 meses de historial
      for (let i = 5; i >= 0; i--) {
        const date = new Date(today);
        date.setMonth(date.getMonth() - i);
        
        // Variación realista: precio más alto en el pasado, bajando hacia el actual
        const variationFactor = 1 + (i * 0.03) + (Math.random() * 0.05 - 0.025);
        const historicalPrice = Math.round(currentPrice * variationFactor);
        
        history.push({
          date: date.toISOString().split('T')[0],
          price: historicalPrice,
          timestamp: date.getTime()
        });
      }
      
      return history;
    };
    
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
      .map(deal => {
        // Generar historial de precios para este producto
        const priceHistory = generatePriceHistory(deal.discountPrice);
        
        // Procesar comparación de precios si existe
        let priceComparison = deal.priceComparison || [];
        
        // Filtrar comparaciones con URLs válidas
        priceComparison = priceComparison.filter(comp => 
          comp.url && 
          comp.url.startsWith('http') &&
          !comp.url.includes('ejemplo') &&
          !comp.url.includes('example')
        );
        
        // Si no hay comparaciones válidas, crear una con la tienda principal
        if (priceComparison.length === 0) {
          priceComparison = [{
            store: deal.store,
            price: deal.discountPrice,
            url: deal.url,
            available: true
          }];
        }
        
        return {
          ...deal,
          id: deal.id || `deal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          scrapedAt: new Date().toISOString(),
          priceHistory: priceHistory,
          priceComparison: priceComparison,
          // Calcular mejor precio entre comparaciones
          bestPrice: Math.min(...priceComparison.map(c => c.price)),
          // Calcular ahorro vs precio más alto
          maxSavings: Math.max(...priceComparison.map(c => c.price)) - Math.min(...priceComparison.map(c => c.price))
        };
      });

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
