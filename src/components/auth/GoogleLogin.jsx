import React, { useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { googleLogin } from "../../auth/authActions";

const GoogleLogin = () => {
  const navigate = useNavigate();
  const gsiBtnRef = useRef(null);
  const gsiReady = useRef(false);

  const handleCredentialResponse = useCallback(
    async (response) => {
      if (!response?.credential) return;
      try {
        const { role } = await googleLogin(response.credential);
        navigate(role === "admin" ? "/admin" : "/");
        //eslint-disable-next-line no-unused-vars
      } catch (err) {
        // error already logged
      }
    },
    [navigate]
  );

  const renderGsiButton = useCallback(() => {
    if (!window.google?.accounts?.id || !gsiBtnRef.current || gsiReady.current) return;
    gsiReady.current = true;

    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: handleCredentialResponse,
      ux_mode: "popup",
      auto_select: false,
    });

    window.google.accounts.id.renderButton(gsiBtnRef.current, {
      type: "standard",
      theme: "filled_blue",
      size: "large",
      shape: "pill",
      width: gsiBtnRef.current.offsetWidth,
    });
  }, [handleCredentialResponse]);

  useEffect(() => {
    if (window.google?.accounts?.id) {
      renderGsiButton();
    } else {
      const script = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      script?.addEventListener("load", renderGsiButton);
      return () => script?.removeEventListener("load", renderGsiButton);
    }
  }, [renderGsiButton]);

  return <div ref={gsiBtnRef} className="mt-6 flex justify-center" />;
};

export default GoogleLogin;
