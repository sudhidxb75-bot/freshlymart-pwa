Freshly Mart Website Package V5 - Backend Reports, Delivery Sheets & Validation
================================================================================

This package includes the customer website, seller onboarding, seller dashboard, admin dashboard, sliding banners, and a stronger Google Sheets + Apps Script backend.

WHAT IS NEW IN V5
-----------------
1. Report generation functions in Apps Script.
2. Hub-wise delivery / dispatch sheet generation.
3. Backend sheet formatting functions.
4. Dropdown validation for backend sheets.
5. Backend validation before saving form submissions.
6. ValidationErrors sheet for checking backend mistakes.
7. Safe clearing functions for generated sheets and report outputs.
8. Archive function for old delivered/cancelled/refunded orders.
9. ActivityLog and ClearLog sheets.
10. Seller, hub and customer statement generation.
11. Product rating summary and seller/hub performance refresh functions.

CONNECTED FORMS INCLUDED
------------------------
1. Seller Registration: sell-with-us.html -> Sellers sheet
2. Hub Partner Registration: join-hub.html -> HubApplications sheet
3. Referral Form: refer.html -> Referrals sheet
4. Contact Form: contact.html -> Contacts sheet
5. Return / Refund Form: returns.html -> Returns sheet
6. Product Review Form: product.html -> Reviews sheet
7. Seller Product Submission: seller-dashboard.html -> ProductSubmissions sheet
8. Seller Stock Update: seller-dashboard.html -> InventoryUpdates sheet + Products stock update
9. Checkout Order Form: checkout.html -> Orders + OrderItems sheets
10. Admin Seller/Product Approval: admin-dashboard.html -> Sellers / ProductSubmissions / Products sheets

IMPORTANT FILES
---------------
- index.html                         Main website
- assets/style.css                   Website design
- assets/app.js                      Main frontend logic and form connections
- FreshlyMart_AppsScript.gs          Google Sheets backend V5
- sell-with-us.html                  Seller onboarding
- join-hub.html                      Hub partner onboarding
- seller-dashboard.html              Seller product and stock dashboard
- admin-login.html                   Private admin login page
- admin-dashboard.html               Admin approval dashboard
- BACKEND_OPERATIONS_GUIDE.txt       New backend operations guide
- SECURITY_NOTES.txt                 Admin security notes
- BANNER_SETUP.txt                   Banner setup guide

STEP 1: CREATE GOOGLE SHEET BACKEND
-----------------------------------
1. Create a new Google Sheet.
2. Open Extensions > Apps Script.
3. Delete old script code.
4. Paste the full code from FreshlyMart_AppsScript.gs.
5. Save.
6. Run setupFreshlyMart once.
7. Approve permissions.
8. Go back to the Google Sheet and reload.
9. You should see menu: Freshly Mart Backend.

STEP 2: DEPLOY APPS SCRIPT
--------------------------
1. Apps Script > Deploy > New deployment.
2. Select type: Web app.
3. Execute as: Me.
4. Who has access: Anyone.
5. Deploy.
6. Copy the Web App URL ending in /exec.

STEP 3: CONNECT WEBSITE TO BACKEND
----------------------------------
1. Open assets/app.js.
2. Find:

   BACKEND_URL: '',

3. Paste your Apps Script Web App URL:

   BACKEND_URL: 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec',

4. Update Freshly link and WhatsApp numbers if needed:

   FRESHLY_URL: 'https://freshly-online.com',
   ADMIN_WHATSAPP: '918921696649',
   SUPPORT_WHATSAPP: '918921696649',

STEP 4: CHANGE ADMIN CODE
-------------------------
1. Open Settings sheet.
2. Find SettingName: AdminCode.
3. Change value from:

   FRESHLYMARTADMIN_CHANGE_ME

   to your private admin code.

Do not publish your admin code anywhere.

STEP 5: USE BACKEND MENU
------------------------
After reloading the Google Sheet, use:

Freshly Mart Backend > Setup / Repair All Sheets
Freshly Mart Backend > Format All Backend Sheets
Freshly Mart Backend > Apply Dropdown Validations
Freshly Mart Backend > Validate Backend Data

For delivery sheets:

Freshly Mart Backend > Delivery Sheets > Generate Today's Delivery Sheets
Freshly Mart Backend > Delivery Sheets > Generate Delivery Sheets by Date
Freshly Mart Backend > Delivery Sheets > Clear Generated Delivery Sheets

For reports:

Freshly Mart Backend > Reports > Generate Today's Order Report
Freshly Mart Backend > Reports > Generate Date Range Order Report
Freshly Mart Backend > Reports > Generate Current Month Seller Statements
Freshly Mart Backend > Reports > Generate Current Month Hub Statements
Freshly Mart Backend > Reports > Generate Current Month Customer Statements
Freshly Mart Backend > Reports > Refresh Ratings & Performance

For safe clearing and archiving:

Freshly Mart Backend > Safe Clearing / Archive > Archive Delivered/Cancelled Orders Older Than 30 Days
Freshly Mart Backend > Safe Clearing / Archive > Clear Validation Errors
Freshly Mart Backend > Safe Clearing / Archive > Clear Report Output Sheets

STEP 6: UPLOAD WEBSITE TO GITHUB
--------------------------------
Upload all files and folders exactly as provided:

- index.html
- all other .html files
- assets folder

FreshlyMart_AppsScript.gs can be kept private after backend setup. It does not need to be uploaded publicly to GitHub.

TESTING CHECKLIST
-----------------
1. Submit a seller registration. Check Sellers sheet.
2. Change seller Status to Approved or approve from admin dashboard.
3. Submit a product from seller-dashboard.html. Check ProductSubmissions sheet.
4. Approve product from admin dashboard. Check Products sheet.
5. Place a test order. Check Orders and OrderItems sheets.
6. Generate today's delivery sheet from menu.
7. Generate today's order report from menu.
8. Run Validate Backend Data and check ValidationErrors.

DEMO MODE NOTE
--------------
If BACKEND_URL is empty, forms may save only in browser localStorage demo mode.
To save to Google Sheets, BACKEND_URL must be updated.

SECURITY NOTE
-------------
The admin button is not shown on the public website.
Access admin manually using:

admin-login.html

For a larger public launch, move to stronger login/authentication. For Phase 1 testing, this backend is suitable for validating seller onboarding, product approval, stock updates, returns, reviews, order reports, delivery sheets and settlements.

V5.6 COMPLIANCE UPDATE
----------------------
This version adds GST/FSSAI backend compliance controls.

Required after replacing Apps Script:
1. Run setupFreshlyMart()
2. Reload Google Sheet.
3. Run Validate Backend Data from the Freshly Mart Backend menu.
4. Use admin-dashboard.html > Manual Actions to approve sellers.

Default approval rules:
- GST is mandatory by default for seller approval.
- FSSAI is mandatory for food-related seller/product approval.
- Admin can grant temporary relaxation only with reason, valid-until date, approved-by, and risk level.

See COMPLIANCE_SETUP.txt for details.


V5.7 PAYMENT UPDATE
-------------------
All payment options are UPI-only to Freshly Mart. Cash/COD handling by hubs, sellers and delivery partners is disabled. See PAYMENT_SETUP.txt.
