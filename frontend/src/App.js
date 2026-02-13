import React, { useState, useEffect } from 'react';
import {
  PlusCircle, TrendingUp, TrendingDown, Wallet, PieChart, BarChart3, Download,
  AlertTriangle, Calendar, Tag, FileText, Eye, EyeOff, Trash2, Edit3, Check, X,
  ArrowUpRight, ArrowDownRight, Menu, Search, User
} from 'lucide-react';
import {
  PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line
} from 'recharts';
import { localDB } from './db';

const FinanceManager = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [transactions, setTransactions] = useState([]);
  const [showBalance, setShowBalance] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  // API Base URL - No longer needed for local mode
  // const API_BASE_URL = 'http://localhost:5000';

  // Form state
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Filter state
  const [filters, setFilters] = useState({
    type: 'all',
    category: 'all',
    month: 'all'
  });

  const categories = {
    income: ['Gaji', 'Freelance', 'Investasi', 'Bonus', 'Hadiah', 'Penjualan', 'Lainnya'],
    expense: ['Makanan', 'Transportasi', 'Belanja', 'Hiburan', 'Tagihan', 'Kesehatan', 'Pendidikan', 'Rumah Tangga', 'Lainnya'],
    savings: ['Tabungan', 'Deposito', 'Investasi', 'Reksadana', 'Emas', 'Lainnya']
  };

  const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#f97316', '#06b6d4', '#84cc16', '#ec4899'];

  // Local Database Functions
  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      const data = await localDB.getAllTransactions();
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      showNotification('Gagal memuat data transaksi', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const addTransaction = async (transactionData) => {
    try {
      const id = await localDB.addTransaction(transactionData);
      return { ...transactionData, id };
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  };

  const updateTransaction = async (id, transactionData) => {
    try {
      await localDB.updateTransaction(id, transactionData);
      return { ...transactionData, id };
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  };

  const deleteTransactionFromDB = async (id) => {
    try {
      await localDB.deleteTransaction(id);
      return { id };
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  };

  // Notification helper
  const showNotification = (message, type = 'success') => {
    const successDiv = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
    successDiv.className = `fixed top-4 right-4 ${bgColor} text-white px-4 py-2 rounded-lg z-[100] shadow-lg animate-fade-in-down`;
    successDiv.textContent = message;
    document.body.appendChild(successDiv);
    setTimeout(() => {
      if (document.body.contains(successDiv)) {
        document.body.removeChild(successDiv);
      }
    }, 3000);
  };

  // Load data when component mounts
  useEffect(() => {
    fetchTransactions();
  }, []);

  // Calculate financial summary
  const calculateSummary = () => {
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);
    const savings = transactions.filter(t => t.type === 'savings').reduce((sum, t) => sum + Number(t.amount), 0);
    const balance = income - expense - savings;
    return { income, expense, savings, balance };
  };

  const { income, expense, savings, balance } = calculateSummary();

  // Check for low balance alert
  useEffect(() => {
    if (balance < 100000 && balance > 0 && transactions.length > 0) {
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 10000);
    } else {
      setShowAlert(false);
    }
  }, [balance, transactions.length]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!formData.amount || !formData.category) {
      showNotification('Mohon isi semua field yang diperlukan', 'error');
      return;
    }

    setIsLoading(true);

    try {
      if (editingId) {
        // Update existing transaction
        await updateTransaction(editingId, {
          type: formData.type,
          amount: Number(formData.amount),
          category: formData.category,
          description: formData.description,
          date: formData.date
        });
        showNotification('Transaksi berhasil diupdate!');
        setEditingId(null);
      } else {
        // Add new transaction
        const newTransaction = {
          id: Date.now(),
          type: formData.type,
          amount: Number(formData.amount),
          category: formData.category,
          description: formData.description,
          date: formData.date,
          timestamp: new Date().toISOString()
        };
        
        await addTransaction(newTransaction);
        showNotification('Transaksi berhasil ditambahkan!');
      }

      // Reset form
      setFormData({
        type: 'expense',
        amount: '',
        category: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });

      // Refresh transactions list
      await fetchTransactions();
    } catch (error) {
      showNotification('Gagal menyimpan transaksi', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete transaction
  const deleteTransaction = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
      try {
        await deleteTransactionFromDB(id);
        showNotification('Transaksi berhasil dihapus!');
        await fetchTransactions(); // Refresh list
      } catch (error) {
        showNotification('Gagal menghapus transaksi', 'error');
      }
    }
  };

  // Edit transaction
  const editTransaction = (transaction) => {
    setFormData({
      type: transaction.type,
      amount: transaction.amount.toString(),
      category: transaction.category,
      description: transaction.description,
      date: transaction.date
    });
    setEditingId(transaction.id);
    setActiveTab('transactions');
  };

  // Cancel edit
  const cancelEdit = () => {
    setEditingId(null);
    setFormData({
      type: 'expense',
      amount: '',
      category: '',
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  // Get expense data for charts
  const getExpenseData = () => {
    const expensesByCategory = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
        return acc;
      }, {});

    return Object.entries(expensesByCategory).map(([name, value]) => ({ name, value }));
  };

  // Get monthly data
  const getMonthlyData = () => {
    const monthlyData = {};
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
      monthlyData[month] = { month, income: 0, expense: 0, savings: 0 };
    }

    transactions.forEach(t => {
      const month = new Date(t.date).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
      if (monthlyData[month]) {
        monthlyData[month][t.type] += Number(t.amount);
      }
    });

    return Object.values(monthlyData);
  };

  // Get daily balance trend
  const getDailyBalanceData = () => {
    const dailyData = {};
    let runningBalance = 0;

    transactions
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .forEach(t => {
        const date = t.date;
        if (!dailyData[date]) {
          dailyData[date] = { date, balance: runningBalance };
        }
        if (t.type === 'income') {
          runningBalance += Number(t.amount);
        } else {
          runningBalance -= Number(t.amount);
        }
        dailyData[date].balance = runningBalance;
      });

    return Object.values(dailyData).slice(-30);
  };

  // Filter transactions
  const getFilteredTransactions = () => {
    return transactions.filter(t => {
      const typeMatch = filters.type === 'all' || t.type === filters.type;
      const categoryMatch = filters.category === 'all' || t.category === filters.category;
      const monthMatch = filters.month === 'all' ||
        new Date(t.date).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }) === filters.month;
      return typeMatch && categoryMatch && monthMatch;
    });
  };

  // Get months for filter
  const getAvailableMonths = () => {
    const months = [...new Set(transactions.map(t =>
      new Date(t.date).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })
    ))];
    return months.sort();
  };

  // Export to TXT (enhanced simulation)
  const exportToTXT = (type = 'monthly') => {
    setExportLoading(true);

    setTimeout(() => {
      const reportData = {
        period: type === 'monthly' ? 'Bulanan' : 'Tahunan',
        date: new Date().toLocaleDateString('id-ID'),
        summary: { income, expense, savings, balance },
        transactions: transactions.slice(0, type === 'monthly' ? 50 : transactions.length),
        categories: Object.keys(categories)
      };

      const txtContent = `
=== LAPORAN KEUANGAN ${reportData.period.toUpperCase()} ===
Periode: ${reportData.date}
Generated: ${new Date().toLocaleString('id-ID')}

RINGKASAN:
- Total Pemasukan: ${formatCurrency(income)}
- Total Pengeluaran: ${formatCurrency(expense)}
- Total Tabungan: ${formatCurrency(savings)}
- Saldo Akhir: ${formatCurrency(balance)}

RINCIAN TRANSAKSI:
${reportData.transactions.map(t =>
  `${new Date(t.date).toLocaleDateString('id-ID')} | ${t.type.toUpperCase()} | ${t.category} | ${formatCurrency(t.amount)} | ${t.description || '-'}`
).join('\n')}

=== AKHIR LAPORAN ===
      `;

      const blob = new Blob([txtContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `laporan-keuangan-${type}-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setExportLoading(false);
      showNotification(`Laporan ${type} berhasil diekspor!`);
    }, 2000);
  };

  // StatCard component
  const StatCard = ({ title, amount, icon: Icon, color, trend, subtitle }) => (
    <div className="glass-card p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="absolute -right-6 -top-6 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
        <Icon size={120} className={color} />
      </div>
      
      <div className="relative z-10 flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-gray-800 tracking-tight">
            {showBalance ? formatCurrency(amount) : '••••••••'}
          </h3>
          
          <div className="flex items-center mt-3 space-x-2">
            {trend !== undefined && (
              <span className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${
                trend > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
              }`}>
                {trend > 0 ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />}
                {Math.abs(trend)}%
              </span>
            )}
            {subtitle && (
              <span className="text-xs text-gray-400">{subtitle}</span>
            )}
          </div>
        </div>
        
        <div className={`p-3 rounded-2xl ${color.replace('text-', 'bg-').replace('600', '50')} ${color}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );

  // TransactionItem component
  const TransactionItem = ({ transaction, showActions = false }) => (
    <div className="group bg-white hover:bg-gray-50 p-4 rounded-2xl transition-all border border-gray-100 hover:border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
            transaction.type === 'income' ? 'bg-green-50 text-green-600' :
            transaction.type === 'expense' ? 'bg-red-50 text-red-600' :
            'bg-blue-50 text-blue-600'
          }`}>
            {transaction.type === 'income' ? <TrendingUp size={20} /> :
             transaction.type === 'expense' ? <TrendingDown size={20} /> :
             <Wallet size={20} />}
          </div>
          
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900">{transaction.category}</h4>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-xs text-gray-400">
                {new Date(transaction.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
              </span>
              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
              <span className="text-xs text-gray-500 truncate max-w-[200px]">
                {transaction.description || 'Tanpa catatan'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <span className={`font-bold ${
            transaction.type === 'income' ? 'text-green-600' :
            transaction.type === 'expense' ? 'text-red-600' :
            'text-blue-600'
          }`}>
            {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
          </span>
          
          {showActions && (
            <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => editTransaction(transaction)}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Edit"
              >
                <Edit3 size={16} />
              </button>
              <button
                onClick={() => deleteTransaction(transaction.id)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Hapus"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-gray-900 selection:bg-primary-100 selection:text-primary-900">
      
      {/* Sidebar for Desktop */}
      <aside className="fixed left-0 top-0 h-screen w-72 bg-white/80 backdrop-blur-2xl border-r border-gray-200 hidden lg:flex flex-col z-50 transition-all duration-300">
        <div className="p-8">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-primary-600 to-secondary-600 p-2.5 rounded-xl shadow-lg shadow-primary-500/30">
              <Wallet className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                FinanceFlow
              </h1>
              <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mt-0.5">Personal Manager</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Wallet },
            { id: 'transactions', label: 'Transaksi', icon: FileText },
            { id: 'reports', label: 'Laporan', icon: BarChart3 },
            { id: 'export', label: 'Ekspor Data', icon: Download }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200 group relative overflow-hidden ${
                activeTab === id
                  ? 'text-white shadow-lg shadow-primary-500/25'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {activeTab === id && (
                <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-secondary-600" />
              )}
              <Icon size={20} className={`relative z-10 transition-transform duration-300 ${activeTab === id ? 'scale-110' : 'group-hover:scale-110'}`} />
              <span className="relative z-10 font-medium">{label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6">
           <div className="bg-gray-900 rounded-2xl p-5 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-primary-500/20 rounded-full blur-2xl group-hover:bg-primary-500/30 transition-all duration-500" />
              <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-24 h-24 bg-secondary-500/20 rounded-full blur-2xl group-hover:bg-secondary-500/30 transition-all duration-500" />
              
              <p className="text-gray-400 text-xs font-medium mb-1 relative z-10">Saldo Total</p>
              <div className="flex items-center justify-between relative z-10">
                <p className="text-xl font-bold text-white tracking-tight">
                   {showBalance ? formatCurrency(balance) : '••••••••'}
                </p>
              </div>
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="mt-4 w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-2 relative z-10 border border-white/5"
              >
                {showBalance ? <EyeOff size={14} /> : <Eye size={14} />}
                {showBalance ? 'Sembunyikan' : 'Tampilkan'}
              </button>
           </div>
        </div>
      </aside>

      {/* Mobile Nav */}
      <div className="lg:hidden fixed bottom-6 left-6 right-6 bg-white/90 backdrop-blur-xl border border-white/20 shadow-2xl shadow-gray-200/50 p-2 rounded-2xl z-50 flex justify-between px-6">
        {[
            { id: 'dashboard', icon: Wallet },
            { id: 'transactions', icon: FileText },
            { id: 'reports', icon: BarChart3 },
            { id: 'export', icon: Download }
        ].map(({ id, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`p-4 rounded-xl transition-all duration-300 relative ${
              activeTab === id ? 'text-primary-600 -translate-y-6 bg-white shadow-xl shadow-primary-500/20 ring-4 ring-slate-50' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Icon size={24} />
            {activeTab === id && (
              <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-primary-600 opacity-0 animate-fade-in-up">
                •
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <main className="lg:pl-72 flex-1 w-full min-h-screen relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-12 pb-32 lg:pb-12">
          
          {/* Header */}
          <header className="mb-10 flex flex-col md:flex-row md:justify-between md:items-end gap-6">
              <div>
                <h2 className="text-4xl font-display font-bold text-gray-900 tracking-tight">
                  {activeTab === 'dashboard' && 'Dashboard'}
                  {activeTab === 'transactions' && 'Transaksi'}
                  {activeTab === 'reports' && 'Laporan'}
                  {activeTab === 'export' && 'Ekspor'}
                </h2>
                <p className="text-gray-500 mt-2 text-lg">
                   {activeTab === 'dashboard' && 'Ringkasan aktivitas keuangan Anda'}
                   {activeTab === 'transactions' && 'Kelola pemasukan dan pengeluaran'}
                   {activeTab === 'reports' && 'Analisis mendalam kondisi keuangan'}
                   {activeTab === 'export' && 'Unduh laporan dalam format teks'}
                </p>
              </div>
              
              <div className="hidden md:flex items-center gap-4">
                 <div className="flex items-center gap-3 bg-white pl-1 pr-4 py-1 rounded-full border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                       <User size={18} />
                    </div>
                     <div>
                       <p className="text-xs text-green-600 font-medium mt-0.5">● Online</p>
                     </div>
                 </div>
              </div>
           </header>

          {/* Alert */}
          {showAlert && (
            <div className="fixed top-6 right-6 z-[60] animate-slide-in-right">
              <div className="bg-red-500 text-white rounded-2xl p-4 shadow-2xl shadow-red-500/30 flex items-start gap-3 max-w-sm border border-red-400">
                 <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                   <AlertTriangle size={20} className="text-white" />
                 </div>
                 <div>
                    <h4 className="font-bold text-white">Saldo Rendah!</h4>
                    <p className="text-red-50 text-sm mt-1">Saldo tersisa {formatCurrency(balance)}</p>
                    <button onClick={() => setShowAlert(false)} className="text-xs text-white/80 hover:text-white mt-2 underline decoration-white/50">
                      Tutup
                    </button>
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-fade-in">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Total Saldo"
                  amount={balance}
                  icon={Wallet}
                  color="text-primary-600"
                  subtitle={balance >= 0 ? "Keuangan sehat" : "Perlu perhatian"}
                />
                <StatCard
                  title="Pemasukan"
                  amount={income}
                  icon={TrendingUp}
                  color="text-green-600"
                  trend={5.2}
                  subtitle={`${transactions.filter(t => t.type === 'income').length} transaksi`}
                />
                <StatCard
                  title="Pengeluaran"
                  amount={expense}
                  icon={TrendingDown}
                  color="text-red-600"
                  trend={-2.1}
                  subtitle={`${transactions.filter(t => t.type === 'expense').length} transaksi`}
                />
                <StatCard
                  title="Tabungan"
                  amount={savings}
                  icon={PieChart}
                  color="text-secondary-600"
                  trend={12.5}
                  subtitle={`${transactions.filter(t => t.type === 'savings').length} transaksi`}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Balance Trend */}
                <div className="lg:col-span-2 glass-card p-6">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">Analisis Saldo</h3>
                      <p className="text-gray-500 text-sm">Tren pergerakan saldo harian</p>
                    </div>
                    <div className="p-2 bg-primary-50 text-primary-600 rounded-lg">
                      <TrendingUp size={20} />
                    </div>
                  </div>
                  {getDailyBalanceData().length > 0 ? (
                    <div className="h-80 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={getDailyBalanceData()}>
                          <defs>
                            <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="date" tickFormatter={(date) => new Date(date).getDate()} axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                          <YAxis tickFormatter={(value) => `${value/1000000}M`} axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                          <Tooltip 
                            contentStyle={{backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}}
                            formatter={(value) => [formatCurrency(value), 'Saldo']}
                            labelFormatter={(date) => new Date(date).toLocaleDateString('id-ID')}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="balance" 
                            stroke="#0ea5e9" 
                            strokeWidth={3}
                            dot={false}
                            activeDot={{ r: 6, fill: '#0ea5e9', strokeWidth: 0 }}
                            fill="url(#colorBalance)"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-80 flex flex-col items-center justify-center text-gray-400">
                       <BarChart3 size={48} className="mb-2 opacity-50" />
                       <p>Belum ada data</p>
                    </div>
                  )}
                </div>

                {/* Pie Chart */}
                <div className="glass-card p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-6">Distribusi</h3>
                  {getExpenseData().length > 0 ? (
                    <div className="h-64 relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={getExpenseData()}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            startAngle={90}
                            endAngle={-270}
                            cornerRadius={6}
                          >
                            {getExpenseData().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                        <p className="text-gray-400 text-xs">Total</p>
                        <p className="text-gray-900 font-bold">{formatCurrency(expense)}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="h-64 flex flex-col items-center justify-center text-gray-400">
                      <PieChart size={48} className="mb-2 opacity-50" />
                      <p>Belum ada pengeluaran</p>
                    </div>
                  )}
                  {/* Legend */}
                  <div className="mt-4 space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                     {getExpenseData().map((entry, index) => (
                       <div key={index} className="flex items-center justify-between text-sm">
                          <div className="flex items-center">
                             <div className="w-2 h-2 rounded-full mr-2" style={{backgroundColor: COLORS[index % COLORS.length]}} />
                             <span className="text-gray-600 truncate max-w-[120px]">{entry.name}</span>
                          </div>
                          <span className="font-medium text-gray-900">{((entry.value / expense) * 100).toFixed(0)}%</span>
                       </div>
                     ))}
                  </div>
                </div>
              </div>

              {/* Recent Transactions */}
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-800">Transaksi Terbaru</h3>
                  <button
                    onClick={() => setActiveTab('transactions')}
                    className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center gap-1 transition-colors"
                  >
                    Lihat Semua <TrendingUp size={14} className="rotate-45" />
                  </button>
                </div>
                <div className="space-y-3">
                  {isLoading ? (
                    <div className="text-center py-12">
                       <span className="loading-spinner" />
                    </div>
                  ) : transactions.slice(0, 5).map(transaction => (
                    <TransactionItem key={transaction.id} transaction={transaction} />
                  ))}
                  {transactions.length === 0 && !isLoading && (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                      <PlusCircle size={48} className="text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">Belum ada transaksi</p>
                      <button
                        onClick={() => setActiveTab('transactions')}
                        className="mt-3 text-primary-600 text-sm font-semibold hover:underline"
                      >
                        Tambah Sekarang
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
              <div className="lg:col-span-1">
                <div className="glass-card p-6 sticky top-24">
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`p-3 rounded-xl ${editingId ? 'bg-orange-100 text-orange-600' : 'bg-primary-100 text-primary-600'}`}>
                      {editingId ? <Edit3 size={24} /> : <PlusCircle size={24} />}
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">
                      {editingId ? 'Edit Transaksi' : 'Transaksi Baru'}
                    </h3>
                  </div>
                  
                  {editingId && (
                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6 flex items-start gap-3">
                      <AlertTriangle className="text-orange-500 shrink-0 mt-0.5" size={16} />
                      <div className="flex-1">
                        <p className="text-orange-800 text-sm font-medium">Anda sedang mengedit transaksi</p>
                        <button onClick={cancelEdit} className="text-orange-600 text-xs font-bold mt-1 hover:underline">
                          Batalkan Edit
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Jenis Transaksi</label>
                      <div className="grid grid-cols-3 gap-2">
                         {['expense', 'income', 'savings'].map(type => (
                           <button
                             key={type}
                             onClick={() => setFormData({...formData, type, category: ''})}
                             className={`py-2 px-1 rounded-lg text-xs font-bold capitalize transition-all ${
                               formData.type === type 
                               ? (type === 'income' ? 'bg-green-100 text-green-700 ring-2 ring-green-500 ring-offset-1' : type === 'expense' ? 'bg-red-100 text-red-700 ring-2 ring-red-500 ring-offset-1' : 'bg-primary-100 text-primary-700 ring-2 ring-primary-500 ring-offset-1')
                               : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                             }`}
                           >
                             {type === 'expense' ? 'Pengeluaran' : type === 'income' ? 'Pemasukan' : 'Tabungan'}
                           </button>
                         ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Nominal (Rp)</label>
                      <input
                        type="number"
                        value={formData.amount}
                        onChange={(e) => setFormData({...formData, amount: e.target.value})}
                        placeholder="0"
                        className="w-full p-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary-500 transition-all font-mono text-lg font-bold text-gray-800 placeholder-gray-300"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Kategori</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                        className="w-full p-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary-500 transition-all text-gray-800 font-medium"
                        required
                      >
                        <option value="">Pilih kategori...</option>
                        {categories[formData.type].map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Tanggal</label>
                        <input
                          type="date"
                          value={formData.date}
                          onChange={(e) => setFormData({...formData, date: e.target.value})}
                          className="w-full p-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary-500 transition-all text-sm font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Deskripsi</label>
                        <input
                          type="text"
                          value={formData.description}
                          onChange={(e) => setFormData({...formData, description: e.target.value})}
                          placeholder="Opsional..."
                          className="w-full p-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary-500 transition-all text-sm"
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleSubmit}
                      disabled={isLoading}
                      className={`w-full py-4 rounded-xl font-bold text-white shadow-xl shadow-primary-500/20 transition-all hover:translate-y-[-2px] active:translate-y-[1px] ${
                        editingId 
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700' 
                        : 'bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800'
                      }`}
                    >
                      {isLoading ? 'Menyimpan...' : (editingId ? 'Update Transaksi' : 'Simpan Transaksi')}
                    </button>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 space-y-6">
                {/* Search & Filter Bar */}
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-wrap gap-3">
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters({...filters, type: e.target.value})}
                    className="p-2.5 bg-gray-50 border-none rounded-lg text-sm font-medium text-gray-600 focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="all">Semua Jenis</option>
                    <option value="income">Pemasukan</option>
                    <option value="expense">Pengeluaran</option>
                    <option value="savings">Tabungan</option>
                  </select>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters({...filters, category: e.target.value})}
                    className="p-2.5 bg-gray-50 border-none rounded-lg text-sm font-medium text-gray-600 focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="all">Semua Kategori</option>
                    {[...categories.income, ...categories.expense, ...categories.savings]
                      .filter((cat, index, arr) => arr.indexOf(cat) === index)
                      .map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                  </select>
                  <select
                    value={filters.month}
                    onChange={(e) => setFilters({...filters, month: e.target.value})}
                    className="p-2.5 bg-gray-50 border-none rounded-lg text-sm font-medium text-gray-600 focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="all">Semua Periode</option>
                    {getAvailableMonths().map(month => (
                      <option key={month} value={month}>{month}</option>
                    ))}
                  </select>
                  <div className="ml-auto text-sm text-gray-500 py-3 px-2">
                    {getFilteredTransactions().length} transaksi
                  </div>
                </div>

                <div className="space-y-3">
                  {getFilteredTransactions().map(transaction => (
                    <TransactionItem key={transaction.id} transaction={transaction} showActions={true} />
                  ))}
                  {getFilteredTransactions().length === 0 && (
                     <div className="text-center py-16">
                        <p className="text-gray-400">Tidak ada data ditemukan</p>
                     </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="space-y-6 animate-fade-in">
              <div className="glass-card p-8 bg-gradient-to-br from-indigo-600 to-purple-700 text-white border-none shadow-2xl shadow-indigo-500/30">
                <h3 className="text-2xl font-bold mb-6">Kesehatan Keuangan</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                    { label: 'Stabilitas', val: balance > 0 ? Math.min(100, Math.round((balance / 1000000) * 10)) : 0, post: '/100' },
                    { label: 'Rasio Tabungan', val: expense > 0 ? Math.min(100, Math.round((savings / expense) * 100)) : 0, post: '%' },
                    { label: 'Efisiensi', val: income > 0 ? Math.round((1 - (expense / income)) * 100) : 0, post: '%' }
                  ].map((item, i) => (
                    <div key={i} className="text-center p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
                      <p className="text-indigo-100 text-sm mb-1">{item.label}</p>
                      <p className="text-4xl font-bold">{item.val}{item.post}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 {/* Monthly Chart */}
                 <div className="glass-card p-6">
                    <h4 className="font-bold text-gray-800 mb-6">Arus Kas Bulanan</h4>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={getMonthlyData()}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                          <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} />
                          <Bar dataKey="income" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                          <Bar dataKey="expense" fill="#EF4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                 </div>

                 {/* Tips */}
                 <div className="glass-card p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100">
                    <h4 className="font-bold text-amber-800 mb-6 flex items-center gap-2">
                       <AlertTriangle size={20} /> Insight & Tips
                    </h4>
                    <div className="space-y-4">
                       {expense > income && (
                         <div className="flex gap-3 items-start p-3 bg-white/50 rounded-xl">
                            <TrendingDown className="text-red-500 shrink-0" />
                            <p className="text-sm text-gray-600">Pengeluaran Anda melebihi pemasukan bulan ini. Coba kurangi jajan di kategori <strong>Makanan</strong>.</p>
                         </div>
                       )}
                       {savings < (income * 0.2) && (
                         <div className="flex gap-3 items-start p-3 bg-white/50 rounded-xl">
                            <Wallet className="text-amber-500 shrink-0" />
                            <p className="text-sm text-gray-600">Tabungan Anda di bawah 20%. Sisihkan uang di awal bulan, bukan dari sisa akhir bulan.</p>
                         </div>
                       )}
                       <div className="flex gap-3 items-start p-3 bg-white/50 rounded-xl">
                          <Check className="text-green-500 shrink-0" />
                          <p className="text-sm text-gray-600">Pertahankan pencatatan rutin setiap hari untuk akurasi data yang lebih baik.</p>
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'export' && (
            <div>
               <div className="glass-card p-8 text-center max-w-2xl mx-auto">
                  <div className="w-20 h-20 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary-500/20">
                     <Download size={40} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Unduh Laporan</h3>
                  <p className="text-gray-500 mb-8">Dapatkan rekapitulasi lengkap keuangan Anda dalam format TXT untuk arsip pribadi.</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <button
                       onClick={() => exportToTXT('monthly')}
                       disabled={exportLoading}
                       className="p-6 rounded-2xl border-2 border-gray-100 hover:border-primary-500 hover:bg-primary-50 transition-all group text-left relative overflow-hidden"
                     >
                        <h4 className="font-bold text-gray-800 group-hover:text-primary-700">Laporan Bulanan</h4>
                        <p className="text-xs text-gray-400 mt-1">Transaksi bulan ini saja</p>
                        <Download className="absolute bottom-4 right-4 text-gray-200 group-hover:text-primary-400 transition-colors" size={32} />
                     </button>
                     <button
                       onClick={() => exportToTXT('yearly')}
                       disabled={exportLoading}
                       className="p-6 rounded-2xl border-2 border-gray-100 hover:border-secondary-500 hover:bg-secondary-50 transition-all group text-left relative overflow-hidden"
                     >
                        <h4 className="font-bold text-gray-800 group-hover:text-secondary-700">Laporan Tahunan</h4>
                        <p className="text-xs text-gray-400 mt-1">Ringkasan satu tahun penuh</p>
                        <FileText className="absolute bottom-4 right-4 text-gray-200 group-hover:text-secondary-400 transition-colors" size={32} />
                     </button>
                  </div>
               </div>
            </div>
          )}

        </div>
      </main>

      {/* Loading Overlay */}
      {(isLoading || exportLoading) && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-[100]">
          <div className="bg-white p-6 rounded-2xl shadow-2xl flex flex-col items-center animate-bounce-short">
            <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4" />
            <p className="font-bold text-gray-800">Memproses...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceManager;