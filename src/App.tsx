import { useState } from "react";
import SectionCard from "./components/SectionCard";
import GroupSetup from "./components/GroupSetup";
import ExpenseTracker from "./components/ExpenseTracker";
import Settlement from "./components/Settlement";
import type { Expense, Member } from "./types";
import "./App.css";

export default function App() {
  const [groupName, setGroupName] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  function addMember(name: string, initialDeposit: number) {
    const newMember: Member = {
      id: crypto.randomUUID(),
      name,
      initialDeposit,
    };
    setMembers([...members, newMember]);
  }

  function removeMember(id: string) {
    setMembers(members.filter((m) => m.id !== id));
    // 삭제된 참여자의 부담 금액을 각 지출에서 빼고, 그만큼 지출 총액도 줄입니다.
    // 부담자가 한 명도 남지 않은 지출은 함께 삭제합니다.
    setExpenses(
      expenses
        .map((e) => {
          const removedShare = e.shares[id] ?? 0;
          const newShares = Object.fromEntries(
            Object.entries(e.shares).filter(([key]) => key !== id)
          );
          return {
            ...e,
            amount: e.amount - removedShare,
            shares: newShares,
            sharedBy: Object.keys(newShares),
          };
        })
        .filter((e) => e.sharedBy.length > 0)
    );
  }

  function addExpense(
    title: string,
    amount: number,
    shares: Record<string, number>
  ) {
    const newExpense: Expense = {
      id: crypto.randomUUID(),
      title,
      amount,
      sharedBy: Object.keys(shares),
      shares,
    };
    setExpenses([...expenses, newExpense]);
  }

  function removeExpense(id: string) {
    setExpenses(expenses.filter((e) => e.id !== id));
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>💰 {groupName.trim() || "모임 공동 자금 관리"}</h1>
        <p>여행이나 모임의 공동 자금을 투명하게 정산해요.</p>
      </header>

      <main className="app-main">
        <SectionCard
          step={1}
          title="모임 만들기"
          description="모임 이름, 참여자, 각자의 초기 납입 금액을 설정합니다."
        >
          <GroupSetup
            groupName={groupName}
            members={members}
            onGroupNameChange={setGroupName}
            onAddMember={addMember}
            onRemoveMember={removeMember}
          />
        </SectionCard>

        <SectionCard
          step={2}
          title="지출 기록"
          description="공동 자금에서 쓴 지출과 실제로 부담할 참여자를 기록합니다."
        >
          <ExpenseTracker
            members={members}
            expenses={expenses}
            onAddExpense={addExpense}
            onRemoveExpense={removeExpense}
          />
        </SectionCard>

        <SectionCard
          step={3}
          title="정산하기"
          description="실제 부담액과 초기 납입액을 비교해 환급/추가 납부액을 계산합니다."
        >
          <Settlement members={members} expenses={expenses} />
        </SectionCard>
      </main>
    </div>
  );
}