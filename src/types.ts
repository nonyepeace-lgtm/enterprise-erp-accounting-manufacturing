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

export type Supplier = {
  id: string;
  name: string;
  tin: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
};

export type Customer = {
  id: string;
  name: string;
  customerCode: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
};

export type InventoryItem = {
  id: string;
  sku: string;
  name: string;
  category: 'RAW_MATERIAL' | 'WIP' | 'FINISHED_GOOD';
  unitCost: number;
  quantityOnHand: number;
};

export type PurchaseLineItem = {
  sku: string;
  name: string;
  quantity: number;
  unitCost: number;
  taxRate: number;
};

export type SaleLineItem = {
  sku: string;
  name: string;
  quantity: number;
  unitPrice: number;
  unitCost: number;
  taxRate: number;
};

export type BankReconciliationResult = {
  ledgerBalance: number;
  statementBalance: number;
  difference: number;
  isBalanced: boolean;
  unresolvedItems: string[];
};

export type AgingBucket = {
  current: number;
  days30: number;
  days60: number;
  days90: number;
  overdue: number;
};

export type ReceivablesPayablesSummary = {
  totalReceivables: number;
  totalPayables: number;
  receivablesAging: AgingBucket;
  payablesAging: AgingBucket;
};