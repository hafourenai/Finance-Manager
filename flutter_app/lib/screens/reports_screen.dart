import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import '../models/transaction.dart' as model;

class ReportsScreen extends StatelessWidget {
  final List<model.Transaction> transactions;
  final double income;
  final double expense;
  final double savings;
  final double balance;
  final String Function(double) formatCurrency;

  const ReportsScreen({
    super.key,
    required this.transactions,
    required this.income,
    required this.expense,
    required this.savings,
    required this.balance,
    required this.formatCurrency,
  });

  @override
  Widget build(BuildContext context) {
    final stabilitas = balance > 0
        ? (balance / 1000000 * 10).clamp(0, 100).round()
        : 0;
    final rasioTabungan = expense > 0
        ? (savings / expense * 100).clamp(0, 100).round()
        : 0;
    final efisiensi = income > 0 ? ((1 - expense / income) * 100).round() : 0;

    return Scaffold(
      appBar: AppBar(title: const Text('Laporan'), centerTitle: false),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Health Card
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF6366F1), Color(0xFF7C3AED)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF6366F1).withValues(alpha: 0.3),
                    blurRadius: 20,
                    offset: const Offset(0, 8),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Kesehatan Keuangan',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 20,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const SizedBox(height: 20),
                  Row(
                    children: [
                      _healthMetric('Stabilitas', '$stabilitas/100'),
                      _healthMetric('Rasio Tabungan', '$rasioTabungan%'),
                      _healthMetric('Efisiensi', '$efisiensi%'),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Monthly Bar Chart
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Arus Kas Bulanan',
                    style: TextStyle(fontWeight: FontWeight.w700, fontSize: 16),
                  ),
                  const SizedBox(height: 16),
                  SizedBox(height: 220, child: _buildBarChart()),
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      _legendDot(const Color(0xFF10B981), 'Pemasukan'),
                      const SizedBox(width: 16),
                      _legendDot(const Color(0xFFEF4444), 'Pengeluaran'),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Tips
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFFFFFBEB), Color(0xFFFFF7ED)],
                ),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFFDE68A)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Row(
                    children: [
                      Icon(Icons.lightbulb, color: Color(0xFFF59E0B), size: 20),
                      SizedBox(width: 8),
                      Text(
                        'Insight & Tips',
                        style: TextStyle(
                          fontWeight: FontWeight.w700,
                          fontSize: 16,
                          color: Color(0xFF92400E),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  if (expense > income)
                    _tipCard(
                      Icons.trending_down,
                      Colors.red,
                      'Pengeluaran Anda melebihi pemasukan bulan ini. Coba kurangi pengeluaran di kategori Makanan.',
                    ),
                  if (savings < income * 0.2)
                    _tipCard(
                      Icons.savings,
                      Colors.amber,
                      'Tabungan Anda di bawah 20%. Sisihkan uang di awal bulan, bukan dari sisa akhir bulan.',
                    ),
                  _tipCard(
                    Icons.check_circle,
                    Colors.green,
                    'Pertahankan pencatatan rutin setiap hari untuk akurasi data yang lebih baik.',
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  Widget _healthMetric(String label, String value) {
    return Expanded(
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 4),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.white.withValues(alpha: 0.15),
          borderRadius: BorderRadius.circular(14),
        ),
        child: Column(
          children: [
            Text(
              label,
              style: const TextStyle(color: Colors.white70, fontSize: 11),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 4),
            Text(
              value,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 22,
                fontWeight: FontWeight.w800,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBarChart() {
    final monthlyData = <String, Map<String, double>>{};
    for (var t in transactions) {
      final month = t.date.substring(0, 7); // YYYY-MM
      monthlyData[month] ??= {'income': 0, 'expense': 0};
      if (t.type == 'income') {
        monthlyData[month]!['income'] =
            monthlyData[month]!['income']! + t.amount;
      } else if (t.type == 'expense') {
        monthlyData[month]!['expense'] =
            monthlyData[month]!['expense']! + t.amount;
      }
    }
    if (monthlyData.isEmpty) {
      return const Center(child: Text('Belum ada data'));
    }

    final sortedKeys = monthlyData.keys.toList()..sort();
    final last6 = sortedKeys.length > 6
        ? sortedKeys.sublist(sortedKeys.length - 6)
        : sortedKeys;

    return BarChart(
      BarChartData(
        alignment: BarChartAlignment.spaceAround,
        maxY:
            last6.fold<double>(0, (max, key) {
              final inc = monthlyData[key]!['income'] ?? 0;
              final exp = monthlyData[key]!['expense'] ?? 0;
              final m = inc > exp ? inc : exp;
              return m > max ? m : max;
            }) *
            1.2,
        barTouchData: BarTouchData(enabled: false),
        titlesData: FlTitlesData(
          show: true,
          bottomTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              getTitlesWidget: (value, meta) {
                final idx = value.toInt();
                if (idx >= 0 && idx < last6.length) {
                  return Padding(
                    padding: const EdgeInsets.only(top: 4),
                    child: Text(
                      last6[idx].substring(5),
                      style: const TextStyle(
                        fontSize: 11,
                        color: Color(0xFF94A3B8),
                      ),
                    ),
                  );
                }
                return const SizedBox();
              },
            ),
          ),
          leftTitles: const AxisTitles(
            sideTitles: SideTitles(showTitles: false),
          ),
          topTitles: const AxisTitles(
            sideTitles: SideTitles(showTitles: false),
          ),
          rightTitles: const AxisTitles(
            sideTitles: SideTitles(showTitles: false),
          ),
        ),
        gridData: const FlGridData(show: false),
        borderData: FlBorderData(show: false),
        barGroups: last6.asMap().entries.map((e) {
          final data = monthlyData[e.value]!;
          return BarChartGroupData(
            x: e.key,
            barRods: [
              BarChartRodData(
                toY: data['income'] ?? 0,
                color: const Color(0xFF10B981),
                width: 12,
                borderRadius: const BorderRadius.vertical(
                  top: Radius.circular(4),
                ),
              ),
              BarChartRodData(
                toY: data['expense'] ?? 0,
                color: const Color(0xFFEF4444),
                width: 12,
                borderRadius: const BorderRadius.vertical(
                  top: Radius.circular(4),
                ),
              ),
            ],
          );
        }).toList(),
      ),
    );
  }

  Widget _legendDot(Color color, String label) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 10,
          height: 10,
          decoration: BoxDecoration(
            color: color,
            borderRadius: BorderRadius.circular(3),
          ),
        ),
        const SizedBox(width: 4),
        Text(label, style: const TextStyle(fontSize: 12)),
      ],
    );
  }

  Widget _tipCard(IconData icon, Color color, String text) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.6),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 20),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              text,
              style: const TextStyle(fontSize: 13, color: Color(0xFF4B5563)),
            ),
          ),
        ],
      ),
    );
  }
}
