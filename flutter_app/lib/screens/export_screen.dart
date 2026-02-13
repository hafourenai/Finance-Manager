import 'dart:io';
import 'package:flutter/material.dart';
import 'package:path_provider/path_provider.dart';
import 'package:share_plus/share_plus.dart';
import 'package:intl/intl.dart';
import '../models/transaction.dart' as model;

class ExportScreen extends StatefulWidget {
  final List<model.Transaction> transactions;
  final double income;
  final double expense;
  final double savings;
  final double balance;
  final String Function(double) formatCurrency;

  const ExportScreen({
    super.key,
    required this.transactions,
    required this.income,
    required this.expense,
    required this.savings,
    required this.balance,
    required this.formatCurrency,
  });

  @override
  State<ExportScreen> createState() => _ExportScreenState();
}

class _ExportScreenState extends State<ExportScreen> {
  bool _isExporting = false;

  Future<void> _exportToTXT(String type) async {
    setState(() => _isExporting = true);
    try {
      final now = DateTime.now();
      List<model.Transaction> filtered;
      String period;

      if (type == 'monthly') {
        final monthStr = '${now.year}-${now.month.toString().padLeft(2, '0')}';
        filtered = widget.transactions
            .where((t) => t.date.startsWith(monthStr))
            .toList();
        period = DateFormat('MMMM yyyy', 'id_ID').format(now);
      } else {
        filtered = widget.transactions
            .where((t) => t.date.startsWith('${now.year}'))
            .toList();
        period = 'Tahun ${now.year}';
      }

      final buf = StringBuffer();
      buf.writeln('╔══════════════════════════════════════╗');
      buf.writeln('║     LAPORAN KEUANGAN FINANCEFLOW     ║');
      buf.writeln('╚══════════════════════════════════════╝');
      buf.writeln('');
      buf.writeln('Periode     : $period');
      buf.writeln(
        'Dibuat      : ${DateFormat('dd MMMM yyyy, HH:mm', 'id_ID').format(now)}',
      );
      buf.writeln('');
      buf.writeln('═══════════════ RINGKASAN ═══════════════');
      buf.writeln('Pemasukan   : ${widget.formatCurrency(widget.income)}');
      buf.writeln('Pengeluaran : ${widget.formatCurrency(widget.expense)}');
      buf.writeln('Tabungan    : ${widget.formatCurrency(widget.savings)}');
      buf.writeln('Saldo       : ${widget.formatCurrency(widget.balance)}');
      buf.writeln('');
      buf.writeln('═══════════ DETAIL TRANSAKSI ═══════════');

      for (var t in filtered) {
        final prefix = t.type == 'income' ? '+' : '-';
        buf.writeln(
          '${t.date} | ${t.category.padRight(15)} | $prefix${widget.formatCurrency(t.amount)}',
        );
        if (t.description.isNotEmpty) {
          buf.writeln('           └─ ${t.description}');
        }
      }

      buf.writeln('');
      buf.writeln('Total transaksi: ${filtered.length}');
      buf.writeln('');
      buf.writeln('── Dibuat oleh FinanceFlow ──');

      final dir = await getApplicationDocumentsDirectory();
      final fileName =
          'financeflow_${type}_${DateFormat('yyyyMMdd_HHmmss').format(now)}.txt';
      final file = File('${dir.path}/$fileName');
      await file.writeAsString(buf.toString());

      if (mounted) {
        await Share.shareXFiles([
          XFile(file.path),
        ], text: 'Laporan Keuangan FinanceFlow - $period');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Gagal mengekspor: $e')));
      }
    } finally {
      if (mounted) setState(() => _isExporting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Ekspor'), centerTitle: false),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            const SizedBox(height: 20),
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: const Color(0xFF0ea5e9).withValues(alpha: 0.1),
              ),
              child: const Icon(
                Icons.download_rounded,
                size: 48,
                color: Color(0xFF0ea5e9),
              ),
            ),
            const SizedBox(height: 20),
            const Text(
              'Unduh Laporan',
              style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800),
            ),
            const SizedBox(height: 8),
            const Text(
              'Dapatkan rekapitulasi lengkap keuangan\nAnda dalam format TXT untuk arsip pribadi.',
              textAlign: TextAlign.center,
              style: TextStyle(color: Color(0xFF94A3B8), fontSize: 14),
            ),
            const SizedBox(height: 32),
            _buildExportCard(
              title: 'Laporan Bulanan',
              subtitle: 'Transaksi bulan ini saja',
              icon: Icons.calendar_month,
              color: const Color(0xFF0ea5e9),
              onTap: () => _exportToTXT('monthly'),
            ),
            const SizedBox(height: 12),
            _buildExportCard(
              title: 'Laporan Tahunan',
              subtitle: 'Ringkasan satu tahun penuh',
              icon: Icons.description,
              color: const Color(0xFF8B5CF6),
              onTap: () => _exportToTXT('yearly'),
            ),
            if (_isExporting) ...[
              const SizedBox(height: 24),
              const CircularProgressIndicator(),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildExportCard({
    required String title,
    required String subtitle,
    required IconData icon,
    required Color color,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: _isExporting ? null : onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFFE2E8F0)),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: color, size: 24),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      fontWeight: FontWeight.w700,
                      fontSize: 15,
                    ),
                  ),
                  Text(
                    subtitle,
                    style: const TextStyle(
                      fontSize: 12,
                      color: Color(0xFF94A3B8),
                    ),
                  ),
                ],
              ),
            ),
            Icon(Icons.chevron_right, color: Colors.grey.shade400),
          ],
        ),
      ),
    );
  }
}
