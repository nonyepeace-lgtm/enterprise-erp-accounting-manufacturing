export const financialCalculations = {
  calculateInventoryValuation: (quantity: number, unitCost: number) => quantity * unitCost,

  calculateCostOfGoodsSold: (openingInventory: number, purchases: number, closingInventory: number) => {
    return openingInventory + purchases - closingInventory;
  },

  calculateProductionCost: (rawMaterials: number, directLabour: number, overhead: number, openingWip: number, closingWip: number) => {
    return rawMaterials + directLabour + overhead + openingWip - closingWip;
  },

  calculateGrossPayroll: (basicSalary: number, allowances: number) => basicSalary + allowances,

  calculateNetSalary: (grossSalary: number, paye: number, pension: number, otherDeductions: number) => {
    return grossSalary - paye - pension - otherDeductions;
  },

  calculateVAT: (salesAmount: number, rate: number) => salesAmount * (rate / 100),

  calculatePAYE: (taxableIncome: number, rate: number) => taxableIncome * (rate / 100),

  calculateWHT: (invoiceAmount: number, rate: number) => invoiceAmount * (rate / 100),

  calculateDepreciation: (assetCost: number, usefulLifeYears: number) => assetCost / usefulLifeYears,
};
