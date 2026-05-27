import datetime
from zoneinfo import ZoneInfo

from google.adk.agents import Agent
from google.adk.apps import App
from google.adk.models import Gemini
from google.genai import types

import os
from dotenv import load_dotenv

load_dotenv()
import google.auth

# Set project ID if not already provided by environment
if not os.environ.get("GOOGLE_CLOUD_PROJECT"):
    _, project_id = google.auth.default()
    os.environ["GOOGLE_CLOUD_PROJECT"] = project_id

os.environ.setdefault("GOOGLE_CLOUD_LOCATION", "us-east1")
os.environ.setdefault("GOOGLE_GENAI_USE_VERTEXAI", "True")


import json

from app.data_provider import DataProvider

def get_order(order_id: str) -> str:
    """Gets details about a customer order."""
    order = DataProvider.get_record("orders", "id", order_id)
    if order:
        return json.dumps(order)
    return json.dumps({"error": f"Order {order_id} not found."})

def get_product(product_id: str) -> str:
    """Gets details about a product."""
    product = DataProvider.get_record("products", "id", product_id)
    if product:
        return json.dumps(product)
    return json.dumps({"error": f"Product {product_id} not found."})

def get_orders() -> str:
    """Returns a list of all orders."""
    orders = DataProvider.get_all("orders")
    return json.dumps(orders)

root_agent = Agent(
    name="root_agent",
    model=Gemini(
        model="gemini-2.5-flash",
        retry_options=types.HttpRetryOptions(attempts=3),
    ),
    instruction="""
    You are a concise customer support assistant.
    - Use 'get_order' for single order details.
    - Use 'get_product' for product details.
    - Use 'get_orders' for listing all orders.
    - Information is displayed in a dedicated dashboard on the left.
    - In your chat response, do NOT repeat the data.
    - Provide only a very brief confirmation.
    - Avoid conversational filler.
    """,
    tools=[get_order, get_product, get_orders],
)

app = App(
    root_agent=root_agent,
    name="app",
)

agent = root_agent