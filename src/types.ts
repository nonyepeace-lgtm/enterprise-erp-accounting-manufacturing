export type AccountType = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
export type NormalSide = 'DEBIT' | 'CREDIT';
export type PeriodStatus = 'OPEN' | 'PENDING_CLOSE' | 'CLOSED' | 'LOCKED';
export type EntryStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'POSTED' | 'RECONCILED' | 'CLOSED';

export type JournalLineInput = {
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  narration: string;
};

export type JournalEntryInput = {
  companyId: string;
  periodId: string;
  sourceDocumentId?: string;
  description: string;
  reference?: string;
  entryDate?: Date;
  createdByUserId: string;
  approvedByUserId?: string;
  lines: JournalLineInput[];
};

export type PeriodChecklist = {
  bankReconciliationCompleted: boolean;
  inventoryReconciliationCompleted: boolean;
  arReviewed: boolean;
  apReviewed: boolean;
  payrollPosted: boolean;
  payeReviewed: boolean;
  vatReviewed: boolean;
  whtReviewed: boolean;
  fixedAssetDepreciationPosted: boolean;
  requiredJournalsApproved: boolean;
  suspenseAccountsReviewed: boolean;
  trialBalanceBalanced: boolean;
};

export type AccountConfig = {
  code: string;
  name: string;
  type: AccountType;
  normalSide: NormalSide;
};
