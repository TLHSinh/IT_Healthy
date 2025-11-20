# ✅ MoMo Payment Integration - Checklist

## 🎯 Phase 1: Backend Setup (COMPLETED ✅)

### Models & DTOs
- [x] Cập nhật `Payment.cs` - Thêm TransactionId, MoMoRequestId
- [x] Tạo `MoMoRequestDTO.cs` - Request/Response/Callback models
- [x] Cập nhật `CheckoutRequestDTO.cs` - Thêm PaymentMethod

### Controllers
- [x] Cập nhật `CheckoutController.cs` - COD payment logic
- [x] Tạo `MoMoPaymentController.cs` - MoMo payment endpoints
  - [x] POST /api/momopayment/create
  - [x] POST /api/momopayment/callback
  - [x] GET /api/momopayment/status/{orderId}

### Configuration
- [x] Cập nhật `appsettings.json` - Thêm MoMoConfig
- [x] Cập nhật `Program.cs` - Register MoMoConfig

### Documentation
- [x] Tạo `MOMO_PAYMENT_GUIDE.md`
- [x] Tạo `MOMO_IMPLEMENTATION_SUMMARY.md`
- [x] Tạo `MoMo_API_Tests.http`

---

## 🗄️ Phase 2: Database Migration

### SQL Scripts
- [x] Tạo migration script `Add_MoMo_Payment_Columns.sql`
- [ ] **TODO:** Chạy migration script trong SQL Server
  ```sql
  -- Mở SQL Server Management Studio
  -- File → Open → Add_MoMo_Payment_Columns.sql
  -- Execute (F5)
  ```

### Verification
- [ ] Kiểm tra column `Payment.TransactionId` đã tồn tại
- [ ] Kiểm tra column `Payment.MoMoRequestId` đã tồn tại

---

## ⚙️ Phase 3: Configuration

### MoMo Credentials
- [ ] **TODO:** Đăng ký tài khoản MoMo Developer
  - URL: https://developers.momo.vn/
  
- [ ] **TODO:** Lấy credentials từ MoMo Portal
  - [ ] PartnerCode
  - [ ] AccessKey
  - [ ] SecretKey

- [ ] **TODO:** Cập nhật `appsettings.json`
  ```json
  {
    "MoMoConfig": {
      "PartnerCode": "YOUR_PARTNER_CODE",
      "AccessKey": "YOUR_ACCESS_KEY",
      "SecretKey": "YOUR_SECRET_KEY",
      "ReturnUrl": "http://localhost:3000/payment/momo/return",
      "IpnUrl": "https://your-domain.com/api/momopayment/callback",
      "PaymentUrl": "https://test-payment.momo.vn/v2/gateway/api/create"
    }
  }
  ```

### Deployment (For Production)
- [ ] Deploy backend lên server public
- [ ] Cập nhật IpnUrl với domain thật (phải HTTPS)
- [ ] Test callback từ MoMo đến server

---

## 🧪 Phase 4: Testing

### Backend API Testing
- [ ] Test COD checkout
  - [ ] Shipping order
  - [ ] Pickup order
  - [ ] Verify inventory deduction
  - [ ] Verify cart items removed

- [ ] Test MoMo payment creation
  - [ ] Shipping order
  - [ ] Pickup order
  - [ ] Verify payUrl returned
  - [ ] Verify order created (Pending)
  - [ ] Verify inventory NOT deducted

- [ ] Test MoMo callback
  - [ ] Success scenario (ResultCode = 0)
    - [ ] Verify inventory deducted
    - [ ] Verify cart items removed
    - [ ] Verify payment status = Success
    - [ ] Verify order status = Confirmed
  - [ ] Failed scenario (ResultCode != 0)
    - [ ] Verify order deleted
    - [ ] Verify payment status = Failed
    - [ ] Verify inventory NOT deducted

- [ ] Test payment status endpoint
  - [ ] Get status for existing order
  - [ ] Get status for non-existing order

### Error Handling
- [ ] Test với PaymentMethod không hợp lệ
- [ ] Test với OrderType không hợp lệ
- [ ] Test với insufficient inventory
- [ ] Test với invalid signature (callback)

