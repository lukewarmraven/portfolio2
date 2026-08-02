export default function RightMain({ children }: { children?: React.ReactNode }) {
  return (
    <div className="absolute right-[12.67vw] top-0 w-[36.75vw] h-screen">
      {children}
    </div>
  );
}
