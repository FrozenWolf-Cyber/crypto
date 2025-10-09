import { useEffect, useState, useRef } from "react";

const BASE_URL = "https://crypto-backend.gokuladethya.uk";

// 6 months ago helper
function sixMonthsAgo() {
  const d = new Date();
  d.setMonth(d.getMonth() - 6);
  return d.toISOString();
}

// Local storage helpers
function getLocalData() {
  const raw = localStorage.getItem("pricesData");
  return raw ? JSON.parse(raw) : [];
}

function setLocalData(d) {
  localStorage.setItem("pricesData", JSON.stringify(d));
}

function getLocalFingerprint() {
  return localStorage.getItem("lastFingerprint") || null;
}

function setLocalFingerprint(f) {
  localStorage.setItem("lastFingerprint", f);
}
// Fetch fingerprint
async function fetchFingerprint() {
  try {
    const res = await fetch(`${BASE_URL}/last_success`);
    const json = await res.json();
    console.log("Fingerprint response:", json);
    return json.overall_last_sync;
  } catch (err) {
    console.error("Error fetching fingerprint:", err);
    return null;
  }
}

// Fetch prices from API
async function fetchPrices(start, end) {
  try {
    console.log(`Fetching prices from ${start} to ${end}`);
    const res = await fetch(`${BASE_URL}/prices/btcusdt?start=${start}&end=${end}&interval=1h`);
    const text = await res.text();
    console.log("Raw price response:", text);
    const json = JSON.parse(text);

    // Keep date as string
    return json.map((d) => ({ ...d, date: d.open_time }));
  } catch (err) {
    console.error("Error fetching prices:", err);
    return [];
  }
}

export function usePrices(reloadTrigger = 0) {
  // add `reloadTrigger` to useEffect dependency
  const [data, setData] = useState([]);
  const intervalRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    async function updateData() {
      if (!isMounted) return;

      const currentData = getLocalData();
      // log current data start and end date
      console.log(
        "Current data range:",
        currentData.length > 0
          ? `${currentData[0].date} to ${currentData[currentData.length - 1].date}`
          : "No data"
      );
      const lastFingerprintStored = getLocalFingerprint();
      const currentFingerprint = await fetchFingerprint();

      console.log("Stored fingerprint:", lastFingerprintStored);
      console.log("Current fingerprint:", currentFingerprint);

      // If fingerprint changed, reset data
      if (lastFingerprintStored && lastFingerprintStored !== currentFingerprint) {
        console.log("Fingerprint changed. Clearing local cache...");
        localStorage.removeItem("pricesData");
        setData([]);
      }

      setLocalFingerprint(currentFingerprint);

      const now = new Date();
      let startTime;

      if (currentData.length === 0) {
        // No data: fetch last 6 months
        startTime = sixMonthsAgo();
      } else {
        // Fetch only new data after last date
        startTime = currentData[currentData.length - 1].date; // string
      }

      const endTime = now.toISOString();
      const newPrices = await fetchPrices(startTime, endTime);
      // log length of new prices fetched
      console.log("New prices fetched:", newPrices.length);
      console.log(
        "New prices range:",
        newPrices.length > 0
          ? `${newPrices[0].date} to ${newPrices[newPrices.length - 1].date}`
          : "No new data"
      );
      const updatedData = [
        ...currentData,
        ...newPrices.filter(
          (newPrice) => !currentData.some((current) => current.date === newPrice.date)
        ),
      ];
      console.log("Total updated data length:", updatedData.length);
      // log updated data start and end date
      console.log(
        "Updated data range:",
        updatedData.length > 0
          ? `${updatedData[0].date} to ${updatedData[updatedData.length - 1].date}`
          : "No data"
      );
      if (updatedData.length > 0) {
        setData(updatedData);
        setLocalData(updatedData);
        console.log("Updated data length:", updatedData.length);
      }
    }

    // Initial fetch
    updateData();

    // Poll every 1 minute
    intervalRef.current = setInterval(updateData, 60 * 1000);

    return () => {
      isMounted = false;
      clearInterval(intervalRef.current);
    };
  }, [reloadTrigger]);

  return data;
}
