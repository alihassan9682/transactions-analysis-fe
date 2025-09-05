import json

# Open and load the JSON file
with open("transactions.json", "r", encoding="utf-8") as f:
    transactions = json.load(f)

# Extract unique cities and countries
unique_cities = {txn["merchant_city"] for txn in transactions if txn.get("merchant_city")}
unique_countries = {txn["merchant_country"] for txn in transactions if txn.get("merchant_country")}

print("Unique Cities:", unique_cities)
print("Unique Countries:", unique_countries)
