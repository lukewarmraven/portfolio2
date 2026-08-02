import { vw } from "@/lib/utils";

export default function LeftMain({ children }: { children?: React.ReactNode }) {
  return (
    <div style={{ width: vw(635) }}>
      {children}
    </div>
  );
}
