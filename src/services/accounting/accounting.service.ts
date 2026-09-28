import { randomUUID } from 'crypto';
import { AccountConfig, JournalEntryInput, PeriodChecklist } from '../types.js';

export class ChartOfAccountsService {
  static createDefaultChart(companyId: string): AccountConfig[] {
    return [
      { code: '1000', name: 'Cash at Bank', type: 'ASSET', normalSide: 'DEBIT' },
      { code: '1010', name: 'Cash in Hand', type: 'ASSET', normalSide: 'DEBIT' },
      { code: '1100', name: 'Accounts Receivable', type: 'ASSET', normalSide: 'DEBIT' },
      { code: '1200', name: 'Inventory - Raw Materials', type: 'ASSET', normalSide: 'DEBIT' },
      { code: '1201', name: 'Inventory - WIP', type: 'ASSET', normalSide: 'DEBIT' },
      { code: '1202', name: 'Inventory - Finished Goods', type: 'ASSET', normalSide: 'DEBIT' },
      { code: '1300', name: 'Prepaid Expenses', type: 'ASSET', normalSide: 'DEBIT' },
      { code: '2000', name: 'Accounts Payable', type: 'LIABILITY', normalSide: 'CREDIT' },
      { code: '2100', name: 'VAT Payable', type: 'LIABILITY', normalSide: 'CREDIT' },
      { code: '2110', name: 'WHT Payable', type: 'LIABILITY', normalSide: 'CREDIT' },
      { code: '2120', name: 'PAYE Payable', type: 'LIABILITY', normalSide: 'CREDIT' },
      { code: '2200', name: 'Payroll Liabilities', type: 'LIABILITY', normalSide: 'CREDIT' },
      { code: '3000', name: 'Share Capital', type: 'EQUITY', normalSide: 'CREDIT' },
      { code: '3100', name: 'Retained Earnings', type: 'EQUITY', normalSide: 'CREDIT' },
      { code: '4000', name: 'Sales Revenue', type: 'REVENUE', normalSide: 'CREDIT' },
      { code: '4100', name: 'Other Income', type: 'REVENUE', normalSide: 'CREDIT' },
      { code: '5000', name: 'Raw Materials Purchases', type: 'EXPENSE', normalSide: 'DEBIT' },
      { code: '5100', name: 'Direct Labour', type: 'EXPENSE', normalSide: 'DEBIT' },
      { code: '5200', name: 'Manufacturing Overhead', type: 'EXPENSE', normalSide: 'DEBIT' },
      { code: '5300', name: 'Cost of Goods Sold', type: 'EXPENSE', normalSide: 'DEBIT' },
      { code: '5400', name: 'Administrative Expense', type: 'EXPENSE', normalSide: 'DEBIT' },
      { code: '5500', name: 'Selling Expense', type: 'EXPENSE', normalSide: 'DEBIT' },
      { code: '5600', name: 'Depreciation Expense', type: 'EXPENSE', normalSide: 'DEBIT' },
      { code: '5700', name: 'Payroll Expense', type: 'EXPENSE', normalSide: 'DEBIT' },
      { code: '5800', name: 'VAT Expense', type: 'EXPENSE', normalSide: 'DEBIT' },
      { code: '5900', name: 'Tax Expense', type: 'EXPENSE', normalSide: 'DEBIT' }
    ].map((account) => ({
      ...account,
      companyId,
      id: randomUUID(),
    }));
  }
}

export class JournalService {
  static validateDebitEqualsCredit(lines: JournalEntryInput['lines']): number {
    const totalDebit = lines.reduce((sum, line) => sum + (Number(line.debit) || 0), 0);
    const totalCredit = lines.reduce((sum, line) => sum + (Number(line.credit) || 0), 0);

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      throw new Error(
        `Journal imbalance: debit total ${totalDebit.toFixed(2)} does not equal credit total ${totalCredit.toFixed(2)}`
      );
    }

