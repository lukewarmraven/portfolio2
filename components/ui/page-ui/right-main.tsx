import { vw } from "@/lib/utils";

export default function RightMain({ children }: { children?: React.ReactNode }) {
  return (
    <div
      data-right-main
      className="no-scrollbar"
      style={{
        width: vw(635),
        height: "100%",
        overflowY: "auto",
        scrollSnapType: "y mandatory",
      }}
    >
      {children}
    </div>
  );
}
