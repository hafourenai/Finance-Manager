import 'package:flutter/material.dart';
import '../models/transaction.dart' as model;
import '../services/database_helper.dart';

class TransactionsScreen extends StatefulWidget {
  final List<model.Transaction> transactions;
  final VoidCallback onRefresh;
  final String Function(double) formatCurrency;

  const TransactionsScreen({
    super.key,
    required this.transactions,
    required this.onRefresh,
    required this.formatCurrency,
  });

  @override
  State<TransactionsScreen> createState() => _TransactionsScreenState();
}

class _TransactionsScreenState extends State<TransactionsScreen> {
  String _filterType = 'all';
  String _filterCategory = 'all';

  static const categories = {
    'income': [
      'Gaji',
      'Freelance',
      'Investasi',
      'Bonus',
      'Hadiah',
      'Penjualan',
      'Lainnya',
    ],
    'expense': [
      'Makanan',
      'Transportasi',
      'Belanja',
      'Hiburan',
      'Tagihan',
      'Kesehatan',
      'Pendidikan',
      'Rumah Tangga',
      'Lainnya',
    ],
    'savings': [
      'Tabungan',
      'Deposito',
      'Investasi',
      'Reksadana',
      'Emas',
      'Lainnya',
    ],
  };

  List<model.Transaction> get filteredTransactions {
    return widget.transactions.where((t) {
      if (_filterType != 'all' && t.type != _filterType) {
        return false;
      }
      if (_filterCategory != 'all' && t.category != _filterCategory) {
        return false;
      }
      return true;
    }).toList();
  }