### Integration Testing
- [ ] Test full MoMo flow với sandbox
  - [ ] Create payment
  - [ ] Pay on MoMo sandbox
  - [ ] Receive callback
  - [ ] Verify database updates

---

## 💻 Phase 5: Frontend Integration

### UI Components
- [ ] Tạo payment method selector (COD/MoMo)
- [ ] Cập nhật checkout page
- [ ] Tạo MoMo return page (`/payment/momo/return`)
- [ ] Tạo payment status component

### API Integration
- [ ] Implement COD checkout flow
  ```javascript
  // POST /api/checkout
  // Redirect to order detail page
  ```

- [ ] Implement MoMo checkout flow
  ```javascript
  // POST /api/momopayment/create
  // Redirect to payUrl
  ```

- [ ] Implement MoMo return handler
  ```javascript
  // GET /api/momopayment/status/{orderId}
  // Show success/failed message
  ```

### User Experience
- [ ] Loading states during payment
- [ ] Error handling và messages
- [ ] Success/Failed notifications
- [ ] Redirect logic after payment

---

## 🔒 Phase 6: Security & Optimization

### Security
- [ ] Verify signature trong callback
- [ ] Validate request data
- [ ] Prevent duplicate callbacks
- [ ] Secure MoMo credentials (không commit vào Git)

### Performance
- [ ] Add indexes cho Payment.TransactionId
- [ ] Add indexes cho Payment.MoMoRequestId
- [ ] Optimize database queries
- [ ] Add logging cho payment transactions

### Monitoring
- [ ] Log payment requests
- [ ] Log callback responses
- [ ] Monitor failed payments
- [ ] Alert on payment errors

---

## 📝 Phase 7: Documentation & Training

### Documentation
- [x] API documentation
- [x] Integration guide
- [x] Testing guide
- [ ] User manual (for end users)
- [ ] Admin manual (for support team)

### Training
- [ ] Train dev team on MoMo integration
- [ ] Train support team on payment troubleshooting
- [ ] Create FAQ document

---

## 🚀 Phase 8: Production Deployment

### Pre-deployment
- [ ] Code review
- [ ] Security audit
- [ ] Performance testing
- [ ] Load testing

### Deployment
- [ ] Backup database
- [ ] Run migration scripts
- [ ] Deploy backend
- [ ] Deploy frontend
- [ ] Update MoMo IpnUrl

### Post-deployment
- [ ] Smoke testing
- [ ] Monitor logs
- [ ] Test with real MoMo account
- [ ] Monitor payment success rate

---

## 📊 Progress Tracking

**Overall Progress:** 25% (Phase 1 Complete)

| Phase | Status | Progress |
|-------|--------|----------|
| 1. Backend Setup | ✅ Complete | 100% |
| 2. Database Migration | ⏳ Pending | 50% |
| 3. Configuration | ⏳ Pending | 0% |
| 4. Testing | ⏳ Pending | 0% |
| 5. Frontend Integration | ⏳ Pending | 0% |
| 6. Security & Optimization | ⏳ Pending | 0% |
| 7. Documentation | ⏳ In Progress | 60% |
| 8. Production Deployment | ⏳ Pending | 0% |

---

## 🎯 Next Immediate Actions

1. **Chạy database migration** (5 phút)
   - Mở SQL Server Management Studio
   - Execute `Add_MoMo_Payment_Columns.sql`

2. **Đăng ký MoMo Developer** (15 phút)
   - Truy cập https://developers.momo.vn/
   - Đăng ký tài khoản
   - Lấy test credentials

3. **Cập nhật configuration** (5 phút)
   - Paste credentials vào `appsettings.json`
   - Restart backend

4. **Test API** (10 phút)
   - Sử dụng `MoMo_API_Tests.http`
   - Test COD flow
   - Test MoMo create payment

5. **Implement Frontend** (2-3 giờ)
   - Tham khảo examples trong `MOMO_PAYMENT_GUIDE.md`
   - Implement payment method selector
   - Implement checkout logic
   - Implement return page

---

**Last Updated:** 2025-11-20  
**Status:** Backend Complete - Ready for Database Migration
