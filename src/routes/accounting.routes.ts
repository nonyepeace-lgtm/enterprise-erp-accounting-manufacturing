import { Request, Response } from 'express';
import { ChartOfAccountsService, JournalService, PeriodService, AuditTrailService, AuthorizationService } from './accounting.service.js';
import { financialCalculations } from './financial-calculations.js';

export const accountingRoutes = (req: Request, res: Response) => {
  // This placeholder keeps the file importable. The actual API is defined below.
  return undefined;
};

export const setupAccountingRoutes = async (req: Request, res: Response) => {
  const { companyId, periodId, description, reference, lines, createdByUserId, approvedByUserId, role } = req.body;

  if (req.path === '/setup-company') {
    const chart = ChartOfAccountsService.createDefaultChart(companyId || 'demo-company');
    return res.json({ message: 'Company setup complete', chartLength: chart.length, chart });
  }

  if (req.path === '/journal-entries') {
    try {
      const journal = JournalService.createJournalEntry({
        companyId: companyId || 'demo-company',
        periodId: periodId || 'demo-period',
        description: description || 'Automated accounting entry',
        reference,
        createdByUserId: createdByUserId || 'system-user',
        approvedByUserId,
        lines: lines || [
          { accountCode: '1000', accountName: 'Cash at Bank', debit: 500000, credit: 0, narration: 'Cash deposit' },
          { accountCode: '3000', accountName: 'Share Capital', debit: 0, credit: 500000, narration: 'Capital contribution' },
        ],
      });

      return res.status(201).json({ journal });
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message });
    }
  }

  if (req.path === '/journal-entries/reverse') {
    const { originalEntry, reversedByUserId, reason } = req.body;
    const reversed = JournalService.reverseJournalEntry(originalEntry, reversedByUserId || 'system-user', reason || 'Correction');
    return res.json({ reversed });
  }

  if (req.path === '/periods/checklist') {
    try {
      PeriodService.validateCloseChecklist(req.body.checklist || PeriodService.getCloseChecklist());
      return res.json({ ok: true, message: 'Checklist passed' });
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message });
    }
  }

  if (req.path === '/audit-trail') {
    const record = AuditTrailService.createAuditRecord(
      req.body.entityType || 'JournalEntry',
      req.body.entityId || 'demo-entity',
      req.body.action || 'created',
      req.body.actorUserId || 'user-001',
      req.body.companyId || 'demo-company',
      req.body.changes || { status: 'draft' },
      req.body.reason || 'Business event'
    );

    return res.json({ auditRecord: record });
  }

  if (req.path === '/permissions') {
    const granted = AuthorizationService.hasPermission(role ? [role] : ['accountant'], 'journal.post');
    return res.json({ permitted: granted });
  }

  if (req.path === '/financial-calculations') {
    return res.json({
      inventoryValuation: financialCalculations.calculateInventoryValuation(150, 4500),
      cogs: financialCalculations.calculateCostOfGoodsSold(2500000, 18500000, 5200000),
      productionCost: financialCalculations.calculateProductionCost(4800000, 2200000, 1900000, 500000, 800000),
      payroll: financialCalculations.calculateNetSalary(450000, 60000, 25000, 10000),
      vat: financialCalculations.calculateVAT(10000000, 7.5),
      paye: financialCalculations.calculatePAYE(4500000, 15),
      wht: financialCalculations.calculateWHT(2500000, 5),
      depreciation: financialCalculations.calculateDepreciation(12000000, 5),
    });
  }

  return res.status(404).json({ error: 'Not found' });
};

export const accountingRoutes = {
  setup: async (req: Request, res: Response) => setupAccountingRoutes(req, res),
  journal: async (req: Request, res: Response) => setupAccountingRoutes(req, res),
  periods: async (req: Request, res: Response) => setupAccountingRoutes(req, res),
  audit: async (req: Request, res: Response) => setupAccountingRoutes(req, res),
  permissions: async (req: Request, res: Response) => setupAccountingRoutes(req, res),
  calculations: async (req: Request, res: Response) => setupAccountingRoutes(req, res),
};
