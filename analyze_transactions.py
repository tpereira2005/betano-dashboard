import csv
import json
from datetime import datetime
from collections import defaultdict

def parse_value(value_str):
    return float(value_str.replace(',', '.'))

def analyze_transactions(file_path):
    transactions = []
    total_deposited = 0
    total_withdrawn = 0
    
    # Read CSV
    with open(file_path, 'r', encoding='utf-8-sig') as f:
        # Detect delimiter (it seems to be ';')
        reader = csv.DictReader(f, delimiter=';')
        
        # Handle potential header typos if necessary, but DictReader uses the first row.
        # The headers are Date;Tipe;Vaule
        
        for row in reader:
            date_str = row['Date']
            type_str = row['Tipe']
            value_str = row['Vaule']
            
            value = parse_value(value_str)
            date = datetime.strptime(date_str, '%Y-%m-%d')
            
            transaction = {
                'date': date_str,
                'type': type_str,
                'value': value,
                'timestamp': date.timestamp()
            }
            transactions.append(transaction)
            
            if type_str == 'Deposit':
                total_deposited += value
            elif type_str == 'Withdrawal':
                total_withdrawn += value

    # Sort transactions by date
    transactions.sort(key=lambda x: x['timestamp'])

    # Calculate cumulative and monthly stats
    cumulative_net = 0
    monthly_stats = defaultdict(lambda: {'deposit': 0, 'withdrawal': 0, 'net': 0})
    
    processed_transactions = []
    
    for t in transactions:
        amount = t['value']
        if t['type'] == 'Deposit':
            cumulative_net -= amount # Deposit is money out of pocket (investment)
            monthly_stats[t['date'][:7]]['deposit'] += amount
            monthly_stats[t['date'][:7]]['net'] -= amount
        else:
            cumulative_net += amount # Withdrawal is money back (return)
            monthly_stats[t['date'][:7]]['withdrawal'] += amount
            monthly_stats[t['date'][:7]]['net'] += amount
            
        t['cumulative_net'] = cumulative_net
        processed_transactions.append(t)

    net_result = total_withdrawn - total_deposited
    
    # Identify best and worst months
    sorted_months = sorted(monthly_stats.items(), key=lambda x: x[1]['net'], reverse=True)
    best_month = sorted_months[0] if sorted_months else None
    worst_month = sorted_months[-1] if sorted_months else None

    analysis = {
        'total_deposited': total_deposited,
        'total_withdrawn': total_withdrawn,
        'net_result': net_result,
        'transaction_count': len(transactions),
        'best_month': best_month,
        'worst_month': worst_month,
        'monthly_data': dict(monthly_stats),
        'transactions': processed_transactions
    }
    
    return analysis

if __name__ == "__main__":
    result = analyze_transactions('transactions_tomasp2005.csv')
    
    # Print summary for the agent to read
    print(f"Total Deposited: {result['total_deposited']:.2f}")
    print(f"Total Withdrawn: {result['total_withdrawn']:.2f}")
    print(f"Net Result: {result['net_result']:.2f}")
    print(f"Total Transactions: {result['transaction_count']}")
    if result['best_month']:
        print(f"Best Month: {result['best_month'][0]} ({result['best_month'][1]['net']:.2f})")
    if result['worst_month']:
        print(f"Worst Month: {result['worst_month'][0]} ({result['worst_month'][1]['net']:.2f})")
        
    # Save to JSON for the dashboard
    with open('transaction_analysis.json', 'w') as f:
        json.dump(result, f, indent=2)
