# DataProvider (Strictly Two-Table: Orders and Products)
import json

class DataProvider:
    """
    Simplified mock data store: Orders and Products.
    Analytical data (amount) is stored directly on the order.
    """
    
    _tables = {
        "products": [
            {"id": "prod_laptop", "name": "Laptop", "price": 1200, "stock": 5},
            {"id": "prod_headphones", "name": "Headphones", "price": 150, "stock": 20},
        ],
        "orders": [
            {"id": "ord123", "status": "Shipped", "product_id": "prod_laptop", "date": "2026-05-01", "amount": 1200},
            {"id": "ord456", "status": "Processing", "product_id": "prod_headphones", "date": "2026-05-02", "amount": 150},
            {"id": "ord789", "status": "Shipped", "product_id": "prod_laptop", "date": "2026-05-03", "amount": 1200},
        ]
    }

    @classmethod
    def get_all(cls, table):
        """Fetch all records from a table."""
        return cls._tables.get(table, [])

    @classmethod
    def get_record(cls, table, id_field, id_value):
        """Fetch a single record by ID."""
        for row in cls._tables.get(table, []):
            if row.get(id_field) == id_value:
                return row
        return None
