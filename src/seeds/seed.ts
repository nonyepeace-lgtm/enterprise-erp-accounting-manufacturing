import { ChartOfAccountsService, JournalService, PeriodService, AuditTrailService, AuthorizationService } from '../services/accounting/accounting.service.js';

export const companySeed = {
  company: {
    name: 'Nigerian Foods Manufacturing Ltd.',
    shortName: 'NFM',
    taxId: 'RC-1234567',
    currency: 'NGN',
  },
  users: [
    { id: 'user-admin', email: 'admin@nfm.com', firstName: 'Ada', lastName: 'Adebayo', roles: ['admin'] },
    { id: 'user-accountant', email: 'accountant@nfm.com', firstName: 'Tosin', lastName: 'Bakare', roles: ['accountant'] },
    { id: 'user-auditor', email: 'audit@nfm.com', firstName: 'Grace', lastName: 'Ibe', roles: ['auditor'] },
    { id: 'user-controller', email: 'controller@nfm.com', firstName: 'Comfort', lastName: 'Eze', roles: ['controller'] },
  ],
  defaultChart: ChartOfAccountsService.createDefaultChart('nfm-company-001'),
  sampleJournal: JournalService.createJournalEntry({
    companyId: 'nfm-company-001',
    periodId: 'period-2025-q1',
    description: 'Initial capital injection and cash deposit',
    createdByUserId: 'user-admin',
    approvedByUserId: 'user-admin',
    lines: [
      { accountCode: '1000', accountName: 'Cash at Bank', debit: 5000000, credit: 0, narration: 'Capital deposited to bank' },
      { accountCode: '3000', accountName: 'Share Capital', debit: 0, credit: 5000000, narration: 'Share capital recognition' },
    ],
  }),
  checklist: PeriodService.getCloseChecklist(),
  permissions: {
    admin: AuthorizationService.hasPermission(['admin'], 'period.close'),
    accountant: AuthorizationService.hasPermission(['accountant'], 'journal.post'),
    auditor: AuthorizationService.hasPermission(['auditor'], 'audit.read'),
  },
  auditRecord: AuditTrailService.createAuditRecord(
    'JournalEntry',
    'demo-journal-001',
    'created',
    'user-admin',
    'nfm-company-001',
    { status: 'POSTED' },
    'Initial capital contribution'
  ),
};
