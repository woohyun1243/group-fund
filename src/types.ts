// 참여자: 이름과 처음에 낸 금액
export interface Member {
  id: string;
  name: string;
  initialDeposit: number;
}

// 지출: 내용, 금액, 부담자 id 목록, 개인별 부담 금액
export interface Expense {
  id: string;
  title: string;
  amount: number;
  sharedBy: string[]; // 부담자 id 목록 (shares의 키와 동일)
  shares: Record<string, number>; // { 참여자 id: 그 사람의 부담 금액(원) }
}

// 모임: 위 데이터를 묶는 단위
export interface Group {
  id: string;
  name: string;
  members: Member[];
  expenses: Expense[];
}