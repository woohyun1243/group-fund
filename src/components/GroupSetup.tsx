import { useState } from "react";
import type { FormEvent } from "react";
import type { Member } from "../types";

interface GroupSetupProps {
  groupName: string;
  members: Member[];
  onGroupNameChange: (name: string) => void;
  onAddMember: (name: string, initialDeposit: number) => void;
  onRemoveMember: (id: string) => void;
}

export default function GroupSetup({
  groupName,
  members,
  onGroupNameChange,
  onAddMember,
  onRemoveMember,
}: GroupSetupProps) {
  // 입력 중인 값은 이 컴포넌트 안에서만 필요하므로 여기서 관리합니다.
  const [name, setName] = useState("");
  const [deposit, setDeposit] = useState("");
  const [error, setError] = useState("");

  const totalDeposit = members.reduce((sum, m) => sum + m.initialDeposit, 0);

  function handleSubmit(e: FormEvent) {
    e.preventDefault(); // 폼 제출 시 페이지가 새로고침되는 기본 동작을 막습니다.

    const trimmedName = name.trim();
    const amount = Number(deposit);

    if (trimmedName === "") {
      setError("참여자 이름을 입력해 주세요.");
      return;
    }
    if (members.some((m) => m.name === trimmedName)) {
      setError("이미 같은 이름의 참여자가 있어요.");
      return;
    }
    if (deposit === "" || Number.isNaN(amount) || amount < 0) {
      setError("초기 납입금은 0 이상의 숫자로 입력해 주세요.");
      return;
    }

    onAddMember(trimmedName, amount);
    setName("");
    setDeposit("");
    setError("");
  }

  return (
    <div className="group-setup">
      <label className="field">
        <span className="field-label">모임 이름</span>
        <input
          type="text"
          placeholder="예: 제주도 여행"
          value={groupName}
          onChange={(e) => onGroupNameChange(e.target.value)}
        />
      </label>

      <form className="member-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="참여자 이름"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="number"
          placeholder="초기 납입금(원)"
          min="0"
          value={deposit}
          onChange={(e) => setDeposit(e.target.value)}
        />
        <button type="submit">추가</button>
      </form>

      {error && <p className="error">{error}</p>}

      {members.length === 0 ? (
        <p className="empty">아직 참여자가 없어요. 위에서 추가해 보세요.</p>
      ) : (
        <ul className="member-list">
          {members.map((m) => (
            <li key={m.id}>
              <span className="member-name">{m.name}</span>
              <span className="member-amount">
                {m.initialDeposit.toLocaleString("ko-KR")}원
              </span>
              <button
                type="button"
                className="remove-btn"
                onClick={() => onRemoveMember(m.id)}
              >
                삭제
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="total">
        참여자 {members.length}명 · 총 모인 금액{" "}
        <strong>{totalDeposit.toLocaleString("ko-KR")}원</strong>
      </div>
    </div>
  );
}