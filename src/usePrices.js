import { useEffect, useState } from "react";
const BASE_URL = "http://localhost:8000";

export function usePrices() {
  const [data, setData] = useState([]);

  useEffect(() => {
    async function fetchPrices() {
      try {
        const response = await fetch(
          `${BASE_URL}/prices/btcusdt?start=2025-08-09T10:00:00&end=2025-10-4T12:00:00&interval=1h`
        );

        // log raw text
        const text = await response.text();
        console.log("Raw response:", text);

        // now parse if it's JSON
        const json = JSON.parse(text);
        const parsed = json.map((d) => ({ ...d, date: new Date(d.open_time) }));
        setData(parsed);
      } catch (err) {
        console.error("Error fetching prices:", err);
      }
    }

    fetchPrices();
  }, []);

  return data;
}
