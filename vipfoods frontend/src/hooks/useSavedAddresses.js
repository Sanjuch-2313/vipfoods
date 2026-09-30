import { useEffect, useState } from "react";

export const ADDRESS_STORAGE_KEY = "vipfoods_user_addresses";
const ADDRESS_CHANGE_EVENT = "vipfoods-addresses-changed";

export function readAddresses() {
  try {
    const saved = JSON.parse(localStorage.getItem(ADDRESS_STORAGE_KEY) || "[]");
    return Array.isArray(saved)
      ? saved.filter((address) => address && address.id != null && typeof address.line1 === "string")
      : [];
  } catch {
    return [];
  }
}

export function writeAddresses(addresses) {
  localStorage.setItem(ADDRESS_STORAGE_KEY, JSON.stringify(addresses));
  window.dispatchEvent(new Event(ADDRESS_CHANGE_EVENT));
}

export default function useSavedAddresses() {
  const [addresses, setAddresses] = useState(readAddresses);

  useEffect(() => {
    const refresh = () => setAddresses(readAddresses());
    window.addEventListener("storage", refresh);
    window.addEventListener(ADDRESS_CHANGE_EVENT, refresh);
    refresh();
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener(ADDRESS_CHANGE_EVENT, refresh);
    };
  }, []);

  return addresses;
}
