import type { Expense, Member } from "../types";

interface SettlementProps {
  members: Member[];
  expenses: Expense[];
}

function formatWon(n: number) {
  return n.toLocaleString("ko-KR") + "원";
}

export default function Settlement({ members, expenses }: SettlementProps) {
  if (members.length === 0) {
    return <p className="empty">먼저 1단계에서 참여자를 추가해 주세요.</p>;
  }

  // 참여자별로 실제 부담액과 정산 금액을 계산합니다.
  const rows = members.map((m) => {
    const actualCost = expenses.reduce(
      (sum, e) => sum + (e.shares[m.id] ?? 0),
      0
    );
    const balance = m.initialDeposit - actualCost; // 양수: 환급, 음수: 추가 납부
    return { member: m, actualCost, balance };
  });

  const totalDeposit = members.reduce((sum, m) => sum + m.initialDeposit, 0);
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalRefund = rows.reduce((s, r) => s + Math.max(r.balance, 0), 0);
  const totalExtra = rows.reduce((s, r) => s + Math.max(-r.balance, 0), 0);

  return (
    <div className="settlement">
      <div className="settle-summary">
        <div>
          <span>총 납입액</span>
          <strong>{formatWon(totalDeposit)}</strong>
        </div>
        <div>
          <span>총 지출액</span>
          <strong>{formatWon(totalSpent)}</strong>
        </div>
        <div>
          <span>공동 자금 잔액</span>
          <strong className={totalDeposit - totalSpent < 0 ? "negative" : ""}>
            {formatWon(totalDeposit - totalSpent)}
          </strong>
        </div>
      </div>

      <ul className="settle-list">
        {rows.map(({ member, actualCost, balance }) => (
          <li key={member.id}>
            <div className="settle-name">{member.name}</div>
            <div className="settle-detail">
              <span>납입 {formatWon(member.initialDeposit)}</span>
              <span>부담 {formatWon(actualCost)}</span>
            </div>
            <div
              className={
                "settle-result " +
                (balance > 0 ? "refund" : balance < 0 ? "extra" : "even")
              }
            >
              {balance > 0 && `환급 ${formatWon(balance)}`}
              {balance < 0 && `추가 납부 ${formatWon(-balance)}`}
              {balance === 0 && "정산 완료"}
            </div>
          </li>
        ))}
      </ul>

      <div className="total">
        환급 합계 <strong>{formatWon(totalRefund)}</strong> · 추가 납부 합계{" "}
        <strong>{formatWon(totalExtra)}</strong>
      </div>
    </div>
  );
}