import json
import random

results = []

# Open and read the JSON file
with open('d.json', 'r') as file:
    data = json.load(file)

for i in data['data']['modularFeed']['looseTiles']:
    
    x = i['listing']
    # print(f"title:{x['title']}, description:{x['title']}, \
    #     price:{x['price']}, category_id:{random.randint(1, 5)}, condition_type:{random.choice(['New', 'Like New', 'Good', 'Fair', 'Poor'])}, \
    #         location:{x['locationName']}, image_url:{x['image']['url']}")
    
    results.append({
        'title': x['title'],
        'description': x['title'],
        'price': x['price']+".00",
        'category_id': random.randint(1, 5),
        'condition_type': random.choice(['New', 'Like New', 'Good', 'Fair', 'Poor']),
        'location': x['locationName'],
        'image_url': x['image']['url']
    })
    
    
with open('d2.json', 'r') as file:
    data = json.load(file)

for i in data['data']['modularFeed']['looseTiles']:
    
    x = i['listing']
    # print(f"title:{x['title']}, description:{x['title']}, \
    #     price:{x['price']}, category_id:{random.randint(1, 5)}, condition_type:{random.choice(['New', 'Like New', 'Good', 'Fair', 'Poor'])}, \
    #         location:{x['locationName']}, image_url:{x['image']['url']}")
    
    results.append({
        'title': x['title'],
        'description': x['title'],
        'price': x['price']+".00",
        'category_id': random.randint(1, 5),
        'condition_type': random.choice(['New', 'Like New', 'Good', 'Fair', 'Poor']),
        'location': x['locationName'],
        'image_url': x['image']['url']
    })
    
    
# Save the results to a new JSON file
with open('demo_listings2.json', 'w') as f:
    json.dump(results, f, indent=2)
