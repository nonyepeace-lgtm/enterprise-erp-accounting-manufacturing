import { Router } from 'express';
import {
  BankingService,
  CustomerService,
  InventoryService,
  PurchaseService,
  ReceivablesPayablesService,
  SalesService,
  SupplierService,
} from '../services/supply-chain/supply-chain.service.js';

export const supplyChainRoutes = Router();

supplyChainRoutes.post('/suppliers', (req, res) => {
  const supplier = SupplierService.createSupplier(req.body);
  res.status(201).json({ supplier });
});

supplyChainRoutes.post('/customers', (req, res) => {
  const customer = CustomerService.createCustomer(req.body);
  res.status(201).json({ customer });
});

supplyChainRoutes.post('/inventory/items', (req, res) => {
  const item = InventoryService.createInventoryItem(req.body);
  res.status(201).json({ item });
});

supplyChainRoutes.post('/inventory/receive', (req, res) => {
  const { item, quantity, unitCost, companyId, periodId, createdByUserId } = req.body;
  try {
    const result = InventoryService.receiveGoods(item, Number(quantity), Number(unitCost), companyId, periodId, createdByUserId);
    res.status(201).json({ result });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

supplyChainRoutes.post('/purchase', (req, res) => {
  const { supplier, items, companyId, periodId, createdByUserId, taxRate } = req.body;
  try {
    const purchase = PurchaseService.createPurchase(
      supplier,
      items,
      companyId,
      periodId,
      createdByUserId,
      Number(taxRate || 7.5)
    );
    res.status(201).json({ purchase });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

supplyChainRoutes.post('/sales', (req, res) => {
  const { customer, items, companyId, periodId, createdByUserId, taxRate } = req.body;
  try {
    const sale = SalesService.createSalesInvoice(
      customer,
      items,
      companyId,
      periodId,
      createdByUserId,
      Number(taxRate || 7.5)
    );
    res.status(201).json({ sale });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

supplyChainRoutes.post('/bank/reconcile', (req, res) => {
  const { ledgerBalance, statementBalance, unresolvedItems } = req.body;
  const result = BankingService.reconcileBank(
    Number(ledgerBalance),
    Number(statementBalance),
    unresolvedItems || []
  );
  res.json({ result });
});

supplyChainRoutes.post('/aging', (req, res) => {
  const { receivables, payables } = req.body;
  const summary = ReceivablesPayablesService.getAgingSummary(receivables || [0, 0, 0, 0, 0], payables || [0, 0, 0, 0, 0]);
  res.json({ summary });
});

supplyChainRoutes.get('/health', (_req, res) => {
  res.json({ status: 'ok', module: 'supply-chain' });
});