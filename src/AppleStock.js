import React, { useEffect, useState } from 'react';
import Header from './Header';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, ReferenceDot
} from 'recharts';

const API_KEY = '05705a3955534e58b404448e6b0a95db';
const SYMBOL = 'AAPL';

function generateSignals(data) {
  return data.map((item, index, arr) => {
    if (index === 0) return { ...item, signal: null };

    const prev = arr[index - 1];
    if (item.close > prev.close) {
      return { ...item, signal: 'BUY' };
    }
    if (item.close < prev.close) {
      return { ...item, signal: 'SELL' };
    }

    return { ...item, signal: null };
  });
}

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
          const reversed = [...json.values].reverse();
          const parsed = reversed.map(item => {
            const [date, time] = item.datetime.split(' ');
            const [year, month, day] = date.split('-');
            return {
              datetime: `${year}/${month}/${day} ${time}`,
              close: parseFloat(item.close),
            };
          });

          const signalData = generateSignals(parsed);
          setData(signalData.slice(-20));
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
        <h2 className="text-xl font-bold mb-4">Apple 株価 + 売買シグナル</h2>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
              <XAxis dataKey="datetime" />
              <YAxis domain={['auto', 'auto']} />
              <Tooltip />
              <Line type="monotone" dataKey="close" stroke="#007aff" dot={false} name="終値" />

              {data.map((item, index) =>
                item.signal ? (
                  <ReferenceDot
                    key={index}
                    x={item.datetime}
                    y={item.close}
                    r={5}
                    fill={item.signal === 'BUY' ? 'green' : 'red'}
                    stroke="black"
                    strokeWidth={1}
                    label={{
                      value: item.signal,
                      position: 'top',
                      fontSize: 10,
                      fill: item.signal === 'BUY' ? 'green' : 'red',
                    }}
                  />
                ) : null
              )}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p>読み込み中...</p>
        )}
      </div>
    </>
  );
}

export default AppleStock;