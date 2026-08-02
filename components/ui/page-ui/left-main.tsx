import { vw } from "@/lib/utils";

export default function LeftMain({ children }: { children?: React.ReactNode }) {
  return (
    <div className="h-full flex flex-col justify-center" style={{ width: vw(635) }}>
      {children}
    </div>
  );
}
