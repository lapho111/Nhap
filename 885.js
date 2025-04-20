// photoroom-unlock.js

// 1. Parse gốc
var response = JSON.parse($response.body);

// 2. Khởi tạo nếu thiếu
if (!response.subscriber) response.subscriber = {};
response.subscriber.first_seen = "2023-02-23T03:33:33Z";

// 3. Định nghĩa ID
var entitlement_id = "business";
var product_id     = "com.background.business.yearly";

// 4. Build entitlements
response.subscriber.entitlements = response.subscriber.entitlements || {};
response.subscriber.entitlements[entitlement_id] = {
  expires_date:           "2033-02-23T03:33:33Z",
  product_identifier:     product_id,
  purchase_date:          "2023-02-23T03:33:33Z"
};

// 5. Build subscriptions
response.subscriber.subscriptions = response.subscriber.subscriptions || {};
response.subscriber.subscriptions[product_id] = {
  expires_date:           "2033-02-23T03:33:33Z",
  original_purchase_date: "2023-02-23T03:33:33Z",
  purchase_date:          "2023-02-23T03:33:33Z",
  ownership_type:         "PURCHASED",
  store:                  "app_store"
};

// 6. Trả về
$done({
  body: JSON.stringify(response)
});
