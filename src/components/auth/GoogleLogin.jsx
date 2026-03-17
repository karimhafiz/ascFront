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
    if (!window.google?.accounts?.id || !hiddenBtnRef.current) return;

    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: handleCredentialResponse,
      ux_mode: "popup",
      auto_select: false,
    });

    // render Google's real button into the hidden div
    window.google.accounts.id.renderButton(hiddenBtnRef.current, {
      type: "standard",
      theme: "outline",
      size: "large",
    });
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
        className="flex items-center justify-center btn w-full text-base font-medium py-3 mt-6 rounded-xl bg-gradient-to-r from-pink-400 to-purple-400 text-white border-0 shadow-lg hover:shadow-xl hover:scale-[1.02] hover:border-2 hover:border-white transition-all"
      >
        <img src={googleLogo} alt="Google" className="h-5 w-5 mr-3" />
        Continue with Google
      </button>
    </>
  );
};

export default GoogleLogin;
