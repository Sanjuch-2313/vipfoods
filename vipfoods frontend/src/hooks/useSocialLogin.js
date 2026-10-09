import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import api from "../services/api";

const encode = (bytes) =>
  btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

export function useSocialLogin() {
  const location = useLocation();
  const [socialBusy, setBusy] = useState(false);
  const [socialError, setError] = useState("");
  const [status, setStatus] = useState({
    google: { configured: false },
    facebook: { configured: false },
    loaded: false,
  });
  const [devModal, setDevModal] = useState({ open: false, provider: null });

  // Fetch status of OAuth providers on mount
  useEffect(() => {
    let active = true;
    api
      .get("/auth/social/status")
      .then(({ data }) => {
        if (active && data) {
          setStatus({
            google: data.google || { configured: false },
            facebook: data.facebook || { configured: false },
            loaded: true,
          });
        }
      })
      .catch(() => {
        // Fallback: default to not loaded
        if (active) setStatus((prev) => ({ ...prev, loaded: true }));
      });
    return () => {
      active = false;
    };
  }, []);

  const startSocial = useCallback(
    async (provider, customData = null) => {
      if (socialBusy) return;
      setBusy(true);
      setError("");

      try {
        const verifier = encode(crypto.getRandomValues(new Uint8Array(32)));
        const challenge = encode(
          new Uint8Array(
            await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier))
          )
        );

        sessionStorage.setItem(
          "vipfoods_social_login",
          JSON.stringify({
            verifier,
            returnTo: location.state?.returnTo === "/checkout" ? "/checkout" : "/",
          })
        );

        const payload = {
          challenge,
          ...(customData?.email ? { email: customData.email } : {}),
          ...(customData?.name ? { name: customData.name } : {}),
        };

        const { data } = await api.post(`/auth/social/${provider}/start`, payload);
        if (data?.url) {
          window.location.assign(data.url);
        } else {
          throw new Error("No redirect URL received from server.");
        }
      } catch (error) {
        setError(
          error.response?.data?.message ||
            error.message ||
            "Unable to open sign-in. Please try again on HTTPS or localhost."
        );
        setBusy(false);
      }
    },
    [location.state?.returnTo, socialBusy]
  );

  const handleSocialClick = useCallback(
    (provider) => {
      setError("");
      // If we know the provider is NOT configured with real OAuth keys, show the test account modal
      const isConfigured = status[provider]?.configured;
      if (status.loaded && !isConfigured) {
        setDevModal({ open: true, provider });
      } else {
        startSocial(provider);
      }
    },
    [status, startSocial]
  );

  const closeDevModal = useCallback(() => {
    setDevModal({ open: false, provider: null });
  }, []);

  const confirmDevLogin = useCallback(
    ({ email, name }) => {
      if (!devModal.provider) return;
      const provider = devModal.provider;
      setDevModal({ open: false, provider: null });
      startSocial(provider, { email, name });
    },
    [devModal.provider, startSocial]
  );

  return {
    startSocial,
    handleSocialClick,
    socialBusy,
    socialError,
    devModal,
    closeDevModal,
    confirmDevLogin,
  };
}