    return totalDebit;
  }

  static createJournalEntry(input: JournalEntryInput) {
    const compactLines = input.lines.map((line) => ({
      ...line,
      debit: Number(line.debit || 0),
      credit: Number(line.credit || 0),
    }));

    this.validateDebitEqualsCredit(compactLines);

    const transactionId = randomUUID();
    const journalNumber = `JRN-${Date.now()}`;
    const documentNumber = `DOC-${Date.now()}`;

    return {
      companyId: input.companyId,
      periodId: input.periodId,
      sourceDocumentId: input.sourceDocumentId,
      journalNumber,
      documentNumber,
      transactionId,
      reference: input.reference || 'AUTO-ENTRY',
      description: input.description,
      entryDate: input.entryDate || new Date(),
      createdByUserId: input.createdByUserId,
      approvedByUserId: input.approvedByUserId || null,
      status: 'POSTED',
      lines: compactLines,
      debitTotal: compactLines.reduce((sum, line) => sum + line.debit, 0),
      creditTotal: compactLines.reduce((sum, line) => sum + line.credit, 0),
    };
  }

  static reverseJournalEntry(originalEntry: ReturnType<typeof JournalService.createJournalEntry>, reversedByUserId: string, reason: string) {
    const reversedLines = originalEntry.lines.map((line) => ({
      ...line,
      debit: line.credit,
      credit: line.debit,
      narration: `${line.narration} [Reversal: ${reason}]`,
    }));

    const reverseEntry = this.createJournalEntry({
      companyId: originalEntry.companyId,
      periodId: originalEntry.periodId,
      description: `Reversal of ${originalEntry.journalNumber}`,
      reference: `REV-${originalEntry.transactionId}`,
      createdByUserId: reversedByUserId,
      lines: reversedLines,
    });

    return {
      ...reverseEntry,
      reversalOfTransactionId: originalEntry.transactionId,
      reason,
    };
  }
}

export class PeriodService {
  static getCloseChecklist(): PeriodChecklist {
    return {
      bankReconciliationCompleted: false,
      inventoryReconciliationCompleted: false,
      arReviewed: false,
      apReviewed: false,
      payrollPosted: false,
      payeReviewed: false,
      vatReviewed: false,
      whtReviewed: false,
      fixedAssetDepreciationPosted: false,
      requiredJournalsApproved: false,
      suspenseAccountsReviewed: false,
      trialBalanceBalanced: false,
    };
  }

  static validateCloseChecklist(checklist: Partial<PeriodChecklist>) {
    const requiredFields = Object.keys(this.getCloseChecklist()) as Array<keyof PeriodChecklist>;
    const unresolved = requiredFields.filter((field) => checklist[field] !== true);

    if (unresolved.length > 0) {
      throw new Error(`Period cannot be closed. Unresolved checklist items: ${unresolved.join(', ')}`);
    }

    return true;
  }
}

export class AuditTrailService {
  static createAuditRecord(entityType: string, entityId: string, action: string, actorUserId: string, companyId: string, changes: Record<string, unknown>, reason?: string) {
    return {
      id: randomUUID(),
      companyId,
      entityType,
      entityId,
      action,
      actorUserId,
      reason: reason || 'System generated',
      changes: JSON.stringify(changes),
      createdAt: new Date().toISOString(),
    };
  }
}

export class AuthorizationService {
  static hasPermission(userRoles: string[], requiredPermission: string) {
    const permissionsByRole: Record<string, string[]> = {
      admin: ['company.setup', 'accounting.read', 'accounting.write', 'journal.post', 'period.close', 'audit.read'],
      accountant: ['accounting.read', 'accounting.write', 'journal.post', 'audit.read'],
      auditor: ['accounting.read', 'audit.read'],
      controller: ['accounting.read', 'period.close', 'audit.read'],
    };

    const grantedPermissions = userRoles.flatMap((role) => permissionsByRole[role] || []);
    return grantedPermissions.includes(requiredPermission);
  }
}
