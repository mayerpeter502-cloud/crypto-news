'use client';
import { useEffect, useState } from 'react';

export default function PriceTicker() {
  const [prices, setPrices] = useState<any>(null);

  const fetchPrices = async () => {
    try {
      const timestamp = new Date().getTime();
      // Используем надежный прокси для обхода CORS
      const proxyUrl = 'https://api.allorigins.win/get?url=';
      const targetUrl = encodeURIComponent(
        `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,binancecoin,cardano,ripple,polkadot&vs_currencies=usd&include_24hr_change=true&_nocache=${timestamp}`
      );

      const response = await fetch(`${proxyUrl}${targetUrl}`, { cache: 'no-store' });
      
      if (response.ok) {
        const wrapper = await response.json();
        const data = JSON.parse(wrapper.contents);
        
        // Проверяем, что API вернуло ожидаемые данные, прежде чем сохранять их
        if (data && data.bitcoin) {
          setPrices(data);
        }
      }
    } catch (err) {
      console.log("Ожидание API...");
    }
  };

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 60000);
    return () => clearInterval(interval);
  }, []);

  const List = () => (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {prices ? Object.entries(prices).map(([id, data]: any) => {
        // ДОБАВЛЕНА ПРОВЕРКА: Пропускаем отрисовку, если данные по монете неполные
        if (!data || typeof data.usd === 'undefined') return null;

        return (
          <div key={id} style={{ 
            display: 'flex', alignItems: 'center', gap: '12px', padding: '0 35px', 
            borderRight: '1px solid #222', whiteSpace: 'nowrap' 
          }}>
            <span style={{ color: '#fff', fontWeight: '900', fontSize: '13px', textTransform: 'uppercase' }}>
              {id === 'binancecoin' ? 'BNB' : id === 'ripple' ? 'XRP' : id}:
            </span>
            <span style={{ color: '#f97316', fontWeight: '800', fontSize: '14px' }}>
              ${data.usd.toLocaleString()}
            </span>
            <span style={{ fontSize: '10px', fontWeight: '900', color: (data.usd_24h_change || 0) >= 0 ? '#22c55e' : '#ef4444' }}>
              {(data.usd_24h_change || 0) >= 0 ? '▲' : '▼'} {Math.abs(data.usd_24h_change || 0).toFixed(2)}%
            </span>
          </div>
        );
      }) : (
        <div style={{ color: '#555', padding: '0 40px', fontSize: '12px', fontWeight: 'bold' }}>
          ОБНОВЛЕНИЕ ДАННЫХ РЫНКА...
        </div>
      )}
    </div>
  );

  return (
    <div style={{ 
      backgroundColor: '#000', borderTop: '1px solid #222', borderBottom: '1px solid #222', 
      padding: '12px 0', overflow: 'hidden', width: '100%' 
    }}>
      <div className="animate-marquee" style={{ display: 'flex' }}>
        <List />
        <List />
        <List />
      </div>
    </div>
  );
}