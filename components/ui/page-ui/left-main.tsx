export default function LeftMain({ children }: { children?: React.ReactNode }) {
  return (
    <div className="absolute left-[12.67vw] top-0 w-[36.75vw] h-screen">
      {children}
    </div>
  );
}