  void _showAddEditDialog({model.Transaction? existing}) {
    String type = existing?.type ?? 'expense';
    final amountCtrl = TextEditingController(
      text: existing != null ? existing.amount.toStringAsFixed(0) : '',
    );
    String category = existing?.category ?? '';
    final descCtrl = TextEditingController(text: existing?.description ?? '');
    DateTime date = existing != null
        ? DateTime.parse(existing.date)
        : DateTime.now();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        return StatefulBuilder(
          builder: (ctx, setModalState) {
            final cats = categories[type] ?? [];
            if (!cats.contains(category)) category = '';

            return Container(
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
              ),
              padding: EdgeInsets.only(
                bottom: MediaQuery.of(ctx).viewInsets.bottom + 16,
                left: 20,
                right: 20,
                top: 16,
              ),
              child: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Center(
                      child: Container(
                        width: 40,
                        height: 4,
                        decoration: BoxDecoration(
                          color: Colors.grey.shade300,
                          borderRadius: BorderRadius.circular(2),
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      existing != null ? 'Edit Transaksi' : 'Tambah Transaksi',
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    const SizedBox(height: 20),

                    // Type Selector
                    Row(
                      children: ['expense', 'income', 'savings'].map((t) {
                        final selected = type == t;
                        final color = t == 'income'
                            ? const Color(0xFF10B981)
                            : t == 'expense'
                            ? const Color(0xFFEF4444)
                            : const Color(0xFF0ea5e9);
                        return Expanded(
                          child: GestureDetector(
                            onTap: () => setModalState(() {
                              type = t;
                              category = '';
                            }),
                            child: Container(
                              margin: const EdgeInsets.symmetric(horizontal: 3),
                              padding: const EdgeInsets.symmetric(vertical: 10),
                              decoration: BoxDecoration(
                                color: selected
                                    ? color.withValues(alpha: 0.1)
                                    : const Color(0xFFF1F5F9),
                                borderRadius: BorderRadius.circular(10),
                                border: selected
                                    ? Border.all(color: color, width: 2)
                                    : null,
                              ),
                              alignment: Alignment.center,
                              child: Text(
                                t == 'expense'
                                    ? 'Pengeluaran'
                                    : t == 'income'
                                    ? 'Pemasukan'
                                    : 'Tabungan',
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w700,
                                  color: selected ? color : Colors.grey,
                                ),
                              ),
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                    const SizedBox(height: 16),

                    // Amount
                    TextField(
                      controller: amountCtrl,
                      keyboardType: TextInputType.number,
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w700,
                      ),
                      decoration: const InputDecoration(
                        labelText: 'Nominal (Rp)',
                        prefixText: 'Rp ',
                      ),
                    ),
                    const SizedBox(height: 12),

                    // Category
                    DropdownButtonFormField<String>(
                      initialValue: category.isEmpty ? null : category,
                      decoration: const InputDecoration(labelText: 'Kategori'),
                      items: cats
                          .map(
                            (c) => DropdownMenuItem(value: c, child: Text(c)),
                          )
                          .toList(),
                      onChanged: (v) => setModalState(() => category = v ?? ''),
                    ),
                    const SizedBox(height: 12),

                    // Date
                    GestureDetector(
                      onTap: () async {
                        final picked = await showDatePicker(
                          context: ctx,
                          initialDate: date,
                          firstDate: DateTime(2020),
                          lastDate: DateTime(2030),
                        );
                        if (picked != null) {
                          setModalState(() => date = picked);
                        }
                      },
                      child: InputDecorator(
                        decoration: const InputDecoration(
                          labelText: 'Tanggal',
                          suffixIcon: Icon(Icons.calendar_today, size: 18),
                        ),
                        child: Text(
                          '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}',
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),

                    // Description
                    TextField(
                      controller: descCtrl,
                      decoration: const InputDecoration(
                        labelText: 'Deskripsi (Opsional)',
                      ),
                    ),
                    const SizedBox(height: 20),

                    // Submit
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: () async {
                          if (amountCtrl.text.isEmpty || category.isEmpty) {
                            ScaffoldMessenger.of(ctx).showSnackBar(
                              const SnackBar(
                                content: Text(
                                  'Nominal dan kategori wajib diisi',
                                ),
                              ),
                            );
                            return;
                          }
                          final t = model.Transaction(
                            id: existing?.id,
                            type: type,
                            amount: double.parse(amountCtrl.text),
                            category: category,
                            description: descCtrl.text,
                            date:
                                '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}',
                          );
                          if (existing != null) {
                            await DatabaseHelper.instance.updateTransaction(t);
                          } else {
                            await DatabaseHelper.instance.addTransaction(t);
                          }
                          if (ctx.mounted) Navigator.pop(ctx);
                          widget.onRefresh();
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: existing != null
                              ? const Color(0xFFF97316)
                              : const Color(0xFF0ea5e9),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        child: Text(
                          existing != null
                              ? 'Update Transaksi'
                              : 'Simpan Transaksi',
                          style: const TextStyle(
                            fontWeight: FontWeight.w700,
                            fontSize: 15,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  void _deleteTransaction(int id) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Hapus Transaksi?'),
        content: const Text('Transaksi ini akan dihapus permanen.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Batal'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Hapus', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
    if (confirm == true) {
      await DatabaseHelper.instance.deleteTransaction(id);
      widget.onRefresh();
    }
  }

  @override
  Widget build(BuildContext context) {
    final filtered = filteredTransactions;
    return Scaffold(
      appBar: AppBar(title: const Text('Transaksi'), centerTitle: false),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showAddEditDialog(),
        backgroundColor: const Color(0xFF0ea5e9),
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add),
        label: const Text(
          'Tambah',
          style: TextStyle(fontWeight: FontWeight.w700),
        ),
      ),
      body: Column(
        children: [
          // Filters
          Container(
            padding: const EdgeInsets.all(12),
            color: Colors.white,
            child: Row(
              children: [
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF1F5F9),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<String>(
                        value: _filterType,
                        isExpanded: true,
                        style: const TextStyle(
                          fontSize: 13,
                          color: Colors.black87,
                        ),
                        items: const [
                          DropdownMenuItem(
                            value: 'all',
                            child: Text('Semua Jenis'),
                          ),
                          DropdownMenuItem(
                            value: 'income',
                            child: Text('Pemasukan'),
                          ),
                          DropdownMenuItem(
                            value: 'expense',
                            child: Text('Pengeluaran'),
                          ),
                          DropdownMenuItem(
                            value: 'savings',
                            child: Text('Tabungan'),
                          ),
                        ],
                        onChanged: (v) =>
                            setState(() => _filterType = v ?? 'all'),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF1F5F9),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<String>(
                        value: _filterCategory,
                        isExpanded: true,
                        style: const TextStyle(
                          fontSize: 13,
                          color: Colors.black87,
                        ),
                        items: [
                          const DropdownMenuItem(
                            value: 'all',
                            child: Text('Semua Kategori'),
                          ),
                          ...{
                            ...categories['income']!,
                            ...categories['expense']!,
                            ...categories['savings']!,
                          }.map(
                            (c) => DropdownMenuItem(value: c, child: Text(c)),
                          ),
                        ],
                        onChanged: (v) =>
                            setState(() => _filterCategory = v ?? 'all'),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
            child: Align(
              alignment: Alignment.centerLeft,
              child: Text(
                '${filtered.length} transaksi',
                style: const TextStyle(fontSize: 13, color: Color(0xFF94A3B8)),
              ),
            ),
          ),
          // List
          Expanded(
            child: filtered.isEmpty
                ? const Center(
                    child: Text(
                      'Tidak ada data ditemukan',
                      style: TextStyle(color: Colors.grey),
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.only(bottom: 80),
                    itemCount: filtered.length,
                    itemBuilder: (ctx, i) {
                      final t = filtered[i];
                      final isIncome = t.type == 'income';
                      final isSavings = t.type == 'savings';
                      final color = isIncome
                          ? const Color(0xFF10B981)
                          : isSavings
                          ? const Color(0xFF0ea5e9)
                          : const Color(0xFFEF4444);
                      final prefix = isIncome ? '+' : '-';

                      return Dismissible(
                        key: Key(t.id.toString()),
                        direction: DismissDirection.endToStart,
                        background: Container(
                          alignment: Alignment.centerRight,
                          padding: const EdgeInsets.only(right: 20),
                          color: Colors.red.shade50,
                          child: const Icon(Icons.delete, color: Colors.red),
                        ),
                        confirmDismiss: (_) async {
                          _deleteTransaction(t.id!);
                          return false;
                        },
                        child: InkWell(
                          onTap: () => _showAddEditDialog(existing: t),
                          child: Container(
                            margin: const EdgeInsets.symmetric(
                              horizontal: 12,
                              vertical: 4,
                            ),
                            padding: const EdgeInsets.all(14),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(14),
                              border: Border.all(
                                color: const Color(0xFFE2E8F0),
                              ),
                            ),
                            child: Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.all(10),
                                  decoration: BoxDecoration(
                                    color: color.withValues(alpha: 0.1),
                                    borderRadius: BorderRadius.circular(10),
                                  ),
                                  child: Icon(
                                    isIncome
                                        ? Icons.arrow_downward
                                        : isSavings
                                        ? Icons.savings
                                        : Icons.arrow_upward,
                                    color: color,
                                    size: 20,
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        t.category,
                                        style: const TextStyle(
                                          fontWeight: FontWeight.w600,
                                          fontSize: 14,
                                        ),
                                      ),
                                      if (t.description.isNotEmpty)
                                        Text(
                                          t.description,
                                          style: const TextStyle(
                                            fontSize: 12,
                                            color: Color(0xFF94A3B8),
                                          ),
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                    ],
                                  ),
                                ),
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.end,
                                  children: [
                                    Text(
                                      '$prefix${widget.formatCurrency(t.amount)}',
                                      style: TextStyle(
                                        fontWeight: FontWeight.w700,
                                        fontSize: 14,
                                        color: color,
                                      ),
                                    ),
                                    Text(
                                      t.date,
                                      style: const TextStyle(
                                        fontSize: 11,
                                        color: Color(0xFF94A3B8),
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}
