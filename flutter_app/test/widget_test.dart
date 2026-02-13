import 'package:flutter_test/flutter_test.dart';
import 'package:finance_flow/main.dart';

void main() {
  testWidgets('App smoke test', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const FinanceFlowApp());

    // Verify that our app shows the Dashboard.
    expect(find.text('Dashboard'), findsWidgets);
    expect(find.text('Transaksi'), findsWidgets);
    expect(find.text('0'), findsNothing); // No counter
  });
}
