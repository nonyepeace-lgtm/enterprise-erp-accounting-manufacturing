import { Router } from 'express';
import {
  JournalService,
  PeriodService,
  AuditTrailService,
  AuthorizationService,
} from '../services/accounting/accounting.service.js';
import { financialCalculations } from '../services/accounting/financial-calculations.js';

export const accountingRoutes = Router();

accountingRoutes.post('/journal-entries', (req, res) => {
  try {
    const { companyId, periodId, description, reference, lines, createdByUserId, approvedByUserId } = req.body ?? {};
    if (!companyId || !periodId || !description || !createdByUserId || !Array.isArray(lines) || lines.length < 2) {
      return res.status(400).json({ error: 'companyId, periodId, description, createdByUserId, and at least two lines are required.' });
    }
    const journal = JournalService.createJournalEntry({ companyId, periodId, description, reference, createdByUserId, approvedByUserId, lines });
    return res.status(201).json({ journal });
  } catch (error) {
    return res.status(400).json({ error: (error as Error).message });
  }
});

accountingRoutes.post('/journal-entries/reverse', (req, res) => {
  try {
    const { originalEntry, reversedByUserId, reason } = req.body ?? {};
    if (!originalEntry || !reversedByUserId || !reason) return res.status(400).json({ error: 'originalEntry, reversedByUserId, and reason are required.' });
    return res.json({ reversed: JournalService.reverseJournalEntry(originalEntry, reversedByUserId, reason) });
  } catch (error) {
    return res.status(400).json({ error: (error as Error).message });
  }
});

accountingRoutes.post('/periods/checklist', (req, res) => {
  try {
    PeriodService.validateCloseChecklist(req.body?.checklist ?? {});
    return res.json({ ok: true, message: 'Checklist passed' });
  } catch (error) {
    return res.status(400).json({ error: (error as Error).message });
  }
});

accountingRoutes.post('/audit-trail', (req, res) => {
  const { entityType, entityId, action, actorUserId, companyId, changes, reason } = req.body ?? {};
  if (!entityType || !entityId || !action || !actorUserId || !companyId) {
    return res.status(400).json({ error: 'entityType, entityId, action, actorUserId, and companyId are required.' });
  }
  const auditRecord = AuditTrailService.createAuditRecord(entityType, entityId, action, actorUserId, companyId, changes ?? {}, reason);
  return res.status(201).json({ auditRecord });
});

accountingRoutes.post('/permissions/check', (req, res) => {
  const { roles, requiredPermission } = req.body ?? {};
  if (!Array.isArray(roles) || typeof requiredPermission !== 'string') {
    return res.status(400).json({ error: 'roles array and requiredPermission string are required.' });
  }
  return res.json({ permitted: AuthorizationService.hasPermission(roles, requiredPermission) });
});

accountingRoutes.post('/financial-calculations', (req, res) => {
  const input = req.body ?? {};
  const required = ['quantity','unitCost','openingInventory','purchases','closingInventory','rawMaterials','directLabour','overhead','openingWip','closingWip','grossSalary','paye','pension','otherDeductions','salesAmount','vatRate','taxableIncome','payeRate','invoiceAmount','whtRate','assetCost','usefulLifeYears'];
  const missing = required.filter((key) => typeof input[key] !== 'number' || !Number.isFinite(input[key]));
  if (missing.length) return res.status(400).json({ error: 'Provide numeric values for all calculation inputs.', missing });
  if (input.usefulLifeYears <= 0) return res.status(400).json({ error: 'usefulLifeYears must be greater than zero.' });
  return res.json({
    inventoryValuation: financialCalculations.calculateInventoryValuation(input.quantity, input.unitCost),
    costOfGoodsSold: financialCalculations.calculateCostOfGoodsSold(input.openingInventory, input.purchases, input.closingInventory),
    productionCost: financialCalculations.calculateProductionCost(input.rawMaterials, input.directLabour, input.overhead, input.openingWip, input.closingWip),
    netSalary: financialCalculations.calculateNetSalary(input.grossSalary, input.paye, input.pension, input.otherDeductions),
    vat: financialCalculations.calculateVAT(input.salesAmount, input.vatRate),
    paye: financialCalculations.calculatePAYE(input.taxableIncome, input.payeRate),
    withholdingTax: financialCalculations.calculateWHT(input.invoiceAmount, input.whtRate),
    straightLineDepreciation: financialCalculations.calculateDepreciation(input.assetCost, input.usefulLifeYears),
  });
});
