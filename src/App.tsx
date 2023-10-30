import { useState, useEffect } from "react";
import axios from "axios";

import "./App.css";

function App() {
  const [currencies, setCurrencies] = useState({
    from: "UZS",
    to: "USD",
    exchange_rate: 0,
  });

  useEffect(() => {
    (async () => {
      const savedData = localStorage.getItem("exchangeData");
      if (savedData) {
        const { timestamp, exchange_rate } = JSON.parse(savedData);

        if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
          setCurrencies({
            ...currencies,
            exchange_rate,
          });
          return;
        }
      }

      try {
        const result = await axios.get(`https://open.er-api.com/v6/latest/USD`);

        if (result.data.result === "success") {
          const exchange_rate = result.data.rates.UZS;
          localStorage.setItem(
            "exchangeData",
            JSON.stringify({ timestamp: Date.now(), exchange_rate })
          );
        }
      } catch (err) {
        console.error("Failed to fetch exchange rate:", err);
      }
    })();
  }, [currencies]);

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          {/* <img src={viteLogo} className="logo" alt="Vite logo" /> */}
        </a>
        <a href="https://react.dev" target="_blank">
          {/* <img src={reactLogo} className="logo react" alt="React logo" /> */}
        </a>
      </div>
      <h1>Currency Converter v1</h1>
      <div className="card">
        <p>From: {currencies.from}</p>
        <p>To: {currencies.to}</p>
        <p>Exchange Rate: {currencies.exchange_rate}</p>
      </div>
      <div className="attributions">
        <p>Attributions</p>
        <a href="https://www.exchangerate-api.com">
          Rates By Exchange Rate API
        </a>
      </div>
    </>
  );
}

export default App;
