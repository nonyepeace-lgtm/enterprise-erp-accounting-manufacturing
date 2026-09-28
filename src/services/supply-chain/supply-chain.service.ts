import { JournalService } from '../accounting/accounting.service.js';
import { BankReconciliationResult, Customer, InventoryItem, PurchaseLineItem, ReceivablesPayablesSummary, SaleLineItem, Supplier } from '../../types.js';

export class SupplierService {
  static createSupplier(input: Omit<Supplier, 'id'>): Supplier {
    return {
      id: `SUP-${Date.now()}`,
      ...input,
    };
  }
}

export class CustomerService {
  static createCustomer(input: Omit<Customer, 'id' | 'customerCode'>): Customer {
    return {
      id: `CUST-${Date.now()}`,
      customerCode: `C-${Date.now()}`,
      ...input,
    };
  }
}

export class InventoryService {
  static createInventoryItem(input: Omit<InventoryItem, 'id'>): InventoryItem {
    return {
      id: `INV-${Date.now()}`,
      ...input,
    };
  }

  static receiveGoods(item: InventoryItem, quantity: number, unitCost: number, companyId: string, periodId: string, createdByUserId: string) {
    const inventoryValue = quantity * unitCost;
    const entry = JournalService.createJournalEntry({
      companyId,
      periodId,
      description: `Goods received for ${item.name}`,
      reference: `GRN-${Date.now()}`,
      createdByUserId,
      lines: [
        { accountCode: '1200', accountName: 'Inventory - Raw Materials', debit: inventoryValue, credit: 0, narration: `Receipt of ${quantity} units of ${item.name}` },
        { accountCode: '2000', accountName: 'Accounts Payable', debit: 0, credit: inventoryValue, narration: 'Supplier payable for goods received' },
      ],
    });

    return {
      itemId: item.id,
      stockBefore: item.quantityOnHand,
      stockAfter: item.quantityOnHand + quantity,
      inventoryValue,
      journal: entry,
    };
  }

  static issueStock(item: InventoryItem, quantity: number, companyId: string, periodId: string, createdByUserId: string) {
    if (quantity > item.quantityOnHand) {
      throw new Error(`Insufficient stock for ${item.name}. Available: ${item.quantityOnHand}`);
    }

    const inventoryValue = quantity * item.unitCost;
    const entry = JournalService.createJournalEntry({
      companyId,
      periodId,
      description: `Issue stock for ${item.name}`,
      reference: `ISSUE-${Date.now()}`,
      createdByUserId,
      lines: [
        { accountCode: '5300', accountName: 'Cost of Goods Sold', debit: inventoryValue, credit: 0, narration: `Issue of ${quantity} units of ${item.name}` },
        { accountCode: '1202', accountName: 'Inventory - Finished Goods', debit: 0, credit: inventoryValue, narration: `Stock reduction for ${item.name}` },
      ],
    });

    return {
      itemId: item.id,
      stockBefore: item.quantityOnHand,
      stockAfter: item.quantityOnHand - quantity,
      inventoryValue,
      journal: entry,
    };
  }
}

export class PurchaseService {
  static createPurchase(
    supplier: Supplier,
    items: PurchaseLineItem[],
    companyId: string,
    periodId: string,
    createdByUserId: string,
    taxRate = 7.5
  ) {
    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);
    const vatAmount = subtotal * (taxRate / 100);
    const total = subtotal + vatAmount;

    const journal = JournalService.createJournalEntry({
      companyId,
      periodId,
      description: `Purchase from ${supplier.name}`,
      reference: `PO-${Date.now()}`,
      createdByUserId,
      lines: [
        { accountCode: '1200', accountName: 'Inventory - Raw Materials', debit: subtotal, credit: 0, narration: `Receipt of raw materials from ${supplier.name}` },
        { accountCode: '2100', accountName: 'VAT Payable', debit: 0, credit: vatAmount, narration: 'Input VAT payable' },
        { accountCode: '2000', accountName: 'Accounts Payable', debit: 0, credit: total, narration: `Supplier payable for ${supplier.name}` },
      ],
    });

    return {
      supplier,
      subtotal,
      vatAmount,
      total,
      journal,
      items,
    };
  }
}

export class SalesService {
  static createSalesInvoice(
    customer: Customer,
    items: SaleLineItem[],
    companyId: string,
    periodId: string,
    createdByUserId: string,
    taxRate = 7.5
  ) {
    const salesValue = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const vatAmount = salesValue * (taxRate / 100);
    const totalReceivable = salesValue + vatAmount;
    const cogs = items.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);

    const journal = JournalService.createJournalEntry({
      companyId,
      periodId,
      description: `Sales invoice to ${customer.name}`,
      reference: `INV-${Date.now()}`,
      createdByUserId,
      lines: [
        { accountCode: '1100', accountName: 'Accounts Receivable', debit: totalReceivable, credit: 0, narration: `Sales receivable from ${customer.name}` },
        { accountCode: '5300', accountName: 'Cost of Goods Sold', debit: cogs, credit: 0, narration: 'COGS recognized on sale' },
        { accountCode: '1202', accountName: 'Inventory - Finished Goods', debit: 0, credit: cogs, narration: 'Finished goods inventory reduction' },
        { accountCode: '4000', accountName: 'Sales Revenue', debit: 0, credit: salesValue, narration: 'Revenue recognized' },
        { accountCode: '2100', accountName: 'VAT Payable', debit: 0, credit: vatAmount, narration: 'Output VAT liability' },
      ],
    });

    return {
      customer,
      salesValue,
      vatAmount,
      totalReceivable,
      cogs,
      journal,
      items,
    };
  }
}

export class BankingService {
  static reconcileBank(ledgerBalance: number, statementBalance: number, unresolvedItems: string[] = []): BankReconciliationResult {
    const difference = statementBalance - ledgerBalance;

    return {
      ledgerBalance,
      statementBalance,
      difference,
      isBalanced: Math.abs(difference) < 0.01,
      unresolvedItems,
    };
  }
}

export class ReceivablesPayablesService {
  static getAgingSummary(receivables: number[], payables: number[]): ReceivablesPayablesSummary {
    const totalReceivables = receivables.reduce((sum, value) => sum + value, 0);
    const totalPayables = payables.reduce((sum, value) => sum + value, 0);

    return {
      totalReceivables,
      totalPayables,
      receivablesAging: {
        current: receivables[0] ?? 0,
        days30: receivables[1] ?? 0,
        days60: receivables[2] ?? 0,
        days90: receivables[3] ?? 0,
        overdue: receivables[4] ?? 0,
      },
      payablesAging: {
        current: payables[0] ?? 0,
        days30: payables[1] ?? 0,
        days60: payables[2] ?? 0,
        days90: payables[3] ?? 0,
        overdue: payables[4] ?? 0,
      },
    };
  }
}