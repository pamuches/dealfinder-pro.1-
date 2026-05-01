export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
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
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 4000,
        messages: [{
          role: "user",
          content: "Busca 5 ofertas actuales en sitios de México con descuento mayor al 15%. Devuelve SOLO JSON sin markdown: {\"deals\":[{\"id\":\"1\",\"title\":\"nombre\",\"originalPrice\":1000,\"discountPrice\":800,\"discount\":20,\"category\":\"Electrónica\",\"store\":\"Amazon México\",\"url\":\"https://amazon.com.mx/ejemplo\",\"description\":\"descripción\",\"temperature\":90}]}"
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
    
    // Extraer texto
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
    
    const deals = (parsed.deals || []).map(deal => ({
      ...deal,
      id: deal.id || `deal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      scrapedAt: new Date().toISOString(),
      priceHistory: [{
        date: new Date().toISOString().split('T')[0],
        price: deal.discountPrice,
        timestamp: Date.now()
      }]
    }));

    console.log(`Success! Found ${deals.length} deals`);

    return res.status(200).json({
      success: true,
      deals: deals,
      count: deals.length,
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
