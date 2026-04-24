import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import googleLogo from "../../assets/google.svg";
import { googleLogin } from "../../auth/authActions";

const GoogleLogin = () => {
  const navigate = useNavigate();
  const hiddenBtnRef = useRef(null);

  const handleCredentialResponse = async (response) => {
    if (!response?.credential) return;
    try {
      const { role } = await googleLogin(response.credential);
      navigate(role === "admin" ? "/admin" : "/");
      //eslint-disable-next-line no-unused-vars
    } catch (err) {
      // error already logged
    }
  };

  useEffect(() => {
    const initGsi = () => {
      if (!window.google?.accounts?.id || !hiddenBtnRef.current) return;

      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        ux_mode: "popup",
        auto_select: false,
      });

      window.google.accounts.id.renderButton(hiddenBtnRef.current, {
        type: "standard",
        theme: "outline",
        size: "large",
      });
    };

    // If GSI is already loaded, init immediately; otherwise wait for it
    if (window.google?.accounts?.id) {
      initGsi();
    } else {
      const script = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      script?.addEventListener("load", initGsi);
      return () => script?.removeEventListener("load", initGsi);
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClick = () => {
    // click Google's hidden button to trigger the real popup
    hiddenBtnRef.current?.querySelector("div[role=button]")?.click();
  };

  return (
    <>
      {/* hidden Google button — GSI needs a real DOM target */}
      <div ref={hiddenBtnRef} className="absolute opacity-0 pointer-events-none" />

      {/* your styled button */}
      <button
        type="button"
        onClick={handleClick}
        className="flex items-center justify-center btn btn-primary w-full text-base font-medium py-3 mt-6 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
      >
        <img src={googleLogo} alt="Google" className="h-5 w-5 mr-3" width="20" height="20" />
        Continue with Google
      </button>
    </>
  );
};

export default GoogleLogin;
