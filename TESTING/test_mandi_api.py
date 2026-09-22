"""
API Client for data.gov.in - Current Daily Price of Various Commodities from Various Markets (Mandi)

This module provides functionality to fetch commodity price data from various mandis (markets) in India
using the data.gov.in API.

API Resource: Current Daily Price of Various Commodities from Various Markets (Mandi)
Catalog ID: resources-59810c47e214300b1d1a6f73 (may need to be updated based on current catalog)

Requirements:
    pip install requests python-dotenv

Environment Variables:
    DATA_GOV_IN_API_KEY: Your API key from data.gov.in
"""

import os
import requests
from typing import Optional, Dict, Any, List
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class MandiPriceAPI:
    """
    Client for fetching daily commodity prices from various mandis via data.gov.in API.
    """

    BASE_URL = "https://api.data.gov.in/resource"
    API_KEY = os.getenv("DATA_GOV_IN_API_KEY")

    # Resource ID for Current Daily Price of Various Commodities from Various Markets
    # Note: You may need to update this with the current resource ID from data.gov.in
    RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070"

    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize the API client.

        Args:
            api_key: Optional API key. If not provided, uses DATA_GOV_IN_API_KEY from environment.
        """
        self.api_key = api_key or self.API_KEY

        if not self.api_key:
            raise ValueError(
                "API key is required. Please set DATA_GOV_IN_API_KEY environment variable "
                "or pass api_key parameter."
            )

    def _make_request(self, endpoint: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Make a GET request to the API.

        Args:
            endpoint: API endpoint path
            params: Query parameters

        Returns:
            JSON response as dictionary

        Raises:
            requests.exceptions.RequestException: If the request fails
            ValueError: If the API returns an error
        """
        url = f"{self.BASE_URL}/{endpoint}"
        params["api-key"] = self.api_key
        params["format"] = "json"

        try:
            response = requests.get(url, params=params, timeout=30)
            response.raise_for_status()
            data = response.json()

            if "errors" in data:
                raise ValueError(f"API Error: {data['errors']}")

            return data

        except requests.exceptions.Timeout:
            raise requests.exceptions.Timeout("Request timed out after 30 seconds")
        except requests.exceptions.RequestException as e:
            raise requests.exceptions.RequestException(f"Request failed: {str(e)}")

    def get_commodity_prices(
        self,
        state: Optional[str] = None,
        district: Optional[str] = None,
        market: Optional[str] = None,
        commodity: Optional[str] = None,
        variety: Optional[str] = None,
        grade: Optional[str] = None,
        limit: int = 100,
        offset: int = 0
    ) -> Dict[str, Any]:
        """
        Fetch current daily prices of commodities from various markets.

        Args:
            state: Filter by state name (e.g., "Maharashtra", "Punjab")
            district: Filter by district name
            market: Filter by market/mandi name
            commodity: Filter by commodity name (e.g., "Wheat", "Rice")
            variety: Filter by commodity variety
            grade: Filter by grade
            limit: Number of records to return (default: 100, max: varies by API)
            offset: Offset for pagination (default: 0)

        Returns:
            Dictionary containing API response with records and metadata

        Example:
            >>> client = MandiPriceAPI()
            >>> result = client.get_commodity_prices(state="Maharashtra", commodity="Wheat")
            >>> print(result['count'])
        """
        params = {
            "limit": limit,
            "offset": offset
        }

        # Add optional filters
        if state:
            params["state"] = state
        if district:
            params["district"] = district
        if market:
            params["market"] = market
        if commodity:
            params["commodity"] = commodity
        if variety:
            params["variety"] = variety
        if grade:
            params["grade"] = grade

        return self._make_request(self.RESOURCE_ID, params)

    def get_all_states(self) -> List[str]:
        """
        Get list of all states available in the dataset.

        Returns:
            List of state names
        """
        # This would typically require a facets query or fetching all data
        # Implementation depends on API capabilities
        response = self.get_commodity_prices(limit=1)
        # Extract unique states from the response if available
        # This is a placeholder - actual implementation may vary
        return []

    def get_commodities_by_state(self, state: str) -> List[str]:
        """
        Get list of commodities available in a specific state.

        Args:
            state: State name

        Returns:
            List of commodity names
        """
        response = self.get_commodity_prices(state=state, limit=1000)
        commodities = set()

        if "records" in response:
            for record in response["records"]:
                if "commodity" in record:
                    commodities.add(record["commodity"])

        return sorted(list(commodities))

    def get_prices_summary(
        self,
        commodity: str,
        state: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Get price summary for a specific commodity.

        Args:
            commodity: Commodity name
            state: Optional state filter

        Returns:
            Dictionary with min, max, avg prices and other statistics
        """
        params = {"commodity": commodity, "limit": 1000}
        if state:
            params["state"] = state

        response = self.get_commodity_prices(**params)

        if "records" not in response or not response["records"]:
            return {"error": "No records found"}

        prices = []
        for record in response["records"]:
            if "modal_price" in record:
                try:
                    prices.append(float(record["modal_price"]))
                except (ValueError, TypeError):
                    continue

        if not prices:
            return {"error": "No valid price data found"}

        return {
            "commodity": commodity,
            "state": state,
            "min_price": min(prices),
            "max_price": max(prices),
            "avg_price": sum(prices) / len(prices),
            "record_count": len(prices)
        }


def main():
    """
    Example usage of the MandiPriceAPI client.
    """
    print("=" * 60)
    print("Data.gov.in - Mandi Commodity Prices API Client")
    print("=" * 60)

    try:
        # Initialize the client
        client = MandiPriceAPI()

        # Example 1: Get recent commodity prices
        print("\n1. Fetching recent commodity prices...")
        result = client.get_commodity_prices(limit=5)

        if "records" in result:
            print(f"   Total records available: {result.get('count', 'N/A')}")
            print(f"   Retrieved: {len(result['records'])} records")

            for i, record in enumerate(result['records'][:3], 1):
                print(f"\n   Record {i}:")
                for key, value in record.items():
                    print(f"      {key}: {value}")

        # Example 2: Get prices for a specific commodity
        print("\n2. Fetching Wheat prices...")
        wheat_result = client.get_commodity_prices(commodity="Wheat", limit=3)

        if "records" in wheat_result:
            print(f"   Found {len(wheat_result['records'])} Wheat price records")

        # Example 3: Get price summary
        print("\n3. Getting price summary for Wheat...")
        summary = client.get_prices_summary(commodity="Wheat")
        if "error" not in summary:
            print(f"   Min Price: ₹{summary['min_price']}")
            print(f"   Max Price: ₹{summary['max_price']}")
            print(f"   Avg Price: ₹{summary['avg_price']:.2f}")

        print("\n" + "=" * 60)
        print("API connection successful!")
        print("=" * 60)

    except ValueError as e:
        print(f"\n❌ Configuration Error: {e}")
        print("\nTo fix this:")
        print("1. Get your API key from https://data.gov.in/user/login")
        print("2. Create a .env file in the same directory")
        print("3. Add: DATA_GOV_IN_API_KEY=your_api_key_here")

    except requests.exceptions.RequestException as e:
        print(f"\n❌ Network Error: {e}")

    except Exception as e:
        print(f"\n❌ Unexpected Error: {e}")


if __name__ == "__main__":
    main()
