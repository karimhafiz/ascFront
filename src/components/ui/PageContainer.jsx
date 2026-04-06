export default function PageContainer({ center, className = "", children }) {
  return (
    <div
      className={`min-h-screen ${center ? "flex items-center justify-center" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
