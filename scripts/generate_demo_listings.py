import random
import string
import json

# 生成50个demo商品
items = []
for i in range(50):
    title = f"Demo Item {i+1}"
    price = round(random.uniform(5, 500), 2)
    desc = "This is a demo item for testing."
    category_id = random.randint(1, 5)
    condition = random.choice(['New', 'Like New', 'Good', 'Fair', 'Poor'])
    location = random.choice([
        'Falls Church, VA', 'Washington, DC', 'Silver Spring, MD',
        'Rockville, MD', 'Arlington, VA', 'Dulles, VA', 'Hayward, CA',
        'Manassas, VA', 'Springfield, VA', 'Alexandria, VA'
    ])
    # 随机图片链接（模拟OfferUp图片格式）
    img = 'https://images.offerup.com/0/' + ''.join(random.choices(string.ascii_lowercase + string.digits, k=32)) + '/0/0'
    items.append({
        'title': title,
        'description': desc,
        'price': price,
        'category_id': category_id,
        'condition_type': condition,
        'location': location,
        'image_url': img
    })

with open('demo_listings.json', 'w') as f:
    json.dump(items, f, indent=2) 