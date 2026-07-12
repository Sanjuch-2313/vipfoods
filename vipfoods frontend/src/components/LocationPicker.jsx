import { motion, AnimatePresence } from "framer-motion";
import { FiMapPin, FiLoader, FiX, FiCheck, FiAlertCircle } from "react-icons/fi";
import { useState, useRef, useEffect } from "react";
import { useLocationContext } from "../context/LocationContext";


async function fetchAddressFromCoords(lat, lon) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
  );
  if (!res.ok) throw new Error("Could not resolve address");
  const data = await res.json();
  return data.display_name || `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
}

export default function LocationPicker({ onLocationChange }) {
  const {
    location,
    setLocation,
    isPickerOpen,
    openPicker,
    closePicker,
    required,
  } = useLocationContext();

  const [manualValue, setManualValue] = useState("");
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const wrapperRef = useRef(null);
  const panelRef = useRef(null);
  const [panelPosition, setPanelPosition] = useState({
    top: 88,
    left: 16,
  });

  const updatePanelPosition = () => {
    const rect = wrapperRef.current?.getBoundingClientRect();

    if (!rect) {
      return;
    }

    const panelWidth = Math.min(340, window.innerWidth - 24);
    const left = Math.min(
      Math.max(12, rect.left),
      window.innerWidth - panelWidth - 12
    );

    setPanelPosition({
      top: rect.bottom + 12,
      left,
    });
  };

  useEffect(() => {
    if (required) return;
    function handleClickOutside(e) {
      const clickedTrigger = wrapperRef.current?.contains(e.target);
      const clickedPanel = panelRef.current?.contains(e.target);

      if (!clickedTrigger && !clickedPanel) {
        closePicker();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [required, closePicker]);

  useEffect(() => {
    if (!isPickerOpen || required) {
      return undefined;
    }

    updatePanelPosition();
    window.addEventListener("resize", updatePanelPosition);
    window.addEventListener("scroll", updatePanelPosition, true);

    return () => {
      window.removeEventListener("resize", updatePanelPosition);
      window.removeEventListener("scroll", updatePanelPosition, true);
    };
  }, [isPickerOpen, required]);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setStatus("error");
      setErrorMsg("Your browser doesn't support location detection.");
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          let address = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

          try {
            address = await fetchAddressFromCoords(latitude, longitude);
          } catch {
            setErrorMsg("");
          }

          const coords = { lat: latitude, lon: longitude };
          setLocation(address, coords);
          onLocationChange?.(address, coords);
          setStatus("idle");
        } catch {
          setStatus("error");
          setErrorMsg("Couldn't save your location. Please try again.");
        }
      },
      () => {
        setStatus("error");
        setErrorMsg("Couldn't get your location. Please enter it manually.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualValue.trim()) return;
    setLocation(manualValue.trim(), null);
    setManualValue("");
  };

  const panelContent = (
    <motion.div
      initial={required ? { opacity: 0, y: 20, scale: 0.96 } : { opacity: 0, y: -8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={required ? { opacity: 0, y: 20, scale: 0.96 } : { opacity: 0, y: -8, scale: 0.97 }}
      transition={{ duration: 0.18 }}
      className={
        required
          ? "w-[92%] max-w-[380px] rounded-3xl p-6 sm:p-7 backdrop-blur-2xl bg-white/90 border border-white/70 shadow-[0_30px_80px_rgba(154,52,18,0.35)]"
          : "fixed z-[5000] w-[min(340px,calc(100vw-24px))] rounded-3xl p-5 sm:p-6 backdrop-blur-2xl bg-white/95 border border-white/70 shadow-[0_20px_60px_rgba(154,52,18,0.25)]"
      }
      style={
        required
          ? undefined
          : {
              top: `${panelPosition.top}px`,
              left: `${panelPosition.left}px`,
            }
      }
      ref={required ? undefined : panelRef}
    >
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-stone-900 font-bold text-base">
          {required ? "Delivery location needed" : "Delivery location"}
        </h4>
        {!required && (
          <button onClick={closePicker} className="text-stone-400 hover:text-stone-700 transition-colors" aria-label="Close">
            <FiX size={18} />
          </button>
        )}
      </div>

      {required && (
        <p className="flex items-start gap-2 text-stone-600 text-sm mb-4 leading-6">
          <FiAlertCircle className="text-red-600 shrink-0 mt-0.5" size={16} />
          We need your delivery location to check what's available and place your order.
        </p>
      )}

      <button
        onClick={handleUseCurrentLocation}
        disabled={status === "loading"}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-orange-500 text-white font-semibold text-sm shadow-[0_10px_25px_rgba(194,65,12,0.35)] hover:shadow-[0_15px_35px_rgba(194,65,12,0.5)] transition-shadow disabled:opacity-70"
      >
        {status === "loading" ? (
          <>
            <FiLoader className="animate-spin" size={16} />
            Detecting location…
          </>
        ) : (
          <>
            <FiMapPin size={16} />
            Use current location
          </>
        )}
      </button>

      {status === "error" && <p className="text-red-600 text-xs mt-3 leading-5">{errorMsg}</p>}

      <div className="flex items-center gap-3 my-4">
        <div className="h-px flex-1 bg-stone-200"></div>
        <span className="text-stone-400 text-xs font-medium">OR</span>
        <div className="h-px flex-1 bg-stone-200"></div>
      </div>

      <form onSubmit={handleManualSubmit} className="flex items-center gap-2">
        <input
          type="text"
          value={manualValue}
          onChange={(e) => setManualValue(e.target.value)}
          placeholder="Enter area, street or pincode"
          className="flex-1 px-4 py-3 rounded-2xl border border-stone-200 bg-white/70 text-stone-800 text-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-300"
        />
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          type="submit"
          aria-label="Confirm location"
          className="w-11 h-11 shrink-0 rounded-2xl bg-stone-900 text-white flex items-center justify-center"
        >
          <FiCheck size={18} />
        </motion.button>
      </form>
    </motion.div>
  );

  return (
    <div className="relative" ref={wrapperRef}>
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        type="button"
        onClick={() => {
          updatePanelPosition();
          openPicker();
        }}
        className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/60 backdrop-blur-xl border border-white/70 shadow text-stone-800 font-medium text-sm sm:text-base max-w-[220px] sm:max-w-xs"
      >
        <FiMapPin className="text-red-600 shrink-0" size={18} />
        <span className="truncate">{location || "Set delivery location"}</span>
      </motion.button>

      <AnimatePresence>
        {isPickerOpen && !required && panelContent}
      </AnimatePresence>

      <AnimatePresence>
        {isPickerOpen && required && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-900/60 backdrop-blur-sm px-4"
          >
            {panelContent}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
