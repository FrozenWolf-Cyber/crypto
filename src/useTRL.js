import { useEffect, useState, useRef } from "react";
const BASE_URL = "https://crypto-backend.gokuladethya.uk";

// Helper: get last 6 months
function sixMonthsAgo() {
  const d = new Date();
  d.setMonth(d.getMonth() - 6);
  return d.toISOString();
}

// LocalStorage helpers
function getLocalData() {
  const raw = localStorage.getItem("trlData");
  return raw ? JSON.parse(raw) : [];
}

function setLocalData(d) {
  localStorage.setItem("trlData", JSON.stringify(d));
}

function getLocalFingerprint() {
  return localStorage.getItem("lastTRLFingerprint") || null;
}

function setLocalFingerprint(f) {
  localStorage.setItem("lastTRLFingerprint", f);
}

// Fetch TRL fingerprint (optional, if you have an endpoint, else skip)
async function fetchTRLFingerprint() {
  try {
    const res = await fetch(`${BASE_URL}/last_success`);
    const json = await res.json();
    console.log("TRL Fingerprint response:", json);
    return json.overall_last_sync;
  } catch (err) {
    console.error("Error fetching TRL fingerprint:", err);
    return null;
  }
}

// Fetch TRL data
async function fetchTRL(start, end) {
  try {
    console.log(`Fetching TRL from ${start} to ${end}`);
    const res = await fetch(`${BASE_URL}/trl?start=${start}&end=${end}`);
    const text = await res.text();
    console.log("Raw TRL response:", text);
    const json = JSON.parse(text);
    return json.map((d) => ({ ...d, date: d.date })); // keep date as string
  } catch (err) {
    console.error("Error fetching TRL:", err);
    return [];
  }
}

export function useTRL(reloadTrigger = 0) {
  const [data, setData] = useState([]);
  const intervalRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    async function updateData() {
      if (!isMounted) return;

      const currentData = getLocalData();
      const lastFingerprintStored = getLocalFingerprint();
      const currentFingerprint = await fetchTRLFingerprint();

      // If fingerprint changed, reset cache
      if (lastFingerprintStored && lastFingerprintStored !== currentFingerprint) {
        console.log("TRL Fingerprint changed. Clearing cache...");
        localStorage.removeItem("trlData");
        localStorage.removeItem("lastTRLFingerprint");
        setData([]);
      }

      setLocalFingerprint(currentFingerprint);

      const now = new Date();
      const startTime =
        currentData.length === 0 ? sixMonthsAgo() : currentData[currentData.length - 1].date;
      const endTime = now.toISOString();

      const newTRL = await fetchTRL(startTime, endTime);
      console.log("Fetched TRL entries:", newTRL.length);

      const updatedData = [
        ...currentData,
        ...newTRL.filter(
          (newItem) => !currentData.some((oldItem) => oldItem.link === newItem.link)
        ),
      ];

      if (updatedData.length > 0) {
        setData(updatedData);
        setLocalData(updatedData);
        console.log("Updated TRL data length:", updatedData.length);
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
