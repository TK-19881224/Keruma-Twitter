import React, { useEffect, useState } from 'react';
import Header from './Header';

const API_KEY = '05705a3955534e58b404448e6b0a95db';
const SYMBOL = 'AAPL';

function AppleStock() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchStock = async () => {

      try {
        const res = await fetch(
          `https://api.twelvedata.com/time_series?symbol=${SYMBOL}&interval=1min&apikey=${API_KEY}`
        );
        const json = await res.json();
        if (json.values) {
          setData(json.values.slice(0, 10));
        }
      } catch (error) {
        console.error('データ取得エラー:', error);
      }
    };

    fetchStock();
  }, []);

  return (
    <>
      <Header />
      <div className="p-4 bg-white rounded shadow pt-24">
        <h2 className="text-xl font-bold">Apple 株価（最新）</h2>
        <ul>
          {data.map((item, index) => (
            <li key={index} className="border-b py-1">
              {item.datetime} - {item.close} USD
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

export default AppleStock;