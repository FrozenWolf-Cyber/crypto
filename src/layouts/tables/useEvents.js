import { useEffect, useState } from "react";

const BASE_URL = "https://crypto-backend.gokuladethya.uk";

export function useEvents({ dagName, limit }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    async function fetchEvents() {
      try {
        // Build query string dynamically
        const params = new URLSearchParams();
        if (dagName) params.append("dag_name", dagName);
        if (limit) params.append("limit", limit);

        const url = `${BASE_URL}/status/events?${params.toString()}`;
        console.log("Fetching:", url);

        const response = await fetch(url);
        const text = await response.text();
        console.log("Raw response:", text);

        const json = JSON.parse(text);
        setData(json);
      } catch (err) {
        console.error("Error fetching events:", err);
      }
    }

    fetchEvents();
  }, [dagName, limit]);

  return data;
}
