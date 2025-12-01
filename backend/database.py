import sqlite3

# Mock SQLite Interface
def get_product_price(product_name: str) -> float:
    # In real app: SELECT price FROM products WHERE name = ?
    mock_db = {
        "Air Stride Running Shoes": 120.00,
        "Quantum X1 Laptop": 1299.99
    }
    return mock_db.get(product_name, 0.0)

def save_case_to_db(state):
    print(f"Saving Case {state['case_id']} to SQLite DB.")
