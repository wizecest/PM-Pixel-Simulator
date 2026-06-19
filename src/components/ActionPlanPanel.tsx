import type { ActionItem, ActionPlan } from "@/types/simulation";

interface ActionPlanPanelProps {
  actionPlan: ActionPlan;
}

function ActionList({ title, items }: { title: string; items: ActionItem[] }) {
  return (
    <div className="border-2 border-pixel-border bg-[#121923] p-4 shadow-pixelSm">
      <h3 className="mb-3 font-bold text-pixel-yellow">{title}</h3>
      <div className="grid gap-3">
        {items.map((item) => (
          <div key={`${item.owner}-${item.deadline}-${item.action}`} className="border-l-4 border-pixel-cyan pl-3 text-sm">
            <p className="font-bold text-pixel-text">{item.action}</p>
            <p className="mt-1 text-pixel-muted">责任人：{item.owner}</p>
            <p className="text-pixel-muted">完成时间：{item.deadline}</p>
            <p className="text-pixel-muted">输出成果：{item.output}</p>
            <p className="text-pixel-muted">检查人：{item.checker}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function TagList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="mb-2 font-bold text-pixel-cyan">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span key={item} className="border-2 border-pixel-border bg-[#101822] px-2 py-1 text-xs text-pixel-text">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export function ActionPlanPanel({ actionPlan }: ActionPlanPanelProps) {
  return (
    <div className="grid gap-5">
      <div className="grid gap-4 lg:grid-cols-3">
        <ActionList title="一、今天立即做什么" items={actionPlan.todayActions} />
        <ActionList title="二、明天推进什么" items={actionPlan.tomorrowActions} />
        <ActionList title="三、本周完成什么" items={actionPlan.weeklyActions} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <TagList title="四、找谁参加" items={actionPlan.participants} />
        <TagList title="五、形成什么表单" items={actionPlan.requiredForms} />
        <TagList title="六、输出什么成果" items={actionPlan.deliverables} />
        <div>
          <h3 className="mb-2 font-bold text-pixel-cyan">七、何时反馈 / 八、是否需要上报 / 九、如何销项</h3>
          <p className="text-sm leading-6 text-pixel-muted">{actionPlan.reportingRequirement}</p>
          <p className="mt-2 text-sm leading-6 text-pixel-text">{actionPlan.closureMethod}</p>
        </div>
      </div>
    </div>
  );
}
