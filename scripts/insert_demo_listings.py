import json
import mysql.connector
import random

# 数据库配置
DB_CONFIG = {
    'host': '127.0.0.1',
    'user': 'root',
    'password': 'my123456',
    'database': 'goods_trading',
    'port': 3306
}

# 读取demo数据
with open('demo_listings2.json', 'r') as f:
    items = json.load(f)

# 连接数据库
conn = mysql.connector.connect(**DB_CONFIG)
cursor = conn.cursor()

# 假设卖家ID为1（可根据实际情况调整）


for item in items:
    # 插入listings表
    cursor.execute(
        """
        INSERT INTO listings (title, description, price, seller_id, category_id, condition_type, location)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        """,
        (
            item['title'],
            item['description'],
            item['price'],
            random.randint(1, 20),
            item['category_id'],
            item['condition_type'],
            item['location']
        )
    )
    listing_id = cursor.lastrowid
    # 插入listing_images表
    cursor.execute(
        """
        INSERT INTO listing_images (listing_id, image_url, is_primary)
        VALUES (%s, %s, %s)
        """,
        (listing_id, item['image_url'], True)
    )

conn.commit()
cursor.close()
conn.close()
print('Inserted', len(items), 'demo listings.') 