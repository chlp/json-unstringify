# json-unstringify

## Chrome Extension. Beautifies selected nested JSON by expanding it into readable objects

Adds two functions to the context menu:
1. "Unstringify block" — finds a JSON string (possibly nested) in the block you right-clicked and expands it into a readable object.
2. "Unstringify same class blocks" — does the same for all blocks with the same CSS class as the clicked block.

Example. Log in Kibana:
```json
{ "content-type": "application/json", "authorization": "eyJ", "body": "[{\"animal_id\":\"B234567\",\"species\":\"Cat\",\"name\":\"Mittens\",\"breed\":\"Siamese\",\"age\":\"2 years\",\"adoption_status\":\"Available\",\"shelter_name\":\"Cozy Cats Shelter\",\"arrival_date\":\"2025-02-20T09:00:00+03:00\",\"last_vet_check\":\"2025-04-08T11:30:00+03:00\",\"color\":\"Cream\",\"size\":\"Medium\",\"favorite_food\":\"Tuna\",\"notes\":\"Affectionate and calm\"}]", "host": "https://catshelter-api.com:443", "url": "https://catshelter-api.com:443/v1/animals/new/", "name": "cat-service", "attempts": "2", "httpTraceID": "456defab-6789-0123-bcde-abcdef123456", "requestTraceID": "456defab-6789-0123-bcde-abcdef123456"}
```

After running json-unstringify:
```json
{
  "content-type": "application/json",
  "authorization": "eyJ",
  "body": [
    {
      "animal_id": "B234567",
      "species": "Cat",
      "name": "Mittens",
      "breed": "Siamese",
      "age": "2 years",
      "adoption_status": "Available",
      "shelter_name": "Cozy Cats Shelter",
      "arrival_date": "2025-02-20T09:00:00+03:00",
      "last_vet_check": "2025-04-08T11:30:00+03:00",
      "color": "Cream",
      "size": "Medium",
      "favorite_food": "Tuna",
      "notes": "Affectionate and calm"
    }
  ],
  "host": "https://catshelter-api.com:443",
  "url": "https://catshelter-api.com:443/v1/animals/new/",
  "name": "cat-service",
  "attempts": "2",
  "httpTraceID": "456defab-6789-0123-bcde-abcdef123456",
  "requestTraceID": "456defab-6789-0123-bcde-abcdef123456"
}
```
