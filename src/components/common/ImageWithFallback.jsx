import { useEffect, useState } from "react";

/**
 * Drop-in replacement for <img> that shows a visually presentable
 * placeholder instead of a broken-image icon when the src 404s —
 * e.g. previewing a declined request whose staged images were deleted.
 */
export default function ImageWithFallback({ src, alt, className = "", ...rest }) {
  const [broken, setBroken] = useState(false);

  useEffect(() => {
    setBroken(false);
  }, [src]);

  if (broken) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-2 bg-base-200 text-base-content/40 ${className}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="h-8 w-8"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 3l18 18M3.75 3h16.5a.75.75 0 01.75.75v16.5a.75.75 0 01-.75.75H3.75a.75.75 0 01-.75-.75V3.75A.75.75 0 013.75 3z"
          />
        </svg>
        <span className="text-xs font-medium px-2 text-center">Image no longer available</span>
      </div>
    );
  }

  return (
    <img src={src} alt={alt} className={className} onError={() => setBroken(true)} {...rest} />
  );
}
