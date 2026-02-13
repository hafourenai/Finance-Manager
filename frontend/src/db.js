import Dexie from 'dexie';

export const db = new Dexie('FinanceFlowDB');

db.version(1).stores({
  transactions: '++id, type, amount, category, description, date, timestamp'
});

// Helper functions for easy database access
export const localDB = {
  getAllTransactions: async () => {
    return await db.transactions.reverse().toArray();
  },
  
  addTransaction: async (transaction) => {
    return await db.transactions.add(transaction);
  },
  
  updateTransaction: async (id, transactionData) => {
    return await db.transactions.update(id, transactionData);
  },
  
  deleteTransaction: async (id) => {
    return await db.transactions.delete(id);
  }
};
