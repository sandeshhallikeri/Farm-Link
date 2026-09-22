import requests

API_KEY = "579b464db66ec23bdd0000010d6f2e75f7fc40fa651ab1b6d69102eb"

URL = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070"

params = {
    "api-key": API_KEY,
    "format": "json",
    "limit": 5,
    "filters[state.keyword]": "Karnataka"
}

try:
    response = requests.get(URL, params=params, timeout=120)

    print("Status Code:", response.status_code)

    if response.status_code == 200:
        data = response.json()

        records = data.get("records", [])

        print("Records found:", len(records))

        for record in records:
            print("\n----------------------")
            print("State:", record.get("state"))
            print("District:", record.get("district"))
            print("Market:", record.get("market"))
            print("Commodity:", record.get("commodity"))
            print("Variety:", record.get("variety"))
            print("Grade:", record.get("grade"))
            print("Arrival Date:", record.get("arrival_date"))
            print("Min Price:", record.get("min_price"))
            print("Max Price:", record.get("max_price"))
            print("Modal Price:", record.get("modal_price"))

    else:
        print("API ERROR")
        print(response.text[:2000])

except requests.exceptions.Timeout:
    print("The government API took too long to respond.")

except requests.exceptions.RequestException as e:
    print("Connection error:", e)