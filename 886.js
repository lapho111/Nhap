// PhotoRoom Premium Unlock (FIXED structure)
let obj = JSON.parse($response.body);

// Gói thuê bao và entitlement phải trùng tên: com.background.business.yearly
let sub_id = "com.background.business.yearly";

obj.subscriber = {
  first_seen: "2023-02-23T03:33:33Z",
  entitlements: {
    business: {
      expires_date: "2033-02-23T03:33:33Z",
      product_identifier: sub_id,
      purchase_date: "2023-02-23T03:33:33Z"
    }
  },
  subscriptions: {}
};

obj.subscriber.subscriptions[sub_id] = {
  expires_date: "2033-02-23T03:33:33Z",
  original_purchase_date: "2023-02-23T03:33:33Z",
  purchase_date: "2023-02-23T03:33:33Z",
  ownership_type: "PURCHASED",
  store: "app_store"
};

$done({ body: JSON.stringify(obj) });
