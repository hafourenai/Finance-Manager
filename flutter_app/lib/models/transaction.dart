class Transaction {
  final int? id;
  final String type;
  final double amount;
  final String category;
  final String description;
  final String date;

  Transaction({
    this.id,
    required this.type,
    required this.amount,
    required this.category,
    this.description = '',
    required this.date,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'type': type,
      'amount': amount,
      'category': category,
      'description': description,
      'date': date,
    };
  }

  factory Transaction.fromMap(Map<String, dynamic> map) {
    return Transaction(
      id: map['id'] as int?,
      type: map['type'] as String,
      amount: (map['amount'] as num).toDouble(),
      category: map['category'] as String,
      description: (map['description'] as String?) ?? '',
      date: map['date'] as String,
    );
  }

  Transaction copyWith({
    int? id,
    String? type,
    double? amount,
    String? category,
    String? description,
    String? date,
  }) {
    return Transaction(
      id: id ?? this.id,
      type: type ?? this.type,
      amount: amount ?? this.amount,
      category: category ?? this.category,
      description: description ?? this.description,
      date: date ?? this.date,
    );
  }
}
