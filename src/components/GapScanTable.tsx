import { getGapStatusLabel } from "@/services/simulationService";
import type { GapScanResult, GapStatus } from "@/types/simulation";

interface GapScanTableProps {
  gapScan: GapScanResult;
}

const statusClass: Record<GapStatus, string> = {
  pass: "text-pixel-green",
  partial: "text-pixel-yellow",
  fail: "text-pixel-red",
};

export function GapScanTable({ gapScan }: GapScanTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] border-collapse text-sm">
        <thead>
          <tr className="bg-[#101822] text-left text-pixel-cyan">
            <th className="border-2 border-pixel-border p-3">检查项</th>
            <th className="border-2 border-pixel-border p-3">状态</th>
            <th className="border-2 border-pixel-border p-3">存在问题</th>
            <th className="border-2 border-pixel-border p-3">补强动作</th>
          </tr>
        </thead>
        <tbody>
          {gapScan.items.map((item) => (
            <tr key={item.key} className="odd:bg-[#141b24] even:bg-[#17211e]">
              <td className="border-2 border-pixel-border p-3 font-bold text-pixel-text">{item.label}</td>
              <td className={`border-2 border-pixel-border p-3 font-bold ${statusClass[item.status]}`}>
                {getGapStatusLabel(item.status)}
              </td>
              <td className="border-2 border-pixel-border p-3 text-pixel-muted">{item.problem}</td>
              <td className="border-2 border-pixel-border p-3 text-pixel-text">{item.improvementAction}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
