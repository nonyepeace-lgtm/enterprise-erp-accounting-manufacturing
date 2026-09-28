import request from 'supertest';
import app from '../src/app.js';
import { JournalService, PeriodService, AuthorizationService } from '../src/services/accounting/accounting.service.js';
import { financialCalculations } from '../src/services/accounting/financial-calculations.js';

describe('Phase 1 accounting engine', () => {
  it('ensures debit total equals credit total', () => {
    const journal = JournalService.createJournalEntry({
      companyId: 'nfm-company-001',
      periodId: 'period-2025-q1',
      description: 'Inventory purchase',
      createdByUserId: 'user-accountant',
      lines: [
        { accountCode: '1200', accountName: 'Inventory - Raw Materials', debit: 650000, credit: 0, narration: 'Raw material receipt' },
        { accountCode: '2000', accountName: 'Accounts Payable', debit: 0, credit: 650000, narration: 'Supplier payable' },
      ],
    });

    expect(journal.debitTotal).toBe(650000);
    expect(journal.creditTotal).toBe(650000);
  });

  it('rejects imbalanced journals', () => {
    expect(() =>
      JournalService.createJournalEntry({
        companyId: 'nfm-company-001',
        periodId: 'period-2025-q1',
        description: 'Broken journal',
        createdByUserId: 'user-accountant',
        lines: [
          { accountCode: '1200', accountName: 'Inventory - Raw Materials', debit: 650000, credit: 0, narration: 'Raw materials' },
          { accountCode: '2000', accountName: 'Accounts Payable', debit: 0, credit: 600000, narration: 'Payable shortfall' },
        ],
      })
    ).toThrow(/Journal imbalance/);
  });

  it('calculates inventory valuation correctly for Nigerian manufacturing stock', () => {
    const valuation = financialCalculations.calculateInventoryValuation(650, 5200);
    expect(valuation).toBe(3380000);
  });

  it('calculates cost of goods sold correctly', () => {
    const cogs = financialCalculations.calculateCostOfGoodsSold(4000000, 12500000, 5400000);
    expect(cogs).toBe(10900000);
  });

  it('calculates production cost including WIP movement', () => {
    const productionCost = financialCalculations.calculateProductionCost(4200000, 2500000, 1800000, 600000, 850000);
    expect(productionCost).toBe(7930000);
  });

  it('calculates payroll net salary accurately', () => {
    const netSalary = financialCalculations.calculateNetSalary(450000, 60000, 25000, 10000);
    expect(netSalary).toBe(355000);
  });

  it('calculates VAT correctly', () => {
    const vat = financialCalculations.calculateVAT(15000000, 7.5);
    expect(vat).toBe(1125000);
  });

  it('calculates PAYE correctly', () => {
    const paye = financialCalculations.calculatePAYE(2500000, 15);
    expect(paye).toBe(375000);
  });

  it('calculates WHT correctly', () => {
    const wht = financialCalculations.calculateWHT(5500000, 5);
    expect(wht).toBe(275000);
  });

  it('blocks period close when checklist is incomplete', () => {
    const checklist = PeriodService.getCloseChecklist();
    checklist.bankReconciliationCompleted = true;
    checklist.inventoryReconciliationCompleted = true;
    checklist.arReviewed = true;
    checklist.apReviewed = true;
    checklist.payrollPosted = true;
    checklist.payeReviewed = true;
    checklist.vatReviewed = true;
    checklist.whtReviewed = true;
    checklist.fixedAssetDepreciationPosted = true;
    checklist.requiredJournalsApproved = true;
    checklist.suspenseAccountsReviewed = true;
    checklist.trialBalanceBalanced = false;

    expect(() => PeriodService.validateCloseChecklist(checklist)).toThrow(/Period cannot be closed/);
  });

  it('allows reversal entries with opposite balances', () => {
    const original = JournalService.createJournalEntry({
      companyId: 'nfm-company-001',
      periodId: 'period-2025-q1',
      description: 'Purchase of sugar',
      createdByUserId: 'user-accountant',
      lines: [
        { accountCode: '1200', accountName: 'Inventory - Raw Materials', debit: 100000, credit: 0, narration: 'Sugar stock' },
        { accountCode: '2000', accountName: 'Accounts Payable', debit: 0, credit: 100000, narration: 'Supplier payable' },
      ],
    });

    const reversal = JournalService.reverseJournalEntry(original, 'user-controller', 'Supplier credit note');

    expect(reversal.reversalOfTransactionId).toBe(original.transactionId);
    expect(reversal.debitTotal).toBe(100000);
    expect(reversal.creditTotal).toBe(100000);
  });

  it('grants permissions only to approved roles', () => {
    expect(AuthorizationService.hasPermission(['admin'], 'period.close')).toBe(true);
    expect(AuthorizationService.hasPermission(['auditor'], 'journal.post')).toBe(false);
    expect(AuthorizationService.hasPermission(['accountant'], 'journal.post')).toBe(true);
  });

  it('exposes a health endpoint', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
  });
});
