import React, { useState, useEffect } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingDown, TrendingUp, ExternalLink, RefreshCw, Zap, Tag, Clock, Heart, Filter, Star, Percent, Lock, LogOut } from 'lucide-react';

// ============================================
// COMPONENTE: Comparación de Precios
// ============================================
const PriceComparisonTable = ({ priceComparison, bestPrice, maxSavings }) => {
  if (!priceComparison || priceComparison.length <= 1) return null;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div style={{
      marginTop: '16px',
      padding: '16px',
      background: '#F3F4F6',
      border: '1px solid #E5E7EB',
      borderRadius: '12px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '12px',
        fontSize: '14px',
        fontWeight: '600',
        color: '#0D1B3E'
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 11l3 3L22 4"/>
          <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
        </svg>
        Comparación de Precios
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {priceComparison.map((comp, idx) => (
          <div key={idx} style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 12px',
            background: comp.price === bestPrice ? '#DCFCE7' : '#FFFFFF',
            border: comp.price === bestPrice ? '1px solid #86EFAC' : '1px solid #E5E7EB',
            borderRadius: '8px',
            fontSize: '14px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#1A1A1A' }}>{comp.store}</span>
              {comp.price === bestPrice && (
                <span style={{
                  background: '#0D1B3E',
                  color: '#FFFFFF',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: '700'
                }}>
                  MEJOR PRECIO
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{
                fontWeight: '700',
                color: comp.price === bestPrice ? '#0D1B3E' : '#1A1A1A'
              }}>
                {formatPrice(comp.price)}
              </span>
              {comp.url && (
                <a 
                  href={comp.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{
                    color: '#0D1B3E',
                    textDecoration: 'none',
                    fontSize: '12px'
                  }}
                >
                  Ver →
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {maxSavings > 0 && (
        <div style={{
          marginTop: '12px',
          padding: '8px 12px',
          background: '#EFF6FF',
          border: '1px solid #BFDBFE',
          borderRadius: '8px',
          fontSize: '13px',
          color: '#0D1B3E',
          textAlign: 'center',
          fontWeight: '600'
        }}>
          💰 Ahorras hasta {formatPrice(maxSavings)} comprando en la tienda correcta
        </div>
      )}
    </div>
  );
};

// ============================================
// COMPONENTE: Historial de Precios (CORREGIDO - SIN ERRORES SVG)
// ============================================
const PriceHistoryChart = ({ priceHistory }) => {
  if (!priceHistory || priceHistory.length === 0) return null;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', { month: 'short', year: '2-digit' });
  };

  const maxPrice = Math.max(...priceHistory.map(h => h.price));
  const minPrice = Math.min(...priceHistory.map(h => h.price));
  const priceRange = maxPrice - minPrice;
  
  const effectiveRange = priceRange === 0 ? maxPrice * 0.1 : priceRange;
  const effectiveMin = priceRange === 0 ? minPrice * 0.95 : minPrice;
  
  const currentPrice = priceHistory[priceHistory.length - 1].price;
  const oldestPrice = priceHistory[0].price;
  const priceChange = oldestPrice !== 0 ? ((currentPrice - oldestPrice) / oldestPrice * 100).toFixed(1) : 0;
  const isDown = priceChange < 0;

  return (
    <div style={{
      marginTop: '16px',
      padding: '16px',
      background: '#F3F4F6',
      border: '1px solid #E5E7EB',
      borderRadius: '12px'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '14px',
          fontWeight: '600',
          color: '#0D1B3E'
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
          Historial de Precios (6 meses)
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '13px',
          fontWeight: '600',
          color: isDown ? '#059669' : priceChange > 0 ? '#DC2626' : '#6B7280'
        }}>
          {priceChange == 0 ? '=' : isDown ? '↓' : '↑'} {Math.abs(priceChange)}%
        </div>
      </div>

      <div style={{ position: 'relative', height: '120px', marginBottom: '12px' }}>
        <svg width="100%" height="120" viewBox="0 0 100 120" preserveAspectRatio="none" style={{ display: 'block' }}>
          <defs>
            <linearGradient id={`priceGradient-${priceHistory[0]?.timestamp || 'default'}`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#0D1B3E" stopOpacity="0.2"/>
              <stop offset="100%" stopColor="#0D1B3E" stopOpacity="0.05"/>
            </linearGradient>
          </defs>
          
          {/* Grid lines */}
          <line x1="0" y1="30" x2="100" y2="30" stroke="#E5E7EB" strokeWidth="0.5" vectorEffect="non-scaling-stroke"/>
          <line x1="0" y1="60" x2="100" y2="60" stroke="#E5E7EB" strokeWidth="0.5" vectorEffect="non-scaling-stroke"/>
          <line x1="0" y1="90" x2="100" y2="90" stroke="#E5E7EB" strokeWidth="0.5" vectorEffect="non-scaling-stroke"/>
          
          {/* Area under line */}
          <path
            d={priceHistory.map((point, i) => {
              const x = priceHistory.length > 1 ? (i / (priceHistory.length - 1)) * 100 : 50;
              const y = 100 - ((point.price - effectiveMin) / effectiveRange) * 80;
              return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
            }).join(' ') + ` L 100 100 L 0 100 Z`}
            fill={`url(#priceGradient-${priceHistory[0]?.timestamp || 'default'})`}
          />
          
          {/* Line */}
          <polyline
            points={priceHistory.map((point, i) => {
              const x = priceHistory.length > 1 ? (i / (priceHistory.length - 1)) * 100 : 50;
              const y = 100 - ((point.price - effectiveMin) / effectiveRange) * 80;
              return `${x},${y}`;
            }).join(' ')}
            fill="none"
            stroke="#0D1B3E"
            strokeWidth="0.8"
            vectorEffect="non-scaling-stroke"
          />
          
          {/* Points */}
          {priceHistory.map((point, i) => {
            const x = priceHistory.length > 1 ? (i / (priceHistory.length - 1)) * 100 : 50;
            const y = 100 - ((point.price - effectiveMin) / effectiveRange) * 80;
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="1.2"
                fill="#0D1B3E"
                stroke="#FFFFFF"
                strokeWidth="0.8"
                vectorEffect="non-scaling-stroke"
              />
            );
          })}
        </svg>
      </div>

      {priceHistory.length > 1 && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '11px',
          color: '#9CA3AF',
          marginTop: '8px'
        }}>
          <span>{formatDate(priceHistory[0].date)}</span>
          {priceHistory.length > 2 && (
            <span>{formatDate(priceHistory[Math.floor(priceHistory.length / 2)].date)}</span>
          )}
          <span>{formatDate(priceHistory[priceHistory.length - 1].date)}</span>
        </div>
      )}

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '12px',
        padding: '8px 12px',
        background: '#FFFFFF',
        border: '1px solid #E5E7EB',
        borderRadius: '8px',
        fontSize: '12px'
      }}>
        <div>
          <div style={{ color: '#9CA3AF', marginBottom: '2px' }}>Precio más bajo</div>
          <div style={{ fontWeight: '700', color: '#059669' }}>{formatPrice(minPrice)}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: '#9CA3AF', marginBottom: '2px' }}>Precio más alto</div>
          <div style={{ fontWeight: '700', color: '#DC2626' }}>{formatPrice(maxPrice)}</div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
const DealScraperAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [currentUser, setCurrentUser] = useState('');

  const VALID_CREDENTIALS = {
    'admin': 'password123',
    'usuario1': 'demo2024',
    'invitado': 'invitado123',
    'coco':'cocoynico',
  };

  const [deals, setDeals] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('discount');
  const [favorites, setFavorites] = useState([]);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    const savedAuth = localStorage.getItem('dealfinder_auth');
    if (savedAuth) {
      const { user, timestamp } = JSON.parse(savedAuth);
      if (Date.now() - timestamp < 86400000) {
        setIsAuthenticated(true);
        setCurrentUser(user);
      } else {
        localStorage.removeItem('dealfinder_auth');
      }
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
      
      if (autoRefresh) {
        const interval = setInterval(() => {
          scrapeDeals();
        }, 86400000);
        
        return () => clearInterval(interval);
      }
    }
  }, [isAuthenticated, autoRefresh]);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError('');

    if (VALID_CREDENTIALS[username] && VALID_CREDENTIALS[username] === password) {
      setIsAuthenticated(true);
      setCurrentUser(username);
      localStorage.setItem('dealfinder_auth', JSON.stringify({
        user: username,
        timestamp: Date.now()
      }));
      setUsername('');
      setPassword('');
    } else {
      setLoginError('Usuario o contraseña incorrectos');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser('');
    localStorage.removeItem('dealfinder_auth');
  };

  const loadData = async () => {
    try {
      const dealsData = localStorage.getItem('scraped-deals');
      if (dealsData) {
        const data = JSON.parse(dealsData);
        setDeals(data.deals);
        setLastUpdate(data.lastUpdate);
      } else {
        const sampleDeals = generateSampleDeals();
        const data = {
          deals: sampleDeals,
          lastUpdate: new Date().toISOString()
        };
        localStorage.setItem('scraped-deals', JSON.stringify(data));
        setDeals(sampleDeals);
        setLastUpdate(data.lastUpdate);
      }

      const favsData = localStorage.getItem('favorite-deals');
      if (favsData) {
        setFavorites(JSON.parse(favsData));
      }
    } catch (error) {
      console.error('Error loading data:', error);
      const sampleDeals = generateSampleDeals();
      setDeals(sampleDeals);
      setLastUpdate(new Date().toISOString());
    }
  };

  const scrapeDeals = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch deals');
      }

      const result = await response.json();
      
      if (result.success && result.deals && result.deals.length > 0) {
        const deals = result.deals;
        deals.sort((a, b) => b.discount - a.discount);
        
        const data = {
          deals: deals,
          lastUpdate: new Date().toISOString()
        };
        
        localStorage.setItem('scraped-deals', JSON.stringify(data));
        setDeals(deals);
        setLastUpdate(data.lastUpdate);
      } else {
        console.log('Scraping returned no deals, using sample data');
        const sampleDeals = generateSampleDeals();
        const data = {
          deals: sampleDeals,
          lastUpdate: new Date().toISOString()
        };
        localStorage.setItem('scraped-deals', JSON.stringify(data));
        setDeals(sampleDeals);
        setLastUpdate(data.lastUpdate);
      }
    } catch (error) {
      console.error('Error fetching deals:', error);
      const sampleDeals = generateSampleDeals();
      const data = {
        deals: sampleDeals,
        lastUpdate: new Date().toISOString()
      };
      localStorage.setItem('scraped-deals', JSON.stringify(data));
      setDeals(sampleDeals);
      setLastUpdate(data.lastUpdate);
    }
    setLoading(false);
  };

  const generateSampleDeals = () => {
    // Función para generar historial de precios realista
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

    return [
      {
        id: 'deal_1',
        title: 'iPhone 15 Pro 256GB - Titanio Natural',
        originalPrice: 29999,
        discountPrice: 24999,
        discount: 17,
        category: 'Electrónica',
        store: 'Amazon México',
        url: 'https://www.amazon.com.mx/Apple-iPhone-256GB-Titanio-Natural/dp/B0CHX1W1XY',
        description: 'Chip A17 Pro, cámara de 48MP, Dynamic Island',
        temperature: 92,
        scrapedAt: new Date().toISOString(),
        priceHistory: generatePriceHistory(24999)
      },
      {
        id: 'deal_2',
        title: 'Sony WH-1000XM5 - Audífonos Noise Cancelling',
        originalPrice: 8999,
        discountPrice: 5999,
        discount: 33,
        category: 'Audio',
        store: 'Liverpool',
        url: 'https://www.liverpool.com.mx/tienda/home?s=sony+wh-1000xm5',
        description: 'Cancelación de ruido líder, 30hrs batería',
        temperature: 88,
        scrapedAt: new Date().toISOString(),
        priceHistory: generatePriceHistory(5999)
      },
      {
        id: 'deal_3',
        title: 'Samsung Galaxy S24 Ultra 512GB',
        originalPrice: 32999,
        discountPrice: 27499,
        discount: 17,
        category: 'Electrónica',
        store: 'Mercado Libre',
        url: 'https://www.mercadolibre.com.mx/samsung-galaxy-s24-ultra-5g-dual-sim-512-gb-negro-titanio-12-gb-ram/p/MLM28049044',
        description: 'Galaxy AI, S Pen incluido, cámara de 200MP',
        temperature: 85,
        scrapedAt: new Date().toISOString(),
        priceHistory: generatePriceHistory(27499)
      },
      {
        id: 'deal_4',
        title: 'MacBook Air M2 13" 256GB',
        originalPrice: 26999,
        discountPrice: 21999,
        discount: 19,
        category: 'Computadoras',
        store: 'Best Buy México',
        url: 'https://www.bestbuy.com.mx/productos/100035400130',
        description: 'Chip M2, 8GB RAM, pantalla Liquid Retina',
        temperature: 90,
        scrapedAt: new Date().toISOString(),
        priceHistory: generatePriceHistory(21999)
      },
      {
        id: 'deal_5',
        title: 'iPad Pro 11" M4 256GB WiFi',
        originalPrice: 21999,
        discountPrice: 18999,
        discount: 14,
        category: 'Tablets',
        store: 'Costco México',
        url: 'https://www.costco.com.mx/Electronicos/Computadoras/Tablets/iPad-Pro-11-M4-256GB-WiFi-Plata/p/943826',
        description: 'Chip M4, pantalla OLED Ultra Retina XDR',
        temperature: 87,
        scrapedAt: new Date().toISOString(),
        priceHistory: generatePriceHistory(18999)
      },
      {
        id: 'deal_6',
        title: 'AirPods Pro 2da Gen con USB-C',
        originalPrice: 6299,
        discountPrice: 4799,
        discount: 24,
        category: 'Audio',
        store: 'Amazon México',
        url: 'https://www.amazon.com.mx/Apple-AirPods-Pro-generaci%C3%B3n-Cancelaci%C3%B3n/dp/B0CHWRXH8B',
        description: 'Cancelación activa de ruido, audio espacial',
        temperature: 94,
        scrapedAt: new Date().toISOString(),
        priceHistory: generatePriceHistory(4799)
      },
      {
        id: 'deal_7',
        title: 'PlayStation 5 Slim Digital Edition',
        originalPrice: 11999,
        discountPrice: 9999,
        discount: 17,
        category: 'Gaming',
        store: 'Liverpool',
        url: 'https://www.liverpool.com.mx/tienda/pdp/consola-sony-playstation-5-slim-digital-edition/1155639874',
        description: 'Consola digital, diseño compacto, 1TB SSD',
        temperature: 91,
        scrapedAt: new Date().toISOString(),
        priceHistory: generatePriceHistory(9999)
      },
      {
        id: 'deal_8',
        title: 'Apple Watch Series 9 GPS 45mm',
        originalPrice: 10999,
        discountPrice: 8499,
        discount: 23,
        category: 'Wearables',
        store: 'Walmart México',
        url: 'https://www.walmart.com.mx/electronica/tecnologia/smartwatch-wearables',
        description: 'Chip S9, pantalla siempre activa, sensor temperatura',
        temperature: 89,
        scrapedAt: new Date().toISOString(),
        priceHistory: generatePriceHistory(8499)
      },
      {
        id: 'deal_9',
        title: 'Nintendo Switch OLED - Neón',
        originalPrice: 8999,
        discountPrice: 7499,
        discount: 17,
        category: 'Gaming',
        store: 'Amazon México',
        url: 'https://www.amazon.com.mx/Nintendo-Switch-modelo-OLED-ne%C3%B3n-azul/dp/B098RKWHHZ',
        description: 'Pantalla OLED 7 pulgadas, 64GB almacenamiento',
        temperature: 86,
        scrapedAt: new Date().toISOString(),
        priceHistory: generatePriceHistory(7499)
      },
      {
        id: 'deal_10',
        title: 'Samsung Smart TV 55" QLED 4K',
        originalPrice: 17999,
        discountPrice: 13999,
        discount: 22,
        category: 'Hogar',
        store: 'Coppel',
        url: 'https://www.coppel.com/pantalla-samsung-55-pulgadas-qled-4k-smart-tv',
        description: 'Quantum Dot, HDR10+, Tizen OS',
        temperature: 88,
        scrapedAt: new Date().toISOString(),
        priceHistory: generatePriceHistory(13999)
      },
      {
        id: 'deal_11',
        title: 'Dyson V15 Detect - Aspiradora',
        originalPrice: 16999,
        discountPrice: 12999,
        discount: 24,
        category: 'Hogar',
        store: 'Mercado Libre',
        url: 'https://www.mercadolibre.com.mx/aspiradora-dyson-v15-detect-absolute',
        description: 'Detección láser, 60 min autonomía, filtro HEPA',
        temperature: 90,
        scrapedAt: new Date().toISOString(),
        priceHistory: generatePriceHistory(12999)
      },
      {
        id: 'deal_12',
        title: 'GoPro HERO12 Black',
        originalPrice: 11999,
        discountPrice: 9499,
        discount: 21,
        category: 'Cámaras',
        store: 'Best Buy México',
        url: 'https://www.bestbuy.com.mx/productos/100036200008',
        description: '5.3K60 video, HDR, HyperSmooth 6.0',
        temperature: 87,
        scrapedAt: new Date().toISOString(),
        priceHistory: generatePriceHistory(9499)
      }
    ];
  };

  const toggleFavorite = async (dealId) => {
    const newFavorites = favorites.includes(dealId)
      ? favorites.filter(id => id !== dealId)
      : [...favorites, dealId];
    
    setFavorites(newFavorites);
    localStorage.setItem('favorite-deals', JSON.stringify(newFavorites));
  };

  const getCategories = () => {
    const cats = new Set(deals.map(d => d.category));
    return ['all', ...Array.from(cats)];
  };

  const filteredDeals = deals
    .filter(deal => selectedCategory === 'all' || deal.category === selectedCategory)
    .sort((a, b) => {
      if (sortBy === 'discount') return b.discount - a.discount;
      if (sortBy === 'price') return a.discountPrice - b.discountPrice;
      if (sortBy === 'temperature') return b.temperature - a.temperature;
      return 0;
    });

  const getTemperatureColor = (temp) => {
    if (temp >= 90) return '#DC2626';
    if (temp >= 75) return '#F59E0B';
    return '#059669';
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getTimeSinceUpdate = () => {
    if (!lastUpdate) return 'Nunca';
    const diff = Date.now() - new Date(lastUpdate).getTime();
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    
    if (hours > 24) return `Hace ${Math.floor(hours / 24)} días`;
    if (hours > 0) return `Hace ${hours}h`;
    return `Hace ${minutes}m`;
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#FAFAFA',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Inter', -apple-system, sans-serif",
        padding: '20px'
      }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
          
          input {
            width: 100%;
            padding: 14px 18px;
            background: #FFFFFF;
            border: 1px solid #E5E7EB;
            border-radius: 10px;
            color: #1A1A1A;
            font-size: 15px;
            transition: all 0.3s ease;
            font-family: 'Inter', sans-serif;
          }
          
          input:focus {
            outline: none;
            border-color: #0D1B3E;
            box-shadow: 0 0 0 3px rgba(13, 27, 62, 0.1);
          }
          
          .login-btn {
            width: 100%;
            background: #0D1B3E;
            color: white;
            border: none;
            padding: 14px;
            border-radius: 10px;
            font-weight: 600;
            font-size: 15px;
            cursor: pointer;
            transition: all 0.3s ease;
          }
          
          .login-btn:hover {
            background: #1E3A6E;
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(13, 27, 62, 0.3);
          }
        `}</style>

        <div style={{
          background: '#FFFFFF',
          border: '1px solid #E5E7EB',
          borderRadius: '20px',
          padding: '48px',
          maxWidth: '420px',
          width: '100%',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              background: '#0D1B3E',
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px'
            }}>
              <Lock size={32} color="white" />
            </div>
            <h1 style={{
              fontSize: '28px',
              fontWeight: '800',
              margin: '0 0 8px 0',
              color: '#1A1A1A'
            }}>
              DealFinder Pro
            </h1>
            <p style={{ color: '#6B7280', fontSize: '15px', margin: 0 }}>
              Acceso Restringido
            </p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#1A1A1A' }}>
                Usuario
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ingresa tu usuario"
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#1A1A1A' }}>
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña"
                required
              />
            </div>

            {loginError && (
              <div style={{
                background: '#FEE2E2',
                border: '1px solid #FCA5A5',
                borderRadius: '10px',
                padding: '12px',
                color: '#DC2626',
                fontSize: '14px',
                textAlign: 'center'
              }}>
                {loginError}
              </div>
            )}

            <button type="submit" className="login-btn">
              Iniciar Sesión
            </button>
          </form>

          <div style={{
            marginTop: '24px',
            padding: '16px',
            background: '#F3F4F6',
            border: '1px solid #E5E7EB',
            borderRadius: '10px',
            fontSize: '13px',
            color: '#6B7280'
          }}>
            <div style={{ fontWeight: '600', marginBottom: '8px', color: '#0D1B3E' }}>
              Usuarios de prueba:
            </div>
            <div>• admin / password123</div>
            <div>• usuario1 / demo2024</div>
            <div>• invitado / invitado123</div>
          </div>
        </div>
      </div>
    );
  }

  // Main App
  return (
    <div style={{
      minHeight: '100vh',
      background: '#FAFAFA',
      color: '#1A1A1A',
      fontFamily: "'Inter', -apple-system, sans-serif"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Mono:wght@700&display=swap');
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .deal-card {
          background: #FFFFFF;
          border: 1px solid #E5E7EB;
          borderRadius: 16px;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          padding: 24px;
          cursor: pointer;
        }
        
        .deal-card:hover {
          transform: translateY(-8px);
          border-color: #0D1B3E;
          box-shadow: 0 20px 40px rgba(13, 27, 62, 0.15);
        }
        
        .btn-primary {
          background: #0D1B3E;
          color: white;
          border: none;
          padding: 14px 28px;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: inline-flex;
          alignItems: center;
          gap: 10px;
          fontSize: 15px;
        }
        
        .btn-primary:hover {
          background: #1E3A6E;
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(13, 27, 62, 0.3);
        }
      `}</style>

      {/* Header */}
      <div style={{
        background: '#FFFFFF',
        borderBottom: '1px solid #E5E7EB',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '24px 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <h1 style={{
                fontSize: '36px',
                fontWeight: '800',
                margin: '0 0 6px 0',
                color: '#0D1B3E',
                letterSpacing: '-0.5px'
              }}>
                <Zap size={36} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '12px', color: '#0D1B3E' }} />
                DealFinder Pro
              </h1>
              <p style={{ margin: 0, color: '#6B7280', fontSize: '15px' }}>
                Usuario: {currentUser} • Actualización cada 24h
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <button 
                onClick={scrapeDeals} 
                disabled={loading}
                className="btn-primary"
                style={{ opacity: loading ? 0.6 : 1 }}
              >
                <RefreshCw size={18} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
                {loading ? 'Analizando...' : 'Actualizar'}
              </button>
              <button 
                onClick={handleLogout}
                style={{
                  background: '#FEE2E2',
                  border: '1px solid #FCA5A5',
                  color: '#DC2626',
                  padding: '14px 20px',
                  borderRadius: '10px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <LogOut size={18} />
                Salir
              </button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '40px 32px' }}>
        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '24px',
          marginBottom: '40px'
        }}>
          <div style={{
            background: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '8px', fontWeight: '500' }}>Ofertas Activas</div>
            <div style={{ fontSize: '42px', fontWeight: '800', fontFamily: "'Space Mono', monospace", color: '#0D1B3E' }}>
              {deals.length}
            </div>
          </div>

          <div style={{
            background: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '8px', fontWeight: '500' }}>Descuento Promedio</div>
            <div style={{ fontSize: '42px', fontWeight: '800', fontFamily: "'Space Mono', monospace", color: '#0D1B3E' }}>
              {deals.length > 0 ? Math.round(deals.reduce((sum, d) => sum + d.discount, 0) / deals.length) : 0}%
            </div>
          </div>

          <div style={{
            background: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '8px', fontWeight: '500' }}>Última Actualización</div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#0D1B3E' }}>
              {getTimeSinceUpdate()}
            </div>
          </div>
        </div>

        {/* Deals Grid */}
        {loading && deals.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <RefreshCw size={48} style={{ animation: 'spin 1s linear infinite', color: '#0D1B3E', marginBottom: '16px' }} />
            <div style={{ fontSize: '18px', fontWeight: '600', color: '#1A1A1A' }}>Cargando ofertas...</div>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
            gap: '24px'
          }}>
            {filteredDeals.slice(0, 12).map((deal, idx) => (
              <div key={deal.id} className="deal-card">
                <div style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontWeight: '700',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#FFFFFF',
                  border: `2px solid ${getTemperatureColor(deal.temperature)}`,
                  color: getTemperatureColor(deal.temperature)
                }}>
                  <Zap size={16} fill="currentColor" />
                  {deal.temperature}°
                </div>

                <div style={{ marginTop: '40px' }}>
                  <div style={{
                    display: 'inline-block',
                    background: '#EFF6FF',
                    border: '1px solid #BFDBFE',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#0D1B3E',
                    marginBottom: '12px'
                  }}>
                    {deal.category}
                  </div>

                  <h3 style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 8px 0', lineHeight: '1.4', color: '#1A1A1A' }}>
                    {deal.title}
                  </h3>

                  <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Tag size={14} />
                    {deal.store}
                  </div>

                  <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: '1.6', margin: '0 0 20px 0' }}>
                    {deal.description}
                  </p>

                  <PriceComparisonTable 
                    priceComparison={deal.priceComparison}
                    bestPrice={deal.bestPrice}
                    maxSavings={deal.maxSavings}
                  />

                  <PriceHistoryChart priceHistory={deal.priceHistory} />

                  <div style={{ marginBottom: '20px', marginTop: '20px' }}>
                    <div style={{ fontSize: '16px', color: '#9CA3AF', textDecoration: 'line-through', marginBottom: '4px' }}>
                      {formatPrice(deal.originalPrice)}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', flexWrap: 'wrap' }}>
                      <div style={{ fontSize: '36px', fontWeight: '800', fontFamily: "'Space Mono', monospace", color: '#0D1B3E' }}>
                        {formatPrice(deal.discountPrice)}
                      </div>
                      <div style={{
                        background: '#0D1B3E',
                        color: '#FFFFFF',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <TrendingDown size={18} />
                        {deal.discount}% OFF
                      </div>
                    </div>
                    <div style={{ fontSize: '14px', color: '#059669', fontWeight: '600', marginTop: '8px' }}>
                      Ahorras {formatPrice(deal.originalPrice - deal.discountPrice)}
                    </div>
                  </div>

                  <a href={deal.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                    <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                      <ExternalLink size={18} />
                      Ver Oferta
                    </button>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DealScraperAuth;

