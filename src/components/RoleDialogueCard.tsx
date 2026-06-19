import type { RoleSimulationResult } from "@/types/simulation";

interface RoleDialogueCardProps {
  result: RoleSimulationResult;
}

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function TextList({ title, items }: { title: string; items: string[] }) {
  const safeItems = asArray<string>(items);

  return (
    <div>
      <h4 className="mb-2 font-bold text-pixel-cyan">{title}</h4>
      <ul className="grid gap-2 text-sm text-pixel-text">
        {safeItems.length === 0 ? (
          <li className="leading-6 text-pixel-muted">暂无</li>
        ) : (
          safeItems.map((item) => (
            <li key={item} className="leading-6">
              {item}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export function RoleDialogueCard({ result }: RoleDialogueCardProps) {
  const roleName = result.roleName || "未命名角色";

  return (
    <article className="pixel-card">
      <header className="mb-4 flex items-start gap-3">
        <span className="pixel-avatar size-12">{roleName.slice(0, 1)}</span>
        <div>
          <h3 className="text-lg font-bold text-pixel-yellow">NPC {roleName}</h3>
          <p className="mt-2 border-l-4 border-pixel-cyan pl-3 text-sm text-pixel-text">
            {result.npcLine || "未提供角色台词。"}
          </p>
        </div>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        <TextList title="一、我最关心什么" items={result.concerns} />
        <TextList title="二、我会质疑什么" items={result.challenges} />
        <TextList title="三、你的方案缺什么" items={result.missingItems} />
        <TextList title="四、我建议补什么动作" items={result.recommendedActions} />
      </div>
      <div className="mt-4 border-t-2 border-pixel-border pt-4">
        <TextList title="五、如果不补强，可能造成什么后果" items={result.consequences} />
      </div>
    </article>
  );
}
