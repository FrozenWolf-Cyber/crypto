import { useEffect, useState } from "react";
const BASE_URL = "http://localhost:8000";

export function useTRL() {
  const [data, setData] = useState([]);

  useEffect(() => {
    async function fetchTRL() {
      try {
        const response = await fetch(
          `${BASE_URL}/trl?start=2025-08-09T10:00:00&end=2025-10-04T12:00:00`
        );

        // log raw text
        const text = await response.text();
        console.log("Raw TRL response:", text);

        // now parse if it's JSON
        const json = JSON.parse(text);
        const parsed = json.map((d) => ({ ...d, date: new Date(d.date) }));
        setData(parsed);
      } catch (err) {
        console.error("Error fetching prices:", err);
      }
    }

    fetchTRL();
  }, []);

  return data;
}
