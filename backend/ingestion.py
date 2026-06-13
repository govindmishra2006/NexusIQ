import os 
import httpx
import re
from supabase import create_client, Client
from security import decrypt_token
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env file

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY")   
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async def sync_shopify_orders(user_id:str,shop_domain:str,encrypted_token:str):
    print(f"Starting sync for {shop_domain}")
    
    access_token = decrypt_token(encrypted_token)
    api_version = "2024-01"
    url = f"https://{shop_domain}/admin/api/{api_version}/orders.json?limit=250&status=any"
    headers = {
        "X-Shopify-Access-Token":access_token,
        "Content-Type" : "application/json"
    }
    async with httpx.AsyncClient() as client:
        has_next_page = True
        
        while has_next_page:
            response = await client.get(url,headers=headers)
            
            if response.status_code != 200:
                print(f"Error fetching orders for {shop_domain}: {response.text}")
                break
                
            data = response.json()
            
            orders = data.get("orders",[])
            
            await _process_and_save_batch(user_id,shop_domain,orders)
            
            link_header = response.headers.get("Link")
            next_page_match = re.search(r'<([^>]+)>; rel="next"', link_header)
            
            if next_page_match:
                url = next_page_match.group(1)
            else:
                has_next_page = False

    supabase.table("shopify_connections").update(
    {
        "Last_sync_at":datetime.now().isoformat()
        
    }
    ).eq("user_id",user_id).execute()

    print(f"Sync completed for {shop_domain}")

async def _process_and_save_batch(user_id: str, raw_orders: list):
    """Normalizes the nested Shopify JSON into flat relational tables."""
    if not raw_orders: 
        return
    
    formatted_orders = []
    # We will use a dictionary to collect line items mapped by their Shopify parent order ID
    order_line_items_map = {}
    
    for order in raw_orders:
        shopify_order_id = order["id"]
        
        # 1. Map to the orders table schema
        formatted_orders.append({
            "user_id": user_id,  # <-- Tied securely to the authenticated owner
            "shopify_order_id": shopify_order_id,
            "created_at": order["created_at"],
            "total_price": float(order["total_price"]) if order.get("total_price") else 0.0,
            "financial_status": order.get("financial_status", "unknown"),
            "customer_id": order.get("customer", {}).get("id") if order.get("customer") else None
        })
        
        # 2. Collect line items for this specific order
        order_line_items_map[shopify_order_id] = []
        for item in order.get("line_items", []):
            order_line_items_map[shopify_order_id].append({
                "shopify_product_id": item.get("product_id"),
                "shopify_variant_id": item.get("variant_id"),
                "title": item.get("title"),
                "sku": item.get("sku"),
                "quantity": item.get("quantity", 1),
                "price": float(item["price"]) if item.get("price") else 0.0
            })
            
    if not formatted_orders:
        return

    # 3. Bulk Upsert orders into Supabase (resolving conflicts via the unique shopify_order_id)
    orders_response = supabase.table("orders").upsert(
        formatted_orders, on_conflict="shopify_order_id"
    ).execute()
    
    # 4. Map the newly generated internal Postgres UUIDs back to their line items
    order_uuid_map = {o["shopify_order_id"]: o["id"] for o in orders_response.data}
    
    all_formatted_line_items = []
    for shopify_order_id, items in order_line_items_map.items():
        internal_uuid = order_uuid_map.get(shopify_order_id)
        if internal_uuid:
            for item in items:
                item["order_id"] = internal_uuid  # Link foreign key relationship
                all_formatted_line_items.append(item)
        
    # 5. Bulk Insert/Upsert all line items in a single operational database sweep
    if all_formatted_line_items:
         supabase.table("line_items").insert(all_formatted_line_items).execute()