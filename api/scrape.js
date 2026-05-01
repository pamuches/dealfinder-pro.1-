export default async function handler(req, res) {
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
          content: `Busca ofertas en México con descuento >15%. Devuelve JSON: {"deals":[{"id":"1","title":"producto","originalPrice":1000,"discountPrice":800,"discount":20,"category":"Electrónica","store":"Amazon México","url":"https://amazon.com.mx/...","description":"desc","temperature":90}]}`
        }],
        tools: [{ type: "web_search_20250305", name: "web_search" }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(500).json({ success: false, error: errorText });
    }

    const data = await response.json();
    let text = data.content?.map(i => i.text || "").join("") || "{}";
    text = text.replace(/```json\n?/g, '').replace(/```/g, '').trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { deals: [] };
    
    const deals = (parsed.deals || []).map(d => ({
      ...d,
      id: d.id || `deal_${Date.now()}`,
      scrapedAt: new Date().toISOString(),
      priceHistory: [{ date: new Date().toISOString().split('T')[0], price: d.discountPrice }]
    }));

    return res.json({ success: true, deals, count: deals.length });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
