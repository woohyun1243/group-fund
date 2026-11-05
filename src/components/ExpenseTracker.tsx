import { useState } from "react";
import type { FormEvent } from "react";
import type { Expense, Member } from "../types";

interface ExpenseTrackerProps {
  members: Member[];
  expenses: Expense[];
  onAddExpense: (
    title: string,
    amount: number,
    shares: Record<string, number>
  ) => void;
  onRemoveExpense: (id: string) => void;
}

// 입력 문자열을 "0 이상의 정수"로 변환합니다. 정수가 아니면 null을 돌려줍니다.
// (빈 칸, 소수점, 음수, 글자가 섞인 값은 모두 null)
function parseWon(text: string): number | null {
  const t = text.trim();
  if (!/^\d+$/.test(t)) return null;
  return Number(t);
}

function formatWon(n: number) {
  return n.toLocaleString("ko-KR") + "원";
}

export default function ExpenseTracker({
  members,
  expenses,
  onAddExpense,
  onRemoveExpense,
}: ExpenseTrackerProps) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  // 개인별 부담 금액 입력값: { 참여자 id: "입력한 문자열" }
  const [shareInputs, setShareInputs] = useState<Record<string, string>>({});
  const [error, setError] = useState("");

  const totalDeposit = members.reduce((sum, m) => sum + m.initialDeposit, 0);
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const remaining = totalDeposit - totalSpent;

  // ---- 실시간 검증용 계산값 (입력이 바뀔 때마다 자동으로 다시 계산됩니다) ----
  const selectedMembers = members.filter((m) => selectedIds.includes(m.id));
  const totalValue = parseWon(amount);
  const total = totalValue ?? 0;
  const shareSum = selectedMembers.reduce(
    (sum, m) => sum + (parseWon(shareInputs[m.id] ?? "") ?? 0),
    0
  );
  const diff = total - shareSum; // 양수: 부족, 음수: 초과, 0: 일치
  // 선택된 모든 참여자가 1원 이상의 정수를 입력했는지
  const allSharesValid = selectedMembers.every((m) => {
    const v = parseWon(shareInputs[m.id] ?? "");
    return v !== null && v > 0;
  });
  const canSave =
    totalValue !== null &&
    totalValue > 0 &&
    selectedMembers.length > 0 &&
    allSharesValid &&
    diff === 0;

  // 참여자가 없으면 지출을 기록할 수 없으므로 안내만 보여줍니다.
  // (useState 같은 훅은 반드시 이 return보다 위에 있어야 합니다.)
  if (members.length === 0) {
    return <p className="empty">먼저 1단계에서 참여자를 추가해 주세요.</p>;
  }

  function toggleMember(id: string) {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((x) => x !== id));
      // 참여에서 제외하면 그 사람의 입력값도 지웁니다.
      setShareInputs(
        Object.fromEntries(
          Object.entries(shareInputs).filter(([key]) => key !== id)
        )
      );
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  }

  function selectAll() {
    setSelectedIds(members.map((m) => m.id));
  }

  function handleShareChange(id: string, value: string) {
    setShareInputs({ ...shareInputs, [id]: value });
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (title.trim() === "") {
      setError("지출 내용을 입력해 주세요.");
      return;
    }
    if (totalValue === null || totalValue <= 0) {
      setError("전체 금액은 1원 이상의 정수로 입력해 주세요.");
      return;
    }
    if (selectedMembers.length === 0) {
      setError("비용을 부담할 참여자를 한 명 이상 선택해 주세요.");
      return;
    }
    if (!allSharesValid) {
      setError(
        "선택한 참여자의 부담 금액을 1원 이상의 정수로 입력해 주세요. (부담하지 않는 사람은 체크를 해제하세요.)"
      );
      return;
    }
    if (diff !== 0) {
      setError("개인별 부담 금액의 합계가 전체 금액과 일치해야 저장할 수 있어요.");
      return;
    }

    // 검증을 통과했으므로 숫자로 바꿔 shares를 만듭니다.
    const shares: Record<string, number> = {};
    for (const m of selectedMembers) {
      shares[m.id] = parseWon(shareInputs[m.id] ?? "") ?? 0;
    }

    onAddExpense(title.trim(), totalValue, shares);
    setTitle("");
    setAmount("");
    setSelectedIds([]);
    setShareInputs({});
    setError("");
  }

  // 지출 목록에 "민수 20,000원 · 지영 15,000원" 형태로 보여줍니다.
  function shareText(expense: Expense) {
    return members
      .filter((m) => expense.shares[m.id] !== undefined)
      .map((m) => `${m.name} ${formatWon(expense.shares[m.id])}`)
      .join(" · ");
  }

  return (
    <div className="expense-tracker">
      <form className="expense-form" onSubmit={handleSubmit}>
        <div className="expense-inputs">
          <input
            type="text"
            placeholder="지출 내용 (예: 점심 식사)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            type="number"
            placeholder="전체 금액(원)"
            min="0"
            step="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <div className="sharer-header">
          <span className="field-label">비용을 부담할 참여자</span>
          <button type="button" className="link-btn" onClick={selectAll}>
            전체 선택
          </button>
        </div>

        <div className="sharer-list">
          {members.map((m) => (
            <label key={m.id} className="sharer-item">
              <input
                type="checkbox"
                checked={selectedIds.includes(m.id)}
                onChange={() => toggleMember(m.id)}
              />
              {m.name}
            </label>
          ))}
        </div>

        {/* 참여자를 한 명 이상 선택하면 개인별 부담 금액 입력 영역이 나타납니다. */}
        {selectedMembers.length > 0 && (
          <div className="share-panel">
            <span className="field-label">개인별 부담 금액</span>

            {selectedMembers.map((m) => (
              <div key={m.id} className="share-row">
                <span className="share-name">{m.name}</span>
                <input
                  type="number"
                  placeholder="부담 금액(원)"
                  min="0"
                  step="1"
                  value={shareInputs[m.id] ?? ""}
                  onChange={(e) => handleShareChange(m.id, e.target.value)}
                />
              </div>
            ))}

            <div className="share-summary">
              <div>
                <span>전체 지출 금액</span>
                <strong>{formatWon(total)}</strong>
              </div>
              <div>
                <span>부담 금액 합계</span>
                <strong>{formatWon(shareSum)}</strong>
              </div>
              <div>
                <span>{diff < 0 ? "초과 금액" : "남은 금액"}</span>
                <strong className={diff === 0 ? "ok" : "warn"}>
                  {formatWon(Math.abs(diff))}
                </strong>
              </div>
            </div>

            {total === 0 ? (
              <p className="share-status neutral">
                전체 금액을 입력하면 합계를 비교해 드려요.
              </p>
            ) : diff === 0 ? (
              <p className="share-status ok">✓ 합계가 전체 금액과 일치해요.</p>
            ) : diff > 0 ? (
              <p className="share-status warn">
                ⚠ {formatWon(diff)}이 부족해요.
              </p>
            ) : (
              <p className="share-status warn">
                ⚠ {formatWon(-diff)}이 초과됐어요.
              </p>
            )}
          </div>
        )}

        <button type="submit" className="primary-btn" disabled={!canSave}>
          지출 추가
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      {expenses.length === 0 ? (
        <p className="empty">아직 기록된 지출이 없어요.</p>
      ) : (
        <ul className="expense-list">
          {expenses.map((e) => (
            <li key={e.id}>
              <div className="expense-info">
                <span className="expense-title">{e.title}</span>
                <span className="expense-sharers">{shareText(e)}</span>
              </div>
              <span className="expense-amount">{formatWon(e.amount)}</span>
              <button
                type="button"
                className="remove-btn"
                onClick={() => onRemoveExpense(e.id)}
              >
                삭제
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="total">
        총 지출 <strong>{formatWon(totalSpent)}</strong> · 남은 금액{" "}
        <strong className={remaining < 0 ? "negative" : ""}>
          {formatWon(remaining)}
        </strong>
      </div>
    </div>
  );
}