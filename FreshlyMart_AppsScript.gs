/*
  Freshly Mart Apps Script Backend V5.8 - Payment & Receipt Automation

  Setup:
  1. Create / open your Google Sheet.
  2. Extensions > Apps Script.
  3. Paste this full script.
  4. Run setupFreshlyMart() once and approve permissions.
  5. Reload the Google Sheet. You will see "Freshly Mart Backend" menu.
  6. Deploy > New deployment > Web app.
     Execute as: Me
     Who has access: Anyone
  7. Copy Web App URL and paste it into assets/app.js BACKEND_URL.

  Important security note:
  - Admin link is hidden from public pages.
  - Change AdminCode in Settings sheet before using admin dashboard.
  - Do not store real passwords in public website JavaScript.
*/

const FM_TIMEZONE = Session.getScriptTimeZone() || 'Asia/Kolkata';
const FM_VERSION = 'V5_8_Payment_Receipt_Automation';

const FM_STATUS = {
  SELLER: ['Pending','Approved','Rejected','Suspended'],
  PRODUCT_PUBLIC: ['Live','Hidden','Out of Stock','Discontinued'],
  PRODUCT_APPROVAL: ['Draft','Pending','Approved','Rejected','Revision Required'],
  STOCK: ['Live','Low Stock','Out of Stock','Hidden','Procurement Pending','Discontinued'],
  ORDER: ['New','Confirmed','Procurement Pending','Procured','Sent to Hub','Ready for Pickup','Out for Delivery','Delivered','Cancelled','Refunded'],
  PAYMENT: ['UPI Pending','UPI Pending Verification','UPI Pending at Delivery','UPI Pending at Hub','Paid to Freshly Mart','Payment Failed','Refund Pending','Refund Initiated','Refund Completed'],
  RETURN: ['Return Requested','Under Review','Approved','Rejected','Pickup Assigned','Returned to Hub','Returned to Seller','Refund Initiated','Refund Completed','Replacement Sent'],
  REFUND: ['Pending','Initiated','Completed','Rejected'],
  REVIEW: ['Pending','Published','Rejected','Hidden','Flagged'],
  YESNO: ['Yes','No'],
  ACTIVE: ['Active','Inactive','Hidden'],
  FSSAI: ['Not Required','Pending','Provided','Verified','Rejected','Expired'],
  GST: ['Pending','Registered','Provided','Verified','Applied','Unregistered','Not Applicable','Rejected','Expired'],
  RELAXATION_FOR: ['None','GST','FSSAI','Both'],
  RISK: ['Low','Medium','High']
};

const FM_PAYMENT_MODES = ['UPI Online','UPI on Delivery','UPI at Hub Pickup'];

const FM_SHEETS = {
  Settings: ['SettingName','Value','Status'],
  Categories: ['CategoryID','CategoryName','Slug','Type','RedirectURL','ImageURL','Status','DisplayOrder'],
  Banners: ['BannerID','Title','Subtitle','ImageURL','Button1Text','Button1Link','Button2Text','Button2Link','BannerType','DisplayOrder','Status','BackgroundColor','BackgroundColor2','TextColor','Icon'],
  Products: ['ProductID','ProductName','Category','SubCategory','Brand','Unit','MRP','SellingPrice','CostPrice','Margin','ListingMode','DisplaySellerName','SellerID','SupplierID','ImageURL','Description','Stock','StockStatus','MinOrderQty','MaxOrderQty','HubEligible','DeliveryType','Status','Featured','DisplayOrder','Rating','Reviews','FoodRelated','FSSAIRequired','SellerFSSAINumber','FSSAIValidated','GSTApplicable','GSTPercent','HSNCode','TaxInclusivePrice','GSTValidated','ComplianceRelaxation','RelaxationFor','RelaxationReason','RelaxationValidUntil','RelaxationApprovedBy','ComplianceRiskLevel'],
  Suppliers: ['SupplierID','DateTime','SupplierName','ContactPerson','Phone','WhatsApp','Category','Address','Area','Pincode','ProcurementType','PaymentTerms','Status','Remarks'],
  Sellers: ['SellerID','DateTime','BusinessName','OwnerName','Phone','WhatsApp','Email','BusinessType','Category','Address','Area','Pincode','GSTNumber','GSTStatus','GSTRequired','GSTVerified','PANNumber','FSSAINumber','FSSAIStatus','FSSAIExpiryDate','FSSAIRequired','FoodSeller','BankDetails','CommissionPercent','Status','LoginCode','Remarks','AdminRemarks','ComplianceRelaxation','RelaxationFor','RelaxationReason','RelaxationValidUntil','RelaxationApprovedBy','ComplianceRiskLevel'],
  ProductSubmissions: ['SubmissionID','DateTime','SellerID','ProductName','Category','SubCategory','Brand','Unit','MRP','SellingPrice','Stock','ImageURL','Description','ListingMode','ReturnApplicable','WarrantyDetails','FoodRelated','FSSAIRequired','FSSAIValidated','GSTApplicable','GSTPercent','HSNCode','TaxInclusivePrice','GSTValidated','ApprovalStatus','AdminRemarks','ComplianceRelaxation','RelaxationFor','RelaxationReason','RelaxationValidUntil','RelaxationApprovedBy','ComplianceRiskLevel'],
  Hubs: ['HubID','DateTime','HubName','PartnerName','Name','Phone','WhatsApp','Area','Pincode','Address','AvailableSpace','VehicleAvailable','Role','PickupAvailable','HomeDeliveryAvailable','DeliveryCharge','CutOffTime','MinimumOrder','Status','Remarks'],
  HubAreas: ['AreaID','DateTime','Pincode','AreaName','City','HubID','HubName','Priority','PickupAvailable','HomeDeliveryAvailable','DeliveryCharge','Status'],
  DeliverySlots: ['SlotID','DateTime','HubID','SlotName','StartTime','EndTime','CutOffTime','Status'],
  HubApplications: ['HubApplicationID','DateTime','Name','Phone','WhatsApp','Area','Pincode','AvailableSpace','VehicleAvailable','Role','Remarks','Status'],
  Orders: ['OrderID','DateTime','CustomerName','Phone','WhatsApp','Address','Area','Pincode','HubID','HubName','Items','ProductTotal','DeliveryCharge','GrandTotal','PaymentMode','PaymentStatus','OrderStatus','DeliveryOption','DeliverySlot','SellerIDs','SupplierIDs','Notes'],
  OrderItems: ['OrderItemID','OrderID','ProductID','ProductName','Quantity','Unit','SellingPrice','CostPrice','Total','SellerID','SupplierID','HubID','Status'],
  Payments: ['PaymentID','DateTime','OrderID','CustomerName','Amount','PaymentMode','PaymentStatus','CollectedBy','CollectedDate','UPIReference','Remarks'],
  Settlements: ['SettlementID','DateTime','OrderID','PartyType','PartyID','PartyName','GrossAmount','Commission','DeliveryCharge','Deduction','NetPayable','SettlementStatus','PaidDate','Remarks'],
  Referrals: ['ReferralID','DateTime','ReferrerName','ReferrerPhone','ReferralType','ReferredName','ReferredPhone','Area','RewardPoints','Status','Remarks'],
  Contacts: ['ContactID','DateTime','Name','Phone','Email','EnquiryType','Message','Status','Remarks'],
  InventoryUpdates: ['UpdateID','DateTime','SellerID','ProductID','OldStock','NewStock','StockStatus','UpdatedBy','Remarks'],
  Returns: ['ReturnID','DateTime','OrderID','ProductID','ProductName','CustomerName','Phone','Reason','PhotoURL','RequestedDate','ReturnStatus','ApprovedBy','Resolution','Remarks'],
  Refunds: ['RefundID','DateTime','ReturnID','OrderID','CustomerName','RefundAmount','RefundMode','RefundStatus','RefundDate','UPIReference','Remarks'],
  Reviews: ['ReviewID','DateTime','OrderID','ProductID','SellerID','HubID','CustomerName','Phone','ProductRating','SellerRating','DeliveryRating','ReviewText','PhotoURL','VerifiedPurchase','Status','AdminRemarks'],
  SellerPerformance: ['SellerID','SellerName','TotalOrders','CancelledDueToOOS','ReturnCount','ComplaintCount','SellerRating','ReturnRate','Status'],
  ProductRatingSummary: ['ProductID','ProductName','TotalReviews','AverageRating','FiveStar','FourStar','ThreeStar','TwoStar','OneStar','LastUpdated'],
  HubPerformance: ['HubID','HubName','TotalOrders','DeliveredOrders','CancelledOrders','DeliveryComplaintCount','DelayCount','PaymentIssueCount','HubRating','Status','LastUpdated'],
  Forms: ['FormID','DateTime','FormType','Name','Phone','WhatsApp','Email','Area','Pincode','Message','Status'],
  ValidationErrors: ['ErrorID','DateTime','SheetName','RowNumber','Field','Issue','Value','Severity','Status'],
  DeliverySheetsIndex: ['SheetName','Date','HubID','HubName','OrderCount','GrandTotal','GeneratedAt','GeneratedBy','Status'],
  DailyOrderReports: ['ReportID','ReportDate','GeneratedAt','TotalOrders','DeliveredOrders','CancelledOrders','ProductTotal','DeliveryTotal','GrandTotal','UPIOnlineAmount','UPIOnDeliveryAmount','UPIAtHubPickupAmount','PendingPaymentAmount','Remarks'],
  SellerStatements: ['StatementID','PeriodStart','PeriodEnd','SellerID','SellerName','Orders','GrossSales','CommissionPercent','CommissionAmount','Deductions','NetPayable','GeneratedAt','SettlementStatus','PaidDate','Remarks'],
  HubStatements: ['StatementID','PeriodStart','PeriodEnd','HubID','HubName','Orders','DeliveryChargeTotal','HubCommission','Deductions','NetPayable','GeneratedAt','SettlementStatus','PaidDate','Remarks'],
  CustomerStatements: ['StatementID','PeriodStart','PeriodEnd','CustomerPhone','CustomerName','Orders','TotalPurchase','TotalDeliveryCharge','GrandTotal','GeneratedAt','Remarks'],
  PaymentVerifications: ['VerificationID','DateTime','OrderID','PaymentID','CustomerName','Phone','ExpectedAmount','PaidAmount','PaymentMode','UPIReference','VerificationStatus','VerifiedBy','ReceiptID','Remarks'],
  Receipts: ['ReceiptID','DateTime','ReceiptType','RelatedID','OrderID','PartyType','PartyID','PartyName','Phone','PaymentMode','Amount','UPIReference','PaymentStatus','ReceiptDate','ReceiptText','GeneratedBy','Remarks'],
  SupplierPayments: ['SupplierPaymentID','DateTime','PeriodStart','PeriodEnd','SupplierID','SupplierName','Orders','GrossPurchaseAmount','ReturnDeduction','NetPayable','SettlementStatus','PaidDate','PaymentMode','UPIReference','ReceiptID','Remarks'],
  SellerSettlements: ['SettlementID','DateTime','PeriodStart','PeriodEnd','SellerID','SellerName','Orders','GrossSales','CommissionPercent','CommissionAmount','RefundDeduction','PenaltyDeduction','NetPayable','SettlementStatus','PaidDate','PaymentMode','UPIReference','ReceiptID','Remarks'],
  HubSettlements: ['HubSettlementID','DateTime','PeriodStart','PeriodEnd','HubID','HubName','Orders','PickupOrders','DeliveryOrders','HandlingFee','ReturnHandlingFee','Deductions','NetPayable','SettlementStatus','PaidDate','PaymentMode','UPIReference','ReceiptID','Remarks'],
  DeliverySettlements: ['DeliverySettlementID','DateTime','PeriodStart','PeriodEnd','DeliveryPartnerID','DeliveryPartnerName','HubID','Deliveries','ReturnPickups','DeliveryFee','Deductions','NetPayable','SettlementStatus','PaidDate','PaymentMode','UPIReference','ReceiptID','Remarks'],
  Discounts: ['DiscountID','DateTime','OrderID','ProductID','SellerID','DiscountType','DiscountAmount','FundedBy','Status','Remarks'],
  TaxSummary: ['TaxID','DateTime','PeriodStart','PeriodEnd','OrderID','TaxableValue','GSTAmount','GSTPercent','TCSAmount','TDSAmount','HSNCode','SACCode','Remarks'],
  ExpenseTracker: ['ExpenseID','DateTime','ExpenseDate','ExpenseType','PartyName','Amount','PaymentMode','UPIReference','PaymentStatus','ReceiptID','Remarks'],
  PaymentReconciliation: ['ReconID','DateTime','OrderID','PaymentID','CustomerName','ExpectedAmount','PaidAmount','BalanceAmount','PaymentMode','PaymentStatus','UPIReference','ReceiptID','ReconStatus','Remarks'],
  SettlementLog: ['LogID','DateTime','SettlementType','SettlementID','PartyType','PartyID','PartyName','Amount','PaymentMode','UPIReference','ReceiptID','Status','Remarks'],
  ClearLog: ['ClearID','DateTime','Action','SheetName','RowsAffected','DoneBy','Remarks'],
  ActivityLog: ['LogID','DateTime','Action','User','Details']
};

function onOpen(){
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Freshly Mart Backend')
    .addItem('Setup / Repair All Sheets', 'setupFreshlyMart')
    .addItem('Format All Backend Sheets', 'formatAllFreshlyMartSheets')
    .addItem('Apply Dropdown Validations', 'applyBackendValidations')
    .addItem('Validate Backend Data', 'validateBackendData')
    .addItem('Validate GST/FSSAI Compliance', 'validateBackendData')
    .addItem('Validate UPI Payment Rules', 'validateBackendData')
    .addItem('Fix Delivery Slot Time Formatting', 'fixDeliverySlotTimeFormatting')
    .addSeparator()
    .addSubMenu(ui.createMenu('Delivery Sheets')
      .addItem('Generate Today\'s Delivery Sheets', 'generateTodaysDeliverySheets')
      .addItem('Generate Delivery Sheets by Date', 'generateDeliverySheetsByDatePrompt')
      .addItem('Clear Generated Delivery Sheets', 'clearGeneratedDeliverySheetsPrompt'))
    .addSubMenu(ui.createMenu('Reports')
      .addItem('Generate Today\'s Order Report', 'generateTodayOrderReport')
      .addItem('Generate Date Range Order Report', 'generateDateRangeOrderReportPrompt')
      .addItem('Generate Current Month Seller Statements', 'generateCurrentMonthSellerStatements')
      .addItem('Generate Current Month Hub Statements', 'generateCurrentMonthHubStatements')
      .addItem('Generate Current Month Customer Statements', 'generateCurrentMonthCustomerStatements')
      .addItem('Refresh Ratings & Performance', 'refreshRatingsAndPerformance'))
    .addSubMenu(ui.createMenu('Payments & Receipts')
      .addItem('Verify UPI Payment by Order ID', 'verifyPaymentByOrderIdPrompt')
      .addItem('Generate Receipt by Order ID', 'generateReceiptByOrderIdPrompt')
      .addItem('Generate Receipts for Paid Orders', 'generateReceiptsForPaidOrders')
      .addItem('Generate Payment Reconciliation', 'generatePaymentReconciliation')
      .addSeparator()
      .addItem('Generate Current Month Seller Settlements', 'generateCurrentMonthSellerSettlements')
      .addItem('Generate Current Month Supplier Payments', 'generateCurrentMonthSupplierPayments')
      .addItem('Generate Current Month Hub Settlements', 'generateCurrentMonthHubSettlements')
      .addItem('Generate Current Month Delivery Settlements', 'generateCurrentMonthDeliverySettlements')
      .addItem('Generate All Payment Automation', 'generateCurrentMonthPaymentAutomation')
      .addSeparator()
      .addItem('Mark Settlement Paid by ID', 'markSettlementPaidPrompt')
      .addItem('Add Manual Expense', 'addManualExpensePrompt'))
    .addSubMenu(ui.createMenu('Safe Clearing / Archive')
      .addItem('Archive Delivered/Cancelled Orders Older Than 30 Days', 'archiveOldCompletedOrdersPrompt')
      .addItem('Clear Validation Errors', 'clearValidationErrorsPrompt')
      .addItem('Clear Report Output Sheets', 'clearReportOutputSheetsPrompt'))
    .addSeparator()
    .addSubMenu(ui.createMenu('Sample Data')
      .addItem('Add Full Sample Data', 'addFreshlyMartSampleData')
      .addItem('Clear Sample Data Only', 'clearFreshlyMartSampleDataPrompt'))
    .addItem('Setup / Repair Banners', 'setupFreshlyMartBanners')
    .addItem('Mark All Pending Products Live', 'approveAllPendingProducts')
    .addToUi();
}

function setupFreshlyMart(){
  Object.keys(FM_SHEETS).forEach(function(name){ ensureSheet_(name, FM_SHEETS[name]); });
  seedSettings_();
  seedCategories_();
  setupFreshlyMartBanners(false);
  formatAllFreshlyMartSheets(false);
  applyBackendValidations(false);
  logActivity_('setupFreshlyMart','System','Sheets repaired/formatted/validated');
  safeUiAlert_('Freshly Mart backend is ready. Deploy this Apps Script as Web App and paste URL in assets/app.js.');
}

function ensureSheet_(name, headers){
  const ss = SpreadsheetApp.getActive();
  let sh = ss.getSheetByName(name);
  if(!sh) sh = ss.insertSheet(name);
  if(sh.getLastRow() === 0){
    sh.getRange(1,1,1,headers.length).setValues([headers]);
  }else{
    const currentLastCol = Math.max(sh.getLastColumn(), 1);
    const current = sh.getRange(1,1,1,currentLastCol).getValues()[0].map(function(h){ return String(h || '').trim(); });
    if(current.filter(String).length === 0){
      sh.getRange(1,1,1,headers.length).setValues([headers]);
    }else{
      headers.forEach(function(h){
        if(current.indexOf(h) === -1){
          sh.getRange(1, sh.getLastColumn()+1).setValue(h);
          current.push(h);
        }
      });
    }
  }
  sh.setFrozenRows(1);
  return sh;
}

function seedSettings_(){
  const sh = sheet_('Settings');
  const defaults = [
    ['WebsiteName','Freshly Mart','Active'],
    ['Tagline','Freshness, Essentials & Local Deals — Delivered Through Trusted Hubs','Active'],
    ['FreshlyWebsiteURL','https://freshly-online.com','Active'],
    ['AdminWhatsApp','918921696649','Active'],
    ['SupportWhatsApp','918921696649','Active'],
    ['SellerSupportWhatsApp','918921696649','Active'],
    ['HubSupportWhatsApp','918921696649','Active'],
    ['DefaultDeliveryCharge','40','Active'],
    ['MinimumOrder','300','Active'],
    ['DefaultSellerCommissionPercent','10','Active'],
    ['DefaultHubCommissionPerOrder','20','Active'],
    ['FSSAIApprovalMode','Number Required','Active'],
    ['GSTApprovalMode','Number Required','Active'],
    ['AllowComplianceRelaxation','Yes','Active'],
    ['FreshlyMartFSSAINumber','','Active'],
    ['FreshlyMartGSTNumber','','Active'],
    ['UPIID','','Active'],
    ['UPIQRCodeImageURL','','Active'],
    ['PaymentPolicy','UPI only to Freshly Mart. No cash collection by hubs, sellers or delivery partners.','Active'],
    ['AllowCashPayment','No','Active'],
    ['AdminCode','FRESHLYMARTADMIN_CHANGE_ME','Active'],
    ['BackendVersion', FM_VERSION, 'Active']
  ];
  const existing = rowsAsObjects_('Settings').map(function(r){ return String(r.SettingName || '').trim(); });
  defaults.forEach(function(row){ if(existing.indexOf(row[0]) === -1) sh.appendRow(row); });
}

function seedCategories_(){
  const sh = sheet_('Categories');
  if(sh.getLastRow()>1) return;
  const rows = [
    ['CAT001','Fresh Items','fresh-items','Redirect','https://freshly-online.com','','Active',1],
    ['CAT002','Grocery','grocery','Marketplace','','','Active',2],
    ['CAT003','Daily Essentials','daily-essentials','Marketplace','','','Active',3],
    ['CAT004','Home Products','home-products','Marketplace','','','Active',4],
    ['CAT005','Fashion','fashion','Marketplace','','','Active',5],
    ['CAT006','Stationery','stationery','Marketplace','','','Active',6],
    ['CAT007','Electronics Accessories','electronics-accessories','Marketplace','','','Active',7],
    ['CAT008','Wellness Products','wellness','Marketplace','','','Active',8],
    ['CAT009','Local Stores','local-stores','StoreDirectory','','','Active',9]
  ];
  sh.getRange(2,1,rows.length,8).setValues(rows);
}

function setupFreshlyMartBanners(showAlert){
  const sh = ensureSheet_('Banners', FM_SHEETS.Banners);
  if(sh.getLastRow()>1){ if(showAlert !== false) safeUiAlert_('Banners sheet already exists. Headers repaired.'); return; }
  const rows = [
    ['BNR001','Freshly Mart','Freshness, essentials and local deals — delivered through trusted Freshly Hubs.','','Shop Now','category.html?cat=all','Fresh Items','fresh-items.html','Hero',1,'Active','#0b7a3b','#0f9960','#ffffff','🛒'],
    ['BNR002','Fresh Items by Freshly','Fresh fish, meat, fruits, vegetables and fresh food are handled through Freshly.','','Order on Freshly','fresh-items.html','Know More','fresh-items.html','Hero',2,'Active','#075985','#0ea5e9','#ffffff','🐟'],
    ['BNR003','Special Weekly Offers','Promote grocery, daily essentials, home products and local store offers here.','','View Deals','category.html?cat=deals','Grocery','category.html?cat=grocery','Hero',3,'Active','#b45309','#f59e0b','#ffffff','🏷️'],
    ['BNR004','Sell on Freshly Mart','Sellers can onboard, submit products and go live only after Freshly Mart approval.','','Sell With Us','sell-with-us.html','Seller Login','seller-login.html','Hero',4,'Active','#1e3a8a','#2563eb','#ffffff','🏪'],
    ['BNR005','Join Freshly Hub Network','Earn as a hub partner by supporting pickup, delivery, replacements and returns.','','Join Hub','join-hub.html','Refer & Earn','refer.html','Hero',5,'Active','#14532d','#22c55e','#ffffff','🚚']
  ];
  sh.getRange(2,1,rows.length,FM_SHEETS.Banners.length).setValues(rows);
  if(showAlert !== false) safeUiAlert_('Banners sheet created with sample slides. Edit Status=Hidden to hide a banner.');
}


function seedFreshlyMartSamples(){
  addFreshlyMartSampleData();
}

function addFreshlyMartSampleData(){
  setupFreshlyMart();
  const now = new Date();
  let added = 0;

  added += addSampleSuppliers_(now);
  added += addSampleSellers_(now);
  added += addSampleHubs_(now);
  added += addSampleProducts_(now);
  added += addSampleProductSubmissions_(now);
  added += addSampleOrdersAndPayments_(now);
  added += addSampleReturnsRefundsReviews_(now);
  added += addSampleForms_(now);

  formatAllFreshlyMartSheets(false);
  applyBackendValidations(false);
  refreshRatingsAndPerformance();
  logActivity_('addFreshlyMartSampleData','Admin','Full sample data added/checked. New rows added: '+added);
  safeUiAlert_('Freshly Mart sample data added. New rows added: '+added+'\n\nSheets updated: Suppliers, Sellers, Hubs, HubAreas, DeliverySlots, Products, ProductSubmissions, Orders, OrderItems, Payments, Returns, Refunds, Reviews, Referrals, Contacts and HubApplications.');
}

function addSampleSuppliers_(now){
  let added = 0;
  const rows = [
    {SupplierID:'SAMPLE_SUP_001', DateTime:now, SupplierName:'TEST Calicut Wholesale Grocery', ContactPerson:'TEST Supplier A', Phone:'9000000001', WhatsApp:'9000000001', Category:'Grocery', Address:'TEST Wholesale Market, Kozhikode', Area:'Kozhikode', Pincode:'673001', ProcurementType:'Order-based', PaymentTerms:'Weekly', Status:'Active', Remarks:'Sample supplier for grocery products'},
    {SupplierID:'SAMPLE_SUP_002', DateTime:now, SupplierName:'TEST Home Products Distributor', ContactPerson:'TEST Supplier B', Phone:'9000000002', WhatsApp:'9000000002', Category:'Home Products', Address:'TEST Distributor Road, Calicut', Area:'Calicut', Pincode:'673004', ProcurementType:'Daily pickup', PaymentTerms:'Weekly', Status:'Active', Remarks:'Sample supplier for home and daily essentials'},
    {SupplierID:'SAMPLE_SUP_003', DateTime:now, SupplierName:'TEST Wellness & Yoga Supplies', ContactPerson:'TEST Supplier C', Phone:'9000000003', WhatsApp:'9000000003', Category:'Wellness Products', Address:'TEST Wellness Lane', Area:'Peringolam', Pincode:'673571', ProcurementType:'Pre-order', PaymentTerms:'Monthly', Status:'Active', Remarks:'Sample supplier for yoga/wellness items'}
  ];
  rows.forEach(function(r){ if(appendSampleObject_('Suppliers','SupplierID',r)) added++; });
  return added;
}

function addSampleSellers_(now){
  let added = 0;
  const rows = [
    {SellerID:'SAMPLE_SEL_001', DateTime:now, BusinessName:'TEST Calicut Stationery Mart', OwnerName:'TEST Seller One', Phone:'9000010001', WhatsApp:'9000010001', Email:'test.stationery@example.com', BusinessType:'Local Store', Category:'Stationery', Address:'TEST SM Street, Kozhikode', Area:'Kozhikode', Pincode:'673001', GSTNumber:'32ABCDE1234F1Z5', GSTStatus:'Provided', GSTRequired:'Yes', GSTVerified:'No', PANNumber:'ABCDE1234F', FSSAINumber:'', FSSAIRequired:'No', BankDetails:'TEST BANK - SAMPLE ONLY', CommissionPercent:10, Status:'Approved', LoginCode:'TEST123', Remarks:'Sample approved seller', AdminRemarks:'Sample data'},
    {SellerID:'SAMPLE_SEL_002', DateTime:now, BusinessName:'TEST Mobile Accessories Partner', OwnerName:'TEST Seller Two', Phone:'9000010002', WhatsApp:'9000010002', Email:'test.mobile@example.com', BusinessType:'Local Store', Category:'Electronics Accessories', Address:'TEST Mobile Street, Calicut', Area:'Kozhikode', Pincode:'673004', GSTNumber:'32ABCDE1234F1Z5', GSTStatus:'Provided', GSTRequired:'Yes', GSTVerified:'No', PANNumber:'ABCDE1234F', FSSAINumber:'', FSSAIRequired:'No', BankDetails:'TEST BANK - SAMPLE ONLY', CommissionPercent:12, Status:'Approved', LoginCode:'TEST123', Remarks:'Sample approved seller', AdminRemarks:'Sample data'},
    {SellerID:'SAMPLE_SEL_003', DateTime:now, BusinessName:'TEST Local Fashion Boutique', OwnerName:'TEST Seller Three', Phone:'9000010003', WhatsApp:'9000010003', Email:'test.fashion@example.com', BusinessType:'Boutique', Category:'Fashion', Address:'TEST Boutique Road', Area:'Kunnamangalam', Pincode:'673571', GSTNumber:'32ABCDE1234F1Z5', GSTStatus:'Provided', GSTRequired:'Yes', GSTVerified:'No', PANNumber:'ABCDE1234F', FSSAINumber:'', FSSAIRequired:'No', BankDetails:'TEST BANK - SAMPLE ONLY', CommissionPercent:15, Status:'Pending', LoginCode:'TEST123', Remarks:'Sample pending seller', AdminRemarks:'Sample data'}
  ];
  rows.forEach(function(r){ if(appendSampleObject_('Sellers','SellerID',r)) added++; });
  return added;
}

function addSampleHubs_(now){
  let added = 0;
  const hubs = [
    {HubID:'SAMPLE_HUB_001', DateTime:now, HubName:'TEST Kunnamangalam Hub', PartnerName:'TEST Hub Partner A', Name:'TEST Hub Partner A', Phone:'9000020001', WhatsApp:'9000020001', Area:'Kunnamangalam', Pincode:'673571', Address:'TEST Hub Address, Kunnamangalam', AvailableSpace:'Small room / counter', VehicleAvailable:'Yes', Role:'Hub Partner', PickupAvailable:'Yes', HomeDeliveryAvailable:'Yes', DeliveryCharge:40, CutOffTime:'03:00 PM', MinimumOrder:300, Status:'Active', Remarks:'Sample hub'},
    {HubID:'SAMPLE_HUB_002', DateTime:now, HubName:'TEST Medical College Hub', PartnerName:'TEST Hub Partner B', Name:'TEST Hub Partner B', Phone:'9000020002', WhatsApp:'9000020002', Area:'Medical College', Pincode:'673008', Address:'TEST Hub Address, Medical College', AvailableSpace:'Shop counter', VehicleAvailable:'Yes', Role:'Hub + Delivery', PickupAvailable:'Yes', HomeDeliveryAvailable:'Yes', DeliveryCharge:50, CutOffTime:'02:30 PM', MinimumOrder:300, Status:'Active', Remarks:'Sample hub'},
    {HubID:'SAMPLE_HUB_003', DateTime:now, HubName:'TEST Peringolam Hub', PartnerName:'TEST Hub Partner C', Name:'TEST Hub Partner C', Phone:'9000020003', WhatsApp:'9000020003', Area:'Peringolam', Pincode:'673571', Address:'TEST Hub Address, Peringolam', AvailableSpace:'Home-based hub', VehicleAvailable:'No', Role:'Pickup Hub', PickupAvailable:'Yes', HomeDeliveryAvailable:'No', DeliveryCharge:0, CutOffTime:'04:00 PM', MinimumOrder:250, Status:'Active', Remarks:'Sample pickup-only hub'}
  ];
  hubs.forEach(function(r){ if(appendSampleObject_('Hubs','HubID',r)) added++; });

  const areas = [
    {AreaID:'SAMPLE_AREA_001', DateTime:now, Pincode:'673571', AreaName:'Kunnamangalam', City:'Kozhikode', HubID:'SAMPLE_HUB_001', HubName:'TEST Kunnamangalam Hub', Priority:1, PickupAvailable:'Yes', HomeDeliveryAvailable:'Yes', DeliveryCharge:40, Status:'Active'},
    {AreaID:'SAMPLE_AREA_002', DateTime:now, Pincode:'673008', AreaName:'Medical College', City:'Kozhikode', HubID:'SAMPLE_HUB_002', HubName:'TEST Medical College Hub', Priority:1, PickupAvailable:'Yes', HomeDeliveryAvailable:'Yes', DeliveryCharge:50, Status:'Active'},
    {AreaID:'SAMPLE_AREA_003', DateTime:now, Pincode:'673571', AreaName:'Peringolam', City:'Kozhikode', HubID:'SAMPLE_HUB_003', HubName:'TEST Peringolam Hub', Priority:2, PickupAvailable:'Yes', HomeDeliveryAvailable:'No', DeliveryCharge:0, Status:'Active'}
  ];
  areas.forEach(function(r){ if(appendSampleObject_('HubAreas','AreaID',r)) added++; });

  const slots = [
    {SlotID:'SAMPLE_SLOT_001', DateTime:now, HubID:'SAMPLE_HUB_001', SlotName:'Evening Delivery', StartTime:'05:00 PM', EndTime:'08:00 PM', CutOffTime:'03:00 PM', Status:'Active'},
    {SlotID:'SAMPLE_SLOT_002', DateTime:now, HubID:'SAMPLE_HUB_002', SlotName:'Evening Delivery', StartTime:'05:30 PM', EndTime:'08:30 PM', CutOffTime:'02:30 PM', Status:'Active'},
    {SlotID:'SAMPLE_SLOT_003', DateTime:now, HubID:'SAMPLE_HUB_003', SlotName:'Hub Pickup', StartTime:'04:30 PM', EndTime:'07:00 PM', CutOffTime:'04:00 PM', Status:'Active'}
  ];
  slots.forEach(function(r){ if(appendSampleObject_('DeliverySlots','SlotID',r)) added++; });
  return added;
}

function addSampleProducts_(now){
  let added = 0;
  const products = [
    ['SAMPLE_PROD_001','Matta Rice 5kg','grocery','Rice','Freshly Mart','5 kg',320,285,250,35,'Freshly Mart Direct','Freshly Mart','','SAMPLE_SUP_001','https://placehold.co/600x400?text=Matta+Rice','Sample grocery item for testing.',25,'Live',1,5,'Yes','Hub','Live','Yes',1,4.6,18],
    ['SAMPLE_PROD_002','Coconut Oil 1L','grocery','Oil','Freshly Mart','1 bottle',190,165,140,25,'Freshly Mart Direct','Freshly Mart','','SAMPLE_SUP_001','https://placehold.co/600x400?text=Coconut+Oil','Sample grocery item for testing.',30,'Live',1,10,'Yes','Hub','Live','Yes',2,4.5,22],
    ['SAMPLE_PROD_003','Washing Powder 1kg','daily-essentials','Laundry','Freshly Mart','1 kg',160,135,110,25,'Freshly Mart Direct','Freshly Mart','','SAMPLE_SUP_002','https://placehold.co/600x400?text=Washing+Powder','Sample daily essential item.',18,'Live',1,5,'Yes','Hub','Live','Yes',3,4.2,11],
    ['SAMPLE_PROD_004','Dishwash Liquid 500ml','daily-essentials','Cleaning','Freshly Mart','500 ml',110,95,75,20,'Freshly Mart Direct','Freshly Mart','','SAMPLE_SUP_002','https://placehold.co/600x400?text=Dishwash','Sample daily essential item.',16,'Live',1,5,'Yes','Hub','Live','No',4,4.1,8],
    ['SAMPLE_PROD_005','Kitchen Storage Container Set','home-products','Kitchen','Freshly Mart','3 pcs',399,299,220,79,'Freshly Mart Direct','Freshly Mart','','SAMPLE_SUP_002','https://placehold.co/600x400?text=Storage+Set','Sample home product.',10,'Live',1,3,'Yes','Hub','Live','Yes',5,4.4,9],
    ['SAMPLE_PROD_006','Steel Lunch Box','home-products','Kitchen','Freshly Mart','1 piece',350,275,210,65,'Freshly Mart Direct','Freshly Mart','','SAMPLE_SUP_002','https://placehold.co/600x400?text=Lunch+Box','Sample home product.',8,'Live',1,3,'Yes','Hub','Live','No',6,4.3,6],
    ['SAMPLE_PROD_007','Notebook Combo Pack','stationery','School Supplies','','5 books',250,199,160,39,'Partner Store','TEST Calicut Stationery Mart','SAMPLE_SEL_001','','https://placehold.co/600x400?text=Notebook+Pack','Sample stationery product.',12,'Live',1,5,'Yes','Hub','Live','Yes',7,4.5,14],
    ['SAMPLE_PROD_008','Blue Pen Pack','stationery','Writing','','10 pens',120,99,70,29,'Partner Store','TEST Calicut Stationery Mart','SAMPLE_SEL_001','','https://placehold.co/600x400?text=Pen+Pack','Sample stationery product.',35,'Live',1,10,'Yes','Hub','Live','No',8,4.0,5],
    ['SAMPLE_PROD_009','USB-C Charging Cable','electronics-accessories','Mobile Accessories','','1 piece',299,199,130,69,'Partner Store','TEST Mobile Accessories Partner','SAMPLE_SEL_002','','https://placehold.co/600x400?text=USB-C+Cable','Sample accessory item.',20,'Live',1,5,'Yes','Hub','Live','Yes',9,4.1,7],
    ['SAMPLE_PROD_010','Mobile Charger 20W','electronics-accessories','Mobile Accessories','','1 piece',599,449,330,119,'Partner Store','TEST Mobile Accessories Partner','SAMPLE_SEL_002','','https://placehold.co/600x400?text=Mobile+Charger','Sample accessory item.',0,'Out of Stock',1,2,'Yes','Hub','Out of Stock','No',10,4.0,3],
    ['SAMPLE_PROD_011','Yoga Mat 6mm','wellness','Yoga','','1 piece',799,599,430,169,'Freshly Mart Direct','Freshly Mart','','SAMPLE_SUP_003','https://placehold.co/600x400?text=Yoga+Mat','Sample wellness product. No medical claims.',7,'Live',1,2,'Yes','Hub','Live','Yes',11,4.8,16],
    ['SAMPLE_PROD_012','Copper Water Bottle','wellness','Lifestyle','','1 bottle',899,699,520,179,'Freshly Mart Direct','Freshly Mart','','SAMPLE_SUP_003','https://placehold.co/600x400?text=Copper+Bottle','Sample wellness/lifestyle product.',5,'Low Stock',1,2,'Yes','Hub','Live','No',12,4.6,10],
    ['SAMPLE_PROD_013','Kids T-Shirt','fashion','Kids Wear','','1 piece',399,299,210,89,'Partner Store','TEST Local Fashion Boutique','SAMPLE_SEL_003','','https://placehold.co/600x400?text=Kids+T-Shirt','Sample fashion product.',14,'Live',1,2,'Yes','Hub','Live','No',13,4.2,6],
    ['SAMPLE_PROD_014','Women Cotton Kurti','fashion','Women Wear','','1 piece',799,599,440,159,'Partner Store','TEST Local Fashion Boutique','SAMPLE_SEL_003','','https://placehold.co/600x400?text=Cotton+Kurti','Sample fashion product.',6,'Live',1,1,'Yes','Hub','Live','Yes',14,4.5,8]
  ];
  products.forEach(function(p){
    const obj = {};
    FM_SHEETS.Products.forEach(function(h,i){ obj[h] = p[i] !== undefined ? p[i] : ''; });
    if(appendSampleObject_('Products','ProductID',obj)) added++;
  });
  return added;
}

function addSampleProductSubmissions_(now){
  let added = 0;
  const rows = [
    {SubmissionID:'SAMPLE_SUB_001', DateTime:now, SellerID:'SAMPLE_SEL_001', ProductName:'Art Pencil Set', Category:'stationery', SubCategory:'Art Supplies', Brand:'TEST Brand', Unit:'1 pack', MRP:180, SellingPrice:149, Stock:20, ImageURL:'https://placehold.co/600x400?text=Art+Pencil+Set', Description:'Sample product waiting for Freshly Mart approval.', ListingMode:'Partner Store', ReturnApplicable:'Yes', WarrantyDetails:'No warranty', ApprovalStatus:'Pending', AdminRemarks:'Sample pending approval'},
    {SubmissionID:'SAMPLE_SUB_002', DateTime:now, SellerID:'SAMPLE_SEL_002', ProductName:'Phone Cover', Category:'electronics-accessories', SubCategory:'Mobile Accessories', Brand:'TEST Brand', Unit:'1 piece', MRP:199, SellingPrice:149, Stock:25, ImageURL:'https://placehold.co/600x400?text=Phone+Cover', Description:'Sample rejected/under review product.', ListingMode:'Partner Store', ReturnApplicable:'Yes', WarrantyDetails:'No warranty', ApprovalStatus:'Revision Required', AdminRemarks:'Improve image and description'}
  ];
  rows.forEach(function(r){ if(appendSampleObject_('ProductSubmissions','SubmissionID',r)) added++; });
  return added;
}

function addSampleOrdersAndPayments_(now){
  let added = 0;
  const orders = [
    {OrderID:'SAMPLE_ORD_001', DateTime:now, CustomerName:'TEST Customer One', Phone:'9000030001', WhatsApp:'9000030001', Address:'TEST Address 1', Area:'Kunnamangalam', Pincode:'673571', HubID:'SAMPLE_HUB_001', HubName:'TEST Kunnamangalam Hub', Items:'Matta Rice 5kg x 1, Coconut Oil 1L x 1', ProductTotal:450, DeliveryCharge:40, GrandTotal:490, PaymentMode:'UPI Online', PaymentStatus:'Paid to Freshly Mart', OrderStatus:'Delivered', DeliveryOption:'Home Delivery', DeliverySlot:'Evening Delivery', SellerIDs:'', SupplierIDs:'SAMPLE_SUP_001', Notes:'Sample delivered order'},
    {OrderID:'SAMPLE_ORD_002', DateTime:now, CustomerName:'TEST Customer Two', Phone:'9000030002', WhatsApp:'9000030002', Address:'TEST Address 2', Area:'Medical College', Pincode:'673008', HubID:'SAMPLE_HUB_002', HubName:'TEST Medical College Hub', Items:'Notebook Combo Pack x 2, Blue Pen Pack x 1', ProductTotal:497, DeliveryCharge:50, GrandTotal:547, PaymentMode:'UPI on Delivery', PaymentStatus:'UPI Pending at Delivery', OrderStatus:'Confirmed', DeliveryOption:'Home Delivery', DeliverySlot:'Evening Delivery', SellerIDs:'SAMPLE_SEL_001', SupplierIDs:'', Notes:'Sample active order'},
    {OrderID:'SAMPLE_ORD_003', DateTime:now, CustomerName:'TEST Customer Three', Phone:'9000030003', WhatsApp:'9000030003', Address:'TEST Address 3', Area:'Peringolam', Pincode:'673571', HubID:'SAMPLE_HUB_003', HubName:'TEST Peringolam Hub', Items:'Yoga Mat 6mm x 1', ProductTotal:599, DeliveryCharge:0, GrandTotal:599, PaymentMode:'UPI Online', PaymentStatus:'Paid to Freshly Mart', OrderStatus:'Ready for Pickup', DeliveryOption:'Pickup', DeliverySlot:'Hub Pickup', SellerIDs:'', SupplierIDs:'SAMPLE_SUP_003', Notes:'Sample pickup order'}
  ];
  orders.forEach(function(r){ if(appendSampleObject_('Orders','OrderID',r)) added++; });

  const items = [
    {OrderItemID:'SAMPLE_ITEM_001', OrderID:'SAMPLE_ORD_001', ProductID:'SAMPLE_PROD_001', ProductName:'Matta Rice 5kg', Quantity:1, Unit:'5 kg', SellingPrice:285, CostPrice:250, Total:285, SellerID:'', SupplierID:'SAMPLE_SUP_001', HubID:'SAMPLE_HUB_001', Status:'Delivered'},
    {OrderItemID:'SAMPLE_ITEM_002', OrderID:'SAMPLE_ORD_001', ProductID:'SAMPLE_PROD_002', ProductName:'Coconut Oil 1L', Quantity:1, Unit:'1 bottle', SellingPrice:165, CostPrice:140, Total:165, SellerID:'', SupplierID:'SAMPLE_SUP_001', HubID:'SAMPLE_HUB_001', Status:'Delivered'},
    {OrderItemID:'SAMPLE_ITEM_003', OrderID:'SAMPLE_ORD_002', ProductID:'SAMPLE_PROD_007', ProductName:'Notebook Combo Pack', Quantity:2, Unit:'5 books', SellingPrice:199, CostPrice:160, Total:398, SellerID:'SAMPLE_SEL_001', SupplierID:'', HubID:'SAMPLE_HUB_002', Status:'Confirmed'},
    {OrderItemID:'SAMPLE_ITEM_004', OrderID:'SAMPLE_ORD_002', ProductID:'SAMPLE_PROD_008', ProductName:'Blue Pen Pack', Quantity:1, Unit:'10 pens', SellingPrice:99, CostPrice:70, Total:99, SellerID:'SAMPLE_SEL_001', SupplierID:'', HubID:'SAMPLE_HUB_002', Status:'Confirmed'},
    {OrderItemID:'SAMPLE_ITEM_005', OrderID:'SAMPLE_ORD_003', ProductID:'SAMPLE_PROD_011', ProductName:'Yoga Mat 6mm', Quantity:1, Unit:'1 piece', SellingPrice:599, CostPrice:430, Total:599, SellerID:'', SupplierID:'SAMPLE_SUP_003', HubID:'SAMPLE_HUB_003', Status:'Ready for Pickup'}
  ];
  items.forEach(function(r){ if(appendSampleObject_('OrderItems','OrderItemID',r)) added++; });

  const payments = [
    {PaymentID:'SAMPLE_PAY_001', DateTime:now, OrderID:'SAMPLE_ORD_001', CustomerName:'TEST Customer One', Amount:490, PaymentMode:'UPI Online', PaymentStatus:'Paid to Freshly Mart', CollectedBy:'Freshly Mart', CollectedDate:now, UPIReference:'TESTUPI001', Remarks:'Sample payment'},
    {PaymentID:'SAMPLE_PAY_002', DateTime:now, OrderID:'SAMPLE_ORD_002', CustomerName:'TEST Customer Two', Amount:547, PaymentMode:'UPI on Delivery', PaymentStatus:'UPI Pending at Delivery', CollectedBy:'Freshly Mart UPI', CollectedDate:'', UPIReference:'', Remarks:'Sample pending UPI on delivery. Hub verifies Freshly Mart UPI payment before handover.'},
    {PaymentID:'SAMPLE_PAY_003', DateTime:now, OrderID:'SAMPLE_ORD_003', CustomerName:'TEST Customer Three', Amount:599, PaymentMode:'UPI Online', PaymentStatus:'Paid to Freshly Mart', CollectedBy:'Freshly Mart', CollectedDate:now, UPIReference:'TESTUPI003', Remarks:'Sample payment'}
  ];
  payments.forEach(function(r){ if(appendSampleObject_('Payments','PaymentID',r)) added++; });
  return added;
}

function addSampleReturnsRefundsReviews_(now){
  let added = 0;
  const returns = [
    {ReturnID:'SAMPLE_RET_001', DateTime:now, OrderID:'SAMPLE_ORD_001', ProductID:'SAMPLE_PROD_002', ProductName:'Coconut Oil 1L', CustomerName:'TEST Customer One', Phone:'9000030001', Reason:'TEST damaged pack complaint', PhotoURL:'https://placehold.co/600x400?text=Return+Proof', RequestedDate:now, ReturnStatus:'Under Review', ApprovedBy:'', Resolution:'Replacement', Remarks:'Sample return request'}
  ];
  returns.forEach(function(r){ if(appendSampleObject_('Returns','ReturnID',r)) added++; });

  const refunds = [
    {RefundID:'SAMPLE_REF_001', DateTime:now, ReturnID:'SAMPLE_RET_001', OrderID:'SAMPLE_ORD_001', CustomerName:'TEST Customer One', RefundAmount:165, RefundMode:'UPI', RefundStatus:'Pending', RefundDate:'', UPIReference:'', Remarks:'Sample refund pending'}
  ];
  refunds.forEach(function(r){ if(appendSampleObject_('Refunds','RefundID',r)) added++; });

  const reviews = [
    {ReviewID:'SAMPLE_REV_001', DateTime:now, OrderID:'SAMPLE_ORD_001', ProductID:'SAMPLE_PROD_001', SellerID:'', HubID:'SAMPLE_HUB_001', CustomerName:'TEST Customer One', Phone:'9000030001', ProductRating:5, SellerRating:5, DeliveryRating:5, ReviewText:'TEST verified review: good product and timely delivery.', PhotoURL:'', VerifiedPurchase:'Yes', Status:'Published', AdminRemarks:'Sample review'},
    {ReviewID:'SAMPLE_REV_002', DateTime:now, OrderID:'SAMPLE_ORD_002', ProductID:'SAMPLE_PROD_007', SellerID:'SAMPLE_SEL_001', HubID:'SAMPLE_HUB_002', CustomerName:'TEST Customer Two', Phone:'9000030002', ProductRating:4, SellerRating:4, DeliveryRating:3, ReviewText:'TEST verified review: product good, delivery can improve.', PhotoURL:'', VerifiedPurchase:'Yes', Status:'Published', AdminRemarks:'Sample review'},
    {ReviewID:'SAMPLE_REV_003', DateTime:now, OrderID:'SAMPLE_ORD_003', ProductID:'SAMPLE_PROD_011', SellerID:'', HubID:'SAMPLE_HUB_003', CustomerName:'TEST Customer Three', Phone:'9000030003', ProductRating:5, SellerRating:5, DeliveryRating:4, ReviewText:'TEST verified review: useful sample wellness product.', PhotoURL:'', VerifiedPurchase:'Yes', Status:'Pending', AdminRemarks:'Sample pending review'}
  ];
  reviews.forEach(function(r){ if(appendSampleObject_('Reviews','ReviewID',r)) added++; });
  return added;
}

function addSampleForms_(now){
  let added = 0;
  const hubApps = [
    {HubApplicationID:'SAMPLE_HUBAPP_001', DateTime:now, Name:'TEST Hub Applicant', Phone:'9000040001', WhatsApp:'9000040001', Area:'Mavoor Road', Pincode:'673004', AvailableSpace:'Small shop', VehicleAvailable:'Yes', Role:'Hub Partner', Remarks:'Sample hub application', Status:'Pending'}
  ];
  hubApps.forEach(function(r){ if(appendSampleObject_('HubApplications','HubApplicationID',r)) added++; });

  const refs = [
    {ReferralID:'SAMPLE_REFERRAL_001', DateTime:now, ReferrerName:'TEST Referrer', ReferrerPhone:'9000050001', ReferralType:'Seller', ReferredName:'TEST Referred Store', ReferredPhone:'9000050002', Area:'Kozhikode', RewardPoints:50, Status:'Pending', Remarks:'Sample referral'}
  ];
  refs.forEach(function(r){ if(appendSampleObject_('Referrals','ReferralID',r)) added++; });

  const contacts = [
    {ContactID:'SAMPLE_CONTACT_001', DateTime:now, Name:'TEST Enquiry Customer', Phone:'9000060001', Email:'test.customer@example.com', EnquiryType:'General', Message:'Sample contact enquiry for testing.', Status:'New', Remarks:'Sample contact'}
  ];
  contacts.forEach(function(r){ if(appendSampleObject_('Contacts','ContactID',r)) added++; });

  const inv = [
    {UpdateID:'SAMPLE_INV_001', DateTime:now, SellerID:'SAMPLE_SEL_002', ProductID:'SAMPLE_PROD_010', OldStock:5, NewStock:0, StockStatus:'Out of Stock', UpdatedBy:'Seller', Remarks:'Sample out-of-stock update'}
  ];
  inv.forEach(function(r){ if(appendSampleObject_('InventoryUpdates','UpdateID',r)) added++; });
  return added;
}

function clearFreshlyMartSampleDataPrompt(){
  const ui = SpreadsheetApp.getUi();
  const res = ui.alert('Clear Sample Data Only', 'This will delete only rows whose ID starts with SAMPLE_ or TEST_. Master data with normal IDs will not be touched. Continue?', ui.ButtonSet.YES_NO);
  if(res !== ui.Button.YES) return;
  const result = clearFreshlyMartSampleData_();
  ui.alert(result.message);
}

function clearFreshlyMartSampleData(){
  const result = clearFreshlyMartSampleData_();
  safeUiAlert_(result.message);
}

function clearFreshlyMartSampleData_(){
  const targets = {
    Suppliers:['SupplierID'], Sellers:['SellerID'], Hubs:['HubID'], HubAreas:['AreaID','HubID'], DeliverySlots:['SlotID','HubID'], Products:['ProductID','SellerID','SupplierID'], ProductSubmissions:['SubmissionID','SellerID'], Orders:['OrderID','HubID'], OrderItems:['OrderItemID','OrderID','ProductID','SellerID','SupplierID','HubID'], Payments:['PaymentID','OrderID'], Returns:['ReturnID','OrderID','ProductID'], Refunds:['RefundID','ReturnID','OrderID'], Reviews:['ReviewID','OrderID','ProductID','SellerID','HubID'], HubApplications:['HubApplicationID'], Referrals:['ReferralID'], Contacts:['ContactID'], InventoryUpdates:['UpdateID','ProductID','SellerID'], Settlements:['SettlementID','OrderID','PartyID'], SellerPerformance:['SellerID'], ProductRatingSummary:['ProductID'], HubPerformance:['HubID'], ValidationErrors:['ErrorID'], DeliverySheetsIndex:['SheetName','HubID'], DailyOrderReports:['ReportID'], SellerStatements:['StatementID','SellerID'], HubStatements:['StatementID','HubID'], CustomerStatements:['StatementID'], Forms:['FormID']
  };
  let total = 0;
  Object.keys(targets).forEach(function(sheetName){
    if(!SpreadsheetApp.getActive().getSheetByName(sheetName)) return;
    const removed = clearSampleRowsFromSheet_(sheetName, targets[sheetName]);
    if(removed > 0){
      total += removed;
      appendObject_('ClearLog', {ClearID:'CLR'+idStamp_()+sheetName, DateTime:new Date(), Action:'ClearSampleData', SheetName:sheetName, RowsAffected:removed, DoneBy:'Admin', Remarks:'Removed SAMPLE_/TEST_ rows only'});
    }
  });
  logActivity_('clearFreshlyMartSampleData','Admin','Sample rows removed: '+total);
  return {ok:true,message:'Sample data clearing completed. Rows removed: '+total+'.'};
}

function clearSampleRowsFromSheet_(sheetName, idFields){
  const rows = rowsAsObjectsWithRow_(sheetName);
  const toDelete = rows.filter(function(r){
    return idFields.some(function(f){ return isSampleValue_(r[f]); });
  }).map(function(r){ return r.__row; });
  deleteRowsByRowNumbers_(sheetName, toDelete);
  return toDelete.length;
}

function appendSampleObject_(sheetName, idField, obj){
  ensureSheet_(sheetName, FM_SHEETS[sheetName] || Object.keys(obj));
  if(findRowObject_(sheetName, idField, obj[idField])) return false;
  appendObject_(sheetName, obj);
  return true;
}

function isSampleValue_(value){
  const s = String(value || '').trim().toUpperCase();
  return s.indexOf('SAMPLE_') === 0 || s.indexOf('TEST_') === 0;
}


function doGet(e){
  try{
    const action = ((e && e.parameter && e.parameter.action) || '').trim();
    if(action === 'ping') return json_({ok:true,message:'Freshly Mart backend connected',version:FM_VERSION});
    if(action === 'settings') return json_({ok:true,settings: rowsAsObjects_('Settings')});
    if(action === 'categories') return json_({ok:true,categories: activeRows_('Categories')});
    if(action === 'banners') return json_({ok:true,banners: activeRows_('Banners')});
    if(action === 'products') return json_({ok:true,products: getLiveProducts_()});
    if(action === 'checkPincode') return json_(checkPincodeResponse_(e.parameter.pincode || e.parameter.Pincode || ''));
    if(action === 'localStores') return json_({ok:true,stores: localStoresByPincode_(e.parameter.pincode || e.parameter.Pincode || '')});
    if(action === 'deliverySlots') return json_({ok:true,slots: deliverySlotsByHub_(e.parameter.HubID || e.parameter.hubId || '')});
    if(action === 'paymentSettings') return json_({ok:true, payment: paymentSettings_()});
    if(action === 'receipt') return json_(getReceiptForCustomer_(e.parameter.OrderID || e.parameter.orderId || '', e.parameter.Phone || e.parameter.phone || ''));
    if(action === 'adminSummary') { requireAdmin_(e.parameter.AdminToken); return json_(adminSummary_()); }
    return json_({ok:true,message:'Freshly Mart backend running',version:FM_VERSION});
  }catch(err){ return json_({ok:false,message:String(err)}); }
}

function doPost(e){
  try{
    const data = parseBody_(e);
    const action = data.action;
    if(!action) return json_({ok:false,message:'Missing action'});
    const routes = {
      saveSeller: saveSeller_, saveHub: saveHub_, saveReferral: saveReferral_, saveContact: saveContact_,
      saveProductSubmission: saveProductSubmission_, saveOrder: saveOrder_, saveReturn: saveReturn_, saveReview: saveReview_,
      updateStock: updateStock_, adminLogin: adminLogin_, approveSeller: approveSeller_, approveProduct: approveProduct_, rejectProduct: rejectProduct_,
      savePaymentProof: savePaymentProof_,
      verifyPayment: function(d){ requireAdmin_(d.AdminToken); return verifyPaymentInternal_(d, 'Admin Dashboard'); },
      generateReceipt: function(d){ requireAdmin_(d.AdminToken); const r = generateReceiptForOrder_(d.OrderID, 'Admin Dashboard'); return {ok:true,message:'Receipt generated for '+d.OrderID+'.', receipt:r}; },
      generatePaymentAutomation: function(d){ requireAdmin_(d.AdminToken); return generateCurrentMonthPaymentAutomation_(false); },
      markSettlementPaid: function(d){ requireAdmin_(d.AdminToken); return markSettlementPaid_(d); },
      addExpense: function(d){ requireAdmin_(d.AdminToken); return addExpense_(d); },
      generateTodayOrderReport: function(d){ requireAdmin_(d.AdminToken); return generateOrderReportForDates_(today_(), today_()); },
      validateBackendData: function(d){ requireAdmin_(d.AdminToken); return validateBackendData_(false); }
    };
    if(!routes[action]) return json_({ok:false,message:'Unknown action: '+action});
    return json_(routes[action](data));
  }catch(err){ return json_({ok:false,message:String(err), stack: err && err.stack}); }
}

function parseBody_(e){
  if(e && e.postData && e.postData.contents){
    try{return JSON.parse(e.postData.contents);}catch(err){}
  }
  return e && e.parameter ? e.parameter : {};
}


/* ----------------------------- Pincode / Hub serviceability ----------------------------- */

function normalizePincode_(v){
  return String(v || '').replace(/\D/g,'').slice(0,6);
}

function deliverySlotsByHub_(hubId){
  if(!hubId) return [];
  return activeRows_('DeliverySlots')
    .filter(function(s){ return String(s.HubID || '') === String(hubId); })
    .map(function(s){ return {
      SlotID:s.SlotID || '',
      HubID:s.HubID || '',
      SlotName:s.SlotName || '',
      StartTime:formatSlotTime_(s.StartTime),
      EndTime:formatSlotTime_(s.EndTime),
      CutOffTime:formatSlotTime_(s.CutOffTime),
      Status:s.Status || ''
    }; });
}

function serviceableHubsForPincode_(pincode){
  const pin = normalizePincode_(pincode);
  if(!isValidPincode_(pin)) return [];
  const hubsById = objectBy_(activeRows_('Hubs'), 'HubID');
  let areas = activeRows_('HubAreas').filter(function(a){ return normalizePincode_(a.Pincode) === pin; });

  // Fallback: if HubAreas is not maintained, use Hubs sheet directly.
  if(!areas.length){
    areas = activeRows_('Hubs')
      .filter(function(h){ return normalizePincode_(h.Pincode) === pin; })
      .map(function(h){ return {
        AreaID:'AUTO_'+(h.HubID || pin), Pincode:pin, AreaName:h.Area || '', City:'', HubID:h.HubID || '', HubName:h.HubName || '', Priority:1,
        PickupAvailable:h.PickupAvailable || 'Yes', HomeDeliveryAvailable:h.HomeDeliveryAvailable || 'Yes', DeliveryCharge:h.DeliveryCharge || 0, Status:h.Status || 'Active'
      }; });
  }

  areas.sort(function(a,b){ return toNumber_(a.Priority || 99) - toNumber_(b.Priority || 99); });
  return areas.map(function(a){
    const hub = hubsById[String(a.HubID || '')] || {};
    const hubId = a.HubID || hub.HubID || '';
    return {
      AreaID:a.AreaID || '', Pincode:pin, AreaName:a.AreaName || hub.Area || '', City:a.City || '',
      HubID:hubId, HubName:a.HubName || hub.HubName || '', PartnerName:hub.PartnerName || hub.Name || '',
      HubPhone:hub.Phone || '', HubWhatsApp:hub.WhatsApp || '', Address:hub.Address || '',
      PickupAvailable:a.PickupAvailable || hub.PickupAvailable || 'Yes',
      HomeDeliveryAvailable:a.HomeDeliveryAvailable || hub.HomeDeliveryAvailable || 'Yes',
      DeliveryCharge:toNumber_(a.DeliveryCharge || hub.DeliveryCharge || 0),
      MinimumOrder:toNumber_(hub.MinimumOrder || 0), CutOffTime:hub.CutOffTime || '',
      Priority:toNumber_(a.Priority || 99), Status:a.Status || hub.Status || 'Active',
      Slots:deliverySlotsByHub_(hubId)
    };
  }).filter(function(h){ return h.HubID && String(h.Status || '').toLowerCase() === 'active'; });
}

function checkPincodeResponse_(pincode){
  const pin = normalizePincode_(pincode);
  if(!isValidPincode_(pin)){
    return {ok:false, serviceable:false, pincode:pin, message:'Please enter a valid 6-digit pincode.'};
  }
  const hubs = serviceableHubsForPincode_(pin);
  if(!hubs.length){
    return {ok:true, serviceable:false, pincode:pin, message:'Freshly Mart is not available for this pincode yet.', hubs:[]};
  }
  return {ok:true, serviceable:true, pincode:pin, message:'Freshly Mart is available for this pincode.', hubs:hubs, defaultHub:hubs[0]};
}

function localStoresByPincode_(pincode){
  const pin = normalizePincode_(pincode);
  return rowsAsObjects_('Sellers')
    .filter(function(s){ return String(s.Status || '').toLowerCase() === 'approved'; })
    .filter(function(s){ return !pin || normalizePincode_(s.Pincode) === pin; })
    .map(function(s){ return {
      SellerID:s.SellerID || '', StoreName:s.BusinessName || '', Category:s.Category || s.BusinessType || '', Area:s.Area || '', Pincode:normalizePincode_(s.Pincode), DeliveryAvailable:'Yes', PickupAvailable:'Yes', Status:s.Status || ''
    }; });
}

/* ----------------------------- Form handlers with backend validation ----------------------------- */

function saveSeller_(d){
  d = d || {};
  d.WhatsApp = String(d.WhatsApp || d.Phone || '').trim();
  d.Area = String(d.Area || d.AreaName || '').trim();
  d.Pincode = normalizePincode_(d.Pincode);

  validateRequired_(d, ['BusinessName','OwnerName','Phone','BusinessType','Category','Area','Pincode'], 'Seller registration');
  validatePhone_(d.Phone, 'Phone');
  if (d.WhatsApp) validatePhone_(d.WhatsApp, 'WhatsApp');
  validatePincode_(d.Pincode);

  const foodSeller = isFoodRelatedSeller_(d);
  d.FoodSeller = foodSeller ? 'Yes' : 'No';
  d.FSSAIRequired = foodSeller ? 'Yes' : 'No';
  d.FSSAIStatus = d.FSSAIStatus || (foodSeller ? (hasFSSAINumber_(d.FSSAINumber) ? 'Provided' : 'Pending') : 'Not Required');

  // Freshly Mart backend rule: GST is mandatory by default for seller approval.
  // Registration is still accepted without GST so admin can review and give controlled relaxation if needed.
  d.GSTRequired = 'Yes';
  d.GSTStatus = d.GSTStatus || (hasGSTNumber_(d.GSTNumber) ? 'Provided' : 'Pending');
  d.GSTVerified = d.GSTVerified || 'No';
  d.ComplianceRelaxation = d.ComplianceRelaxation || 'No';
  d.RelaxationFor = d.RelaxationFor || 'None';
  d.ComplianceRiskLevel = d.ComplianceRiskLevel || '';

  const id = 'SEL' + Utilities.formatDate(new Date(), FM_TIMEZONE, 'yyMMddHHmmss');
  appendObject_('Sellers', Object.assign({}, d, {SellerID:id, DateTime:new Date(), Status:'Pending', LoginCode:id}));
  logActivity_('saveSeller','Public', 'Seller application '+id+' foodSeller='+d.FoodSeller+' gstStatus='+d.GSTStatus+' fssaiStatus='+d.FSSAIStatus);
  return {ok:true,message:'Seller application submitted. GST is mandatory by default and FSSAI is mandatory for food-related sellers before approval unless admin grants relaxation.', SellerID:id, FoodSeller:d.FoodSeller, GSTRequired:'Yes', FSSAIRequired:foodSeller?'Yes':'No'};
}

function saveHub_(d){
  d = d || {};
  d.WhatsApp = String(d.WhatsApp || d.Phone || '').trim();
  d.Area = String(d.Area || d.AreaName || '').trim();
  d.Pincode = normalizePincode_(d.Pincode);

  validateRequired_(d, ['Name','Phone','Area','Pincode','Role'], 'Hub partner application');
  validatePhone_(d.Phone, 'Phone');
  if (d.WhatsApp) validatePhone_(d.WhatsApp, 'WhatsApp');
  validatePincode_(d.Pincode);

  const id = 'HUBAPP' + Utilities.formatDate(new Date(), FM_TIMEZONE, 'yyMMddHHmmss');
  appendObject_('HubApplications', Object.assign({}, d, {HubApplicationID:id, DateTime:new Date(), Status:'Pending'}));
  logActivity_('saveHub','Public', 'Hub application '+id);
  return {ok:true,message:'Hub partner application submitted. Freshly Mart will review and contact you.', HubApplicationID:id};
}

function saveReferral_(d){
  validateRequired_(d, ['ReferrerName','ReferrerPhone','ReferralType','ReferredName','ReferredPhone'], 'Referral');
  validatePhone_(d.ReferrerPhone, 'ReferrerPhone');
  validatePhone_(d.ReferredPhone, 'ReferredPhone');
  const id = 'REF' + Utilities.formatDate(new Date(), FM_TIMEZONE, 'yyMMddHHmmss');
  appendObject_('Referrals', Object.assign({}, d, {ReferralID:id, DateTime:new Date(), RewardPoints:0, Status:'Pending'}));
  logActivity_('saveReferral','Public', 'Referral '+id);
  return {ok:true,message:'Referral submitted. Reward points will be approved after successful conversion.', ReferralID:id};
}

function saveContact_(d){
  validateRequired_(d, ['Name','Phone','Message'], 'Contact form');
  validatePhone_(d.Phone, 'Phone');
  const id = 'CON' + Utilities.formatDate(new Date(), FM_TIMEZONE, 'yyMMddHHmmss');
  appendObject_('Contacts', Object.assign({}, d, {ContactID:id, DateTime:new Date(), Status:'New'}));
  logActivity_('saveContact','Public', 'Contact '+id);
  return {ok:true,message:'Message received. Freshly Mart support will contact you.', ContactID:id};
}

function saveProductSubmission_(d){
  validateRequired_(d, ['SellerID','ProductName','Category','Unit','MRP','SellingPrice','Stock','Description'], 'Product submission');
  validatePositiveNumber_(d.SellingPrice, 'SellingPrice');
  validateNonNegativeNumber_(d.Stock, 'Stock');
  const seller = findRowObject_('Sellers','SellerID',d.SellerID);
  if(!seller) throw new Error('SellerID not found. Seller must register first.');
  if(String(seller.Status).toLowerCase() !== 'approved') throw new Error('Seller is not approved yet. Products can be submitted only after Freshly Mart seller approval.');

  const foodRelated = isFoodRelatedProduct_(d, seller);
  d.FoodRelated = foodRelated ? 'Yes' : 'No';
  d.FSSAIRequired = foodRelated ? 'Yes' : 'No';
  d.FSSAIValidated = foodRelated && sellerFSSAIIsAcceptable_(seller) ? 'Yes' : (foodRelated ? 'No' : 'Not Required');
  d.GSTApplicable = d.GSTApplicable || 'Yes';
  d.TaxInclusivePrice = d.TaxInclusivePrice || 'Yes';
  d.GSTValidated = sellerGSTIsAcceptable_(seller) ? 'Yes' : 'No';
  d.ComplianceRelaxation = d.ComplianceRelaxation || 'No';
  d.RelaxationFor = d.RelaxationFor || 'None';

  const id = 'SUB' + Utilities.formatDate(new Date(), FM_TIMEZONE, 'yyMMddHHmmss');
  appendObject_('ProductSubmissions', Object.assign({}, d, {SubmissionID:id, DateTime:new Date(), ApprovalStatus:'Pending'}));
  logActivity_('saveProductSubmission','Seller', 'Product submission '+id+' foodRelated='+d.FoodRelated+' gstValidated='+d.GSTValidated+' fssaiValidated='+d.FSSAIValidated);
  const complianceNote = (d.GSTValidated !== 'Yes' ? ' GST must be completed or relaxed before approval.' : '') + (foodRelated && d.FSSAIValidated !== 'Yes' ? ' FSSAI must be completed or relaxed before approval.' : '');
  return {ok:true,message:'Product submitted for Freshly Mart approval.' + complianceNote, SubmissionID:id, FoodRelated:d.FoodRelated, GSTValidated:d.GSTValidated, FSSAIRequired:d.FSSAIRequired, FSSAIValidated:d.FSSAIValidated};
}


function normalizePaymentMode_(mode, deliveryOption){
  const raw = String(mode || '').trim();
  const lower = raw.toLowerCase();
  let normalized = raw;
  if(lower === 'upi' || lower === 'online upi' || lower === 'pay online by upi') normalized = 'UPI Online';
  if(lower === 'upi delivery' || lower === 'upi on delivery' || lower === 'pay by upi on delivery') normalized = 'UPI on Delivery';
  if(lower === 'pay at hub' || lower === 'hub pickup payment' || lower === 'upi at hub') normalized = 'UPI at Hub Pickup';
  if(FM_PAYMENT_MODES.indexOf(normalized) === -1){
    throw new Error('Invalid payment mode. Freshly Mart allows only UPI Online, UPI on Delivery, or UPI at Hub Pickup. Cash/COD is not allowed.');
  }
  const isPickup = String(deliveryOption || '').toLowerCase().indexOf('pickup') !== -1;
  if(isPickup && normalized === 'UPI on Delivery'){
    throw new Error('For pickup orders, choose UPI Online or UPI at Hub Pickup.');
  }
  if(!isPickup && normalized === 'UPI at Hub Pickup'){
    throw new Error('UPI at Hub Pickup is only for pickup orders. For home delivery choose UPI Online or UPI on Delivery.');
  }
  return normalized;
}

function initialPaymentStatusForMode_(mode, upiReference){
  if(mode === 'UPI Online') return 'UPI Pending Verification';
  if(mode === 'UPI on Delivery') return 'UPI Pending at Delivery';
  if(mode === 'UPI at Hub Pickup') return 'UPI Pending at Hub';
  return 'UPI Pending';
}

function isPaidStatus_(status){
  return String(status || '').toLowerCase() === 'paid to freshly mart';
}

function saveOrder_(d){
  validateRequired_(d, ['CustomerName','Phone','Address','Pincode','GrandTotal'], 'Checkout order');
  validatePhone_(d.Phone, 'Phone');
  validatePincode_(d.Pincode);

  const service = checkPincodeResponse_(d.Pincode);
  if(!service.ok || !service.serviceable){
    throw new Error('Freshly Mart is not available for this pincode yet. Please use Join Freshly / Contact page to register your area.');
  }

  const requestedHub = String(d.HubID || '').trim();
  let selectedHub = null;
  if(requestedHub){
    selectedHub = service.hubs.find(function(h){ return String(h.HubID) === requestedHub; });
  }
  if(!selectedHub) selectedHub = service.hubs[0];

  const deliveryOption = String(d.DeliveryOption || 'Home Delivery').trim();
  const paymentMode = normalizePaymentMode_(d.PaymentMode || 'UPI Online', deliveryOption);
  d.PaymentMode = paymentMode;
  const isPickup = deliveryOption.toLowerCase().indexOf('pickup') !== -1;
  if(!isPickup && String(selectedHub.HomeDeliveryAvailable || '').toLowerCase() !== 'yes'){
    throw new Error('Home delivery is not available for this pincode/hub. Please choose Pickup from Hub.');
  }

  const productTotal = toNumber_(d.ProductTotal || d.GrandTotal);
  const deliveryCharge = isPickup ? 0 : toNumber_(selectedHub.DeliveryCharge || 0);
  d.HubID = selectedHub.HubID || '';
  d.HubName = selectedHub.HubName || '';
  d.Area = d.Area || selectedHub.AreaName || selectedHub.Area || '';
  d.DeliveryCharge = deliveryCharge;
  d.ProductTotal = productTotal;
  d.GrandTotal = productTotal + deliveryCharge;
  if(!d.DeliverySlot){
    const slots = selectedHub.Slots || [];
    d.DeliverySlot = slots.length ? slots[0].SlotName : '';
  }

  const id = 'FM' + Utilities.formatDate(new Date(), FM_TIMEZONE, 'yyMMddHHmmss');
  const paymentStatus = initialPaymentStatusForMode_(d.PaymentMode, d.UPIReference);
  appendObject_('Orders', Object.assign({}, d, {OrderID:id, DateTime:new Date(), PaymentStatus:paymentStatus, OrderStatus:'New'}));
  appendObject_('Payments', {PaymentID:'PAY'+idStamp_(), DateTime:new Date(), OrderID:id, CustomerName:d.CustomerName, Amount:d.GrandTotal, PaymentMode:d.PaymentMode, PaymentStatus:paymentStatus, CollectedBy:'Freshly Mart UPI', CollectedDate:'', UPIReference:d.UPIReference || '', Remarks:'No cash handling. Payment must be made only to Freshly Mart UPI / QR.'});
  let items = [];
  try{ items = JSON.parse(d.Items || '[]'); }catch(err){ items = []; }
  items.forEach(function(it,idx){
    appendObject_('OrderItems', {OrderItemID:id+'-'+(idx+1), OrderID:id, ProductID:it.ProductID, ProductName:it.ProductName, Quantity:it.qty, Unit:it.Unit||'', SellingPrice:it.SellingPrice, CostPrice:it.CostPrice||'', Total:Number(it.SellingPrice||0)*Number(it.qty||1), SellerID:it.SellerID||'', SupplierID:it.SupplierID||'', HubID:d.HubID || it.HubID || '', Status:'New'});
  });
  logActivity_('saveOrder','Public', 'Order '+id+' assigned to '+d.HubID+' for pincode '+d.Pincode);
  return {ok:true,message:'Order saved successfully and assigned to '+(d.HubName || 'Freshly Hub')+'.', OrderID:id, HubID:d.HubID, HubName:d.HubName, DeliveryCharge:d.DeliveryCharge, GrandTotal:d.GrandTotal, DeliverySlot:d.DeliverySlot};
}

function saveReturn_(d){
  validateRequired_(d, ['OrderID','ProductName','CustomerName','Phone','Reason'], 'Return request');
  validatePhone_(d.Phone, 'Phone');
  const id = 'RET' + Utilities.formatDate(new Date(), FM_TIMEZONE, 'yyMMddHHmmss');
  appendObject_('Returns', Object.assign({}, d, {ReturnID:id, DateTime:new Date(), RequestedDate:new Date(), ReturnStatus:'Return Requested'}));
  logActivity_('saveReturn','Public', 'Return '+id);
  return {ok:true,message:'Return/refund request submitted for review.', ReturnID:id};
}

function saveReview_(d){
  validateRequired_(d, ['OrderID','ProductID','CustomerName','Phone','ProductRating','SellerRating','DeliveryRating'], 'Review');
  validatePhone_(d.Phone, 'Phone');
  validateRating_(d.ProductRating, 'ProductRating');
  validateRating_(d.SellerRating, 'SellerRating');
  validateRating_(d.DeliveryRating, 'DeliveryRating');
  const id = 'REV' + Utilities.formatDate(new Date(), FM_TIMEZONE, 'yyMMddHHmmss');
  const verified = orderMatchesCustomer_(d.OrderID, d.Phone) ? 'Yes' : 'Pending Verification';
  appendObject_('Reviews', Object.assign({}, d, {ReviewID:id, DateTime:new Date(), VerifiedPurchase:verified, Status:'Pending'}));
  logActivity_('saveReview','Public', 'Review '+id);
  return {ok:true,message:'Review submitted. It will appear after verified purchase and moderation.', ReviewID:id};
}

function updateStock_(d){
  validateRequired_(d, ['SellerID','ProductID','NewStock'], 'Stock update');
  validateNonNegativeNumber_(d.NewStock, 'NewStock');
  const sh = sheet_('Products');
  const values = getData_(sh);
  const headers = values[0] || [];
  const productIdCol = headers.indexOf('ProductID');
  const stockCol = headers.indexOf('Stock');
  const statusCol = headers.indexOf('StockStatus');
  let oldStock = '';
  let found = false;
  for(let r=1;r<values.length;r++){
    if(String(values[r][productIdCol]) === String(d.ProductID)){
      oldStock = values[r][stockCol];
      sh.getRange(r+1, stockCol+1).setValue(d.NewStock);
      sh.getRange(r+1, statusCol+1).setValue(d.StockStatus || (Number(d.NewStock)>0 ? 'Live' : 'Out of Stock'));
      found = true;
      break;
    }
  }
  if(!found) throw new Error('ProductID not found: '+d.ProductID);
  appendObject_('InventoryUpdates', {UpdateID:'INV'+Utilities.formatDate(new Date(), FM_TIMEZONE, 'yyMMddHHmmss'), DateTime:new Date(), SellerID:d.SellerID, ProductID:d.ProductID, OldStock:oldStock, NewStock:d.NewStock, StockStatus:d.StockStatus || '', UpdatedBy:'Seller', Remarks:d.Remarks});
  logActivity_('updateStock','Seller', 'Product '+d.ProductID+' stock '+oldStock+' -> '+d.NewStock);
  return {ok:true,message:'Stock update submitted and recorded.'};
}

/* ----------------------------- Admin actions ----------------------------- */

function adminLogin_(d){
  const expected = String(getSetting_('AdminCode') || 'FRESHLYMARTADMIN_CHANGE_ME').trim();
  const supplied = String(d.AdminCode || '').trim();
  if(!supplied || supplied !== expected) return {ok:false,message:'Invalid admin code.'};
  if(expected === 'FRESHLYMARTADMIN_CHANGE_ME') return {ok:false,message:'Please change AdminCode in Settings sheet before using admin dashboard.'};
  const token = Utilities.getUuid() + Utilities.getUuid();
  PropertiesService.getScriptProperties().setProperty('FM_ADMIN_TOKEN', token);
  PropertiesService.getScriptProperties().setProperty('FM_ADMIN_TOKEN_TIME', String(Date.now()));
  logActivity_('adminLogin','Admin','Admin token issued');
  return {ok:true,message:'Admin login successful.', AdminToken:token};
}

function requireAdmin_(token){
  const saved = PropertiesService.getScriptProperties().getProperty('FM_ADMIN_TOKEN');
  const savedTime = Number(PropertiesService.getScriptProperties().getProperty('FM_ADMIN_TOKEN_TIME') || 0);
  const ageHours = (Date.now() - savedTime) / (1000*60*60);
  if(!token || !saved || token !== saved || ageHours > 12){ throw new Error('Admin authentication required. Please login again.'); }
  return true;
}

function approveSeller_(d){
  requireAdmin_(d.AdminToken);
  const seller = findRowObject_('Sellers','SellerID',d.SellerID);
  if(!seller) return {ok:false,message:'Seller not found.'};
  const foodSeller = isFoodRelatedSeller_(seller);
  const complianceUpdates = complianceUpdatesFromAdminRequest_(d, seller);
  const sellerForValidation = Object.assign({}, seller, complianceUpdates, {FoodSeller: foodSeller ? 'Yes' : 'No', FSSAIRequired: foodSeller ? 'Yes' : 'No', GSTRequired:'Yes'});
  validateSellerGSTForApproval_(sellerForValidation);
  validateSellerFSSAIForApproval_(sellerForValidation);
  const updates = Object.assign({}, complianceUpdates, {
    Status:'Approved',
    FoodSeller: foodSeller ? 'Yes' : 'No',
    GSTRequired:'Yes',
    GSTStatus: sellerForValidation.GSTStatus || (hasGSTNumber_(sellerForValidation.GSTNumber) ? 'Provided' : 'Pending'),
    GSTVerified: sellerForValidation.GSTVerified || (hasGSTNumber_(sellerForValidation.GSTNumber) ? 'No' : ''),
    FSSAIRequired: foodSeller ? 'Yes' : 'No',
    FSSAIStatus: sellerForValidation.FSSAIStatus || (foodSeller ? 'Provided' : 'Not Required'),
    AdminRemarks:d.AdminRemarks || complianceApprovalRemark_(sellerForValidation, foodSeller)
  });
  updateRowById_('Sellers','SellerID',d.SellerID,updates);
  logActivity_('approveSeller','Admin','Seller '+d.SellerID+' approved. GSTStatus='+updates.GSTStatus+' FoodSeller='+updates.FoodSeller+' FSSAIStatus='+updates.FSSAIStatus+' Relaxation='+updates.ComplianceRelaxation);
  return {ok:true,message:'Seller approved. Seller can use SellerID/LoginCode to submit products.'};
}

function approveProduct_(d){
  requireAdmin_(d.AdminToken);
  const submission = findRowObject_('ProductSubmissions','SubmissionID',d.SubmissionID);
  if(!submission) return {ok:false,message:'Submission not found'};
  const seller = findRowObject_('Sellers','SellerID',submission.SellerID) || {};
  if(!seller.SellerID) return {ok:false,message:'Seller not found for this submission.'};
  if(String(seller.Status || '').toLowerCase() !== 'approved') return {ok:false,message:'Product approval blocked. Seller must be approved first.'};
  const foodRelated = isFoodRelatedProduct_(submission, seller);
  validateSellerGSTForProductApproval_(seller, submission);
  if(foodRelated){ validateSellerFSSAIForProductApproval_(seller, submission); }
  const complianceUpdates = complianceUpdatesFromAdminRequest_(d, submission);
  updateRowById_('ProductSubmissions','SubmissionID',d.SubmissionID,Object.assign({}, complianceUpdates, {ApprovalStatus:'Approved', FoodRelated:foodRelated?'Yes':'No', FSSAIRequired:foodRelated?'Yes':'No', FSSAIValidated:foodRelated?'Yes':'Not Required', GSTApplicable:submission.GSTApplicable || 'Yes', GSTValidated:'Yes', AdminRemarks:d.AdminRemarks || (foodRelated ? 'Approved. Seller GST/FSSAI compliance validated.' : 'Approved. Seller GST compliance validated.')}));
  const productId = 'P' + Utilities.formatDate(new Date(), FM_TIMEZONE, 'yyMMddHHmmss');
  const selling = Number(submission.SellingPrice || 0);
  const cost = Number(submission.CostPrice || 0);
  appendObject_('Products', {
    ProductID: productId,
    ProductName: submission.ProductName,
    Category: normalizeCategory_(submission.Category),
    SubCategory: submission.SubCategory,
    Brand: submission.Brand,
    Unit: submission.Unit,
    MRP: submission.MRP,
    SellingPrice: selling,
    CostPrice: submission.CostPrice || '',
    Margin: cost ? selling - cost : '',
    ListingMode: submission.ListingMode,
    DisplaySellerName: submission.DisplaySellerName || seller.BusinessName || submission.SellerID || 'Partner Store',
    SellerID: submission.SellerID,
    ImageURL: submission.ImageURL,
    Description: submission.Description,
    Stock: submission.Stock,
    StockStatus: Number(submission.Stock)>0?'Live':'Out of Stock',
    Status:'Live',
    Featured:'No',
    Rating:'',
    Reviews:0,
    FoodRelated: foodRelated ? 'Yes' : 'No',
    FSSAIRequired: foodRelated ? 'Yes' : 'No',
    SellerFSSAINumber: foodRelated ? (seller.FSSAINumber || '') : '',
    FSSAIValidated: foodRelated ? 'Yes' : 'Not Required',
    GSTApplicable: submission.GSTApplicable || 'Yes',
    GSTPercent: submission.GSTPercent || '',
    HSNCode: submission.HSNCode || '',
    TaxInclusivePrice: submission.TaxInclusivePrice || 'Yes',
    GSTValidated: 'Yes',
    ComplianceRelaxation: seller.ComplianceRelaxation || '',
    RelaxationFor: seller.RelaxationFor || '',
    RelaxationReason: seller.RelaxationReason || '',
    RelaxationValidUntil: seller.RelaxationValidUntil || '',
    RelaxationApprovedBy: seller.RelaxationApprovedBy || '',
    ComplianceRiskLevel: seller.ComplianceRiskLevel || ''
  });
  logActivity_('approveProduct','Admin','Submission '+d.SubmissionID+' approved as '+productId);
  return {ok:true,message:'Product approved and moved live to Products sheet.', ProductID:productId};
}

function rejectProduct_(d){
  requireAdmin_(d.AdminToken);
  updateRowById_('ProductSubmissions','SubmissionID',d.SubmissionID,{ApprovalStatus:'Rejected', AdminRemarks:d.AdminRemarks || 'Rejected'});
  logActivity_('rejectProduct','Admin','Submission '+d.SubmissionID+' rejected');
  return {ok:true,message:'Product submission rejected.'};
}

function approveAllPendingProducts(){
  const rows = rowsAsObjects_('ProductSubmissions').filter(function(r){ return String(r.ApprovalStatus).toLowerCase()==='pending'; });
  const token = PropertiesService.getScriptProperties().getProperty('FM_ADMIN_TOKEN');
  let approved = 0, blocked = 0;
  rows.forEach(function(r){
    if(token){
      try{
        const res = approveProduct_({SubmissionID:r.SubmissionID, AdminRemarks:'Bulk approved from Google Sheet menu', AdminToken: token});
        if(res && res.ok) approved++; else blocked++;
      }catch(err){
        blocked++;
        logActivity_('approveAllPendingProductsBlocked','Admin','Submission '+r.SubmissionID+' blocked: '+String(err.message || err));
      }
    }
  });
  safeUiAlert_('Pending products processed. Approved: '+approved+'. Blocked: '+blocked+'. Food-related products require seller FSSAI before approval. If none were approved, login to admin first from the website to create an admin token.');
}

function adminSummary_(){
  const sellers = rowsAsObjects_('Sellers').filter(function(r){ return String(r.Status).toLowerCase()==='pending'; }).slice(0,20);
  const products = rowsAsObjects_('ProductSubmissions').filter(function(r){ return String(r.ApprovalStatus).toLowerCase()==='pending'; }).slice(0,20);
  const returns = rowsAsObjects_('Returns').slice(-20).reverse();
  const reviews = rowsAsObjects_('Reviews').filter(function(r){ return String(r.Status).toLowerCase()==='pending'; }).slice(0,20);
  return {ok:true, counts:{PendingSellers:sellers.length, PendingProducts:products.length, Returns:returns.length, Reviews:reviews.length}, pendingSellers:sellers, pendingProducts:products, returns:returns, reviews:reviews};
}

/* ----------------------------- Delivery sheets ----------------------------- */

function generateTodaysDeliverySheets(){
  const result = generateDeliverySheetsForDate_(today_());
  safeUiAlert_(result.message);
}

function generateDeliverySheetsByDatePrompt(){
  const ui = SpreadsheetApp.getUi();
  const res = ui.prompt('Generate Delivery Sheets', 'Enter order date in YYYY-MM-DD format:', ui.ButtonSet.OK_CANCEL);
  if(res.getSelectedButton() !== ui.Button.OK) return;
  const dateStr = String(res.getResponseText() || '').trim();
  if(!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)){ ui.alert('Invalid date. Use YYYY-MM-DD.'); return; }
  const result = generateDeliverySheetsForDate_(dateStr);
  ui.alert(result.message);
}

function generateDeliverySheetsForDate_(dateStr){
  const ss = SpreadsheetApp.getActive();
  ensureSheet_('DeliverySheetsIndex', FM_SHEETS.DeliverySheetsIndex);
  const orders = rowsAsObjects_('Orders').filter(function(o){
    return dateKey_(o.DateTime) === dateStr && ['delivered','cancelled','refunded'].indexOf(String(o.OrderStatus || '').toLowerCase()) === -1;
  });
  if(!orders.length) return {ok:true,message:'No active orders found for '+dateStr+'.'};

  const grouped = {};
  orders.forEach(function(o){
    const key = String(o.HubID || 'NO_HUB').trim() || 'NO_HUB';
    if(!grouped[key]) grouped[key] = {hubName: String(o.HubName || 'Unassigned Hub'), rows: []};
    grouped[key].rows.push(o);
  });

  let sheetCount = 0;
  Object.keys(grouped).forEach(function(hubId){
    const safeName = sanitizeSheetName_('DELIVERY_'+dateStr.replace(/-/g,'')+'_'+hubId).substring(0,99);
    let sh = ss.getSheetByName(safeName);
    if(sh) ss.deleteSheet(sh);
    sh = ss.insertSheet(safeName);
    const headers = ['Sl No','OrderID','CustomerName','Phone','Address','Area','Pincode','Items','ProductTotal','DeliveryCharge','GrandTotal','PaymentMode','PaymentStatus','UPIReference','Payment Instruction','DeliveryOption','DeliverySlot','OrderStatus','Notes','Customer Signature'];
    const rows = grouped[hubId].rows.map(function(o,idx){
      return [idx+1,o.OrderID,o.CustomerName,o.Phone,o.Address,o.Area,o.Pincode,formatItemsForPrint_(o.Items),toNumber_(o.ProductTotal),toNumber_(o.DeliveryCharge),toNumber_(o.GrandTotal),o.PaymentMode,o.PaymentStatus,o.UPIReference || '', 'NO CASH. Customer must pay only to Freshly Mart UPI / QR before handover.', o.DeliveryOption,o.DeliverySlot,o.OrderStatus,o.Notes,''];
    });
    sh.getRange(1,1,1,headers.length).setValues([headers]);
    if(rows.length) sh.getRange(2,1,rows.length,headers.length).setValues(rows);
    sh.getRange(1,1,1,headers.length).setFontWeight('bold').setBackground('#0b7a3b').setFontColor('#ffffff');
    sh.setFrozenRows(1);
    sh.getDataRange().setWrap(true).setVerticalAlignment('top');
    sh.autoResizeColumns(1, headers.length);
    sh.setColumnWidth(8, 320);
    sh.setColumnWidth(5, 260);
    sh.getRange(2,9,Math.max(rows.length,1),3).setNumberFormat('₹#,##0.00');
    sh.getRange(1,1,sh.getLastRow(),headers.length).setBorder(true,true,true,true,true,true);

    appendObject_('DeliverySheetsIndex', {SheetName:safeName, Date:dateStr, HubID:hubId, HubName:grouped[hubId].hubName, OrderCount:rows.length, GrandTotal:sum_(rows.map(function(r){return r[10];})), GeneratedAt:new Date(), GeneratedBy:'Freshly Mart Backend', Status:'Generated'});
    sheetCount++;
  });
  logActivity_('generateDeliverySheets','Admin','Date '+dateStr+', sheets '+sheetCount);
  return {ok:true,message:'Generated '+sheetCount+' hub-wise delivery sheet(s) for '+dateStr+'.'};
}

function clearGeneratedDeliverySheetsPrompt(){
  const ui = SpreadsheetApp.getUi();
  const res = ui.alert('Clear Generated Delivery Sheets', 'This will delete sheets starting with DELIVERY_. Master data will not be touched. Continue?', ui.ButtonSet.YES_NO);
  if(res !== ui.Button.YES) return;
  const deleted = clearGeneratedDeliverySheets_();
  ui.alert('Deleted '+deleted+' generated delivery sheet(s).');
}

function clearGeneratedDeliverySheets_(){
  const ss = SpreadsheetApp.getActive();
  const sheets = ss.getSheets();
  let count = 0;
  sheets.forEach(function(sh){
    const name = sh.getName();
    if(/^DELIVERY_/.test(name)){
      ss.deleteSheet(sh);
      count++;
    }
  });
  appendObject_('ClearLog', {ClearID:'CLR'+idStamp_(), DateTime:new Date(), Action:'ClearGeneratedDeliverySheets', SheetName:'DELIVERY_*', RowsAffected:count, DoneBy:'Admin', Remarks:'Generated delivery sheets deleted'});
  logActivity_('clearGeneratedDeliverySheets','Admin','Deleted '+count+' generated sheets');
  return count;
}

/* ----------------------------- Reports ----------------------------- */

function generateTodayOrderReport(){
  const result = generateOrderReportForDates_(today_(), today_());
  safeUiAlert_(result.message);
}

function generateDateRangeOrderReportPrompt(){
  const ui = SpreadsheetApp.getUi();
  const fromRes = ui.prompt('Order Report', 'Enter START date in YYYY-MM-DD:', ui.ButtonSet.OK_CANCEL);
  if(fromRes.getSelectedButton() !== ui.Button.OK) return;
  const toRes = ui.prompt('Order Report', 'Enter END date in YYYY-MM-DD:', ui.ButtonSet.OK_CANCEL);
  if(toRes.getSelectedButton() !== ui.Button.OK) return;
  const from = String(fromRes.getResponseText() || '').trim();
  const to = String(toRes.getResponseText() || '').trim();
  if(!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)){ ui.alert('Invalid date. Use YYYY-MM-DD.'); return; }
  const result = generateOrderReportForDates_(from, to);
  ui.alert(result.message);
}

function generateOrderReportForDates_(startDate, endDate){
  const orders = rowsAsObjects_('Orders').filter(function(o){ const d = dateKey_(o.DateTime); return d >= startDate && d <= endDate; });
  const delivered = orders.filter(function(o){ return String(o.OrderStatus).toLowerCase() === 'delivered'; }).length;
  const cancelled = orders.filter(function(o){ return String(o.OrderStatus).toLowerCase() === 'cancelled'; }).length;
  const productTotal = sum_(orders.map(function(o){ return toNumber_(o.ProductTotal); }));
  const deliveryTotal = sum_(orders.map(function(o){ return toNumber_(o.DeliveryCharge); }));
  const grandTotal = sum_(orders.map(function(o){ return toNumber_(o.GrandTotal); }));
  const upiOnline = sum_(orders.filter(function(o){ return String(o.PaymentMode) === 'UPI Online'; }).map(function(o){ return toNumber_(o.GrandTotal); }));
  const upiDelivery = sum_(orders.filter(function(o){ return String(o.PaymentMode) === 'UPI on Delivery'; }).map(function(o){ return toNumber_(o.GrandTotal); }));
  const upiHub = sum_(orders.filter(function(o){ return String(o.PaymentMode) === 'UPI at Hub Pickup'; }).map(function(o){ return toNumber_(o.GrandTotal); }));
  const pending = sum_(orders.filter(function(o){ return !isPaidStatus_(o.PaymentStatus); }).map(function(o){ return toNumber_(o.GrandTotal); }));
  appendObject_('DailyOrderReports', {ReportID:'RPT'+idStamp_(), ReportDate:startDate === endDate ? startDate : startDate+' to '+endDate, GeneratedAt:new Date(), TotalOrders:orders.length, DeliveredOrders:delivered, CancelledOrders:cancelled, ProductTotal:productTotal, DeliveryTotal:deliveryTotal, GrandTotal:grandTotal, UPIOnlineAmount:upiOnline, UPIOnDeliveryAmount:upiDelivery, UPIAtHubPickupAmount:upiHub, PendingPaymentAmount:pending, Remarks:'Generated from Orders sheet. All payment modes are Freshly Mart UPI only.'});
  logActivity_('generateOrderReport','Admin',startDate+' to '+endDate+', orders '+orders.length);
  return {ok:true,message:'Order report generated for '+startDate+' to '+endDate+'. Total orders: '+orders.length+'.'};
}

function generateCurrentMonthSellerStatements(){
  const range = currentMonthRange_();
  const result = generateSellerStatementsForDates_(range.start, range.end);
  safeUiAlert_(result.message);
}

function generateSellerStatementsForDates_(startDate, endDate){
  const ordersMap = objectBy_(rowsAsObjects_('Orders'), 'OrderID');
  const sellersMap = objectBy_(rowsAsObjects_('Sellers'), 'SellerID');
  const items = rowsAsObjects_('OrderItems').filter(function(it){
    const order = ordersMap[it.OrderID];
    if(!order) return false;
    const d = dateKey_(order.DateTime);
    return d >= startDate && d <= endDate && ['delivered','paid'].indexOf(String(order.OrderStatus || '').toLowerCase()) !== -1;
  });
  const grouped = {};
  items.forEach(function(it){
    const sellerId = String(it.SellerID || 'FRESHLY_MART').trim() || 'FRESHLY_MART';
    if(!grouped[sellerId]) grouped[sellerId] = {orders:{}, gross:0};
    grouped[sellerId].orders[it.OrderID] = true;
    grouped[sellerId].gross += toNumber_(it.Total);
  });
  let count = 0;
  Object.keys(grouped).forEach(function(sellerId){
    const seller = sellersMap[sellerId] || {};
    const commissionPercent = toNumber_(seller.CommissionPercent || getSetting_('DefaultSellerCommissionPercent') || 10);
    const gross = grouped[sellerId].gross;
    const commission = gross * commissionPercent / 100;
    const net = gross - commission;
    appendObject_('SellerStatements', {StatementID:'SST'+idStamp_()+count, PeriodStart:startDate, PeriodEnd:endDate, SellerID:sellerId, SellerName:seller.BusinessName || sellerId, Orders:Object.keys(grouped[sellerId].orders).length, GrossSales:gross, CommissionPercent:commissionPercent, CommissionAmount:commission, Deductions:0, NetPayable:net, GeneratedAt:new Date(), SettlementStatus:'Pending', Remarks:'Generated monthly seller statement'});
    count++;
  });
  logActivity_('generateSellerStatements','Admin',startDate+' to '+endDate+', sellers '+count);
  return {ok:true,message:'Generated '+count+' seller statement(s) for '+startDate+' to '+endDate+'.'};
}

function generateCurrentMonthHubStatements(){
  const range = currentMonthRange_();
  const result = generateHubStatementsForDates_(range.start, range.end);
  safeUiAlert_(result.message);
}

function generateHubStatementsForDates_(startDate, endDate){
  const orders = rowsAsObjects_('Orders').filter(function(o){
    const d = dateKey_(o.DateTime);
    return d >= startDate && d <= endDate && String(o.OrderStatus || '').toLowerCase() === 'delivered';
  });
  const grouped = {};
  orders.forEach(function(o){
    const hubId = String(o.HubID || 'NO_HUB').trim() || 'NO_HUB';
    if(!grouped[hubId]) grouped[hubId] = {hubName:o.HubName || hubId, orders:0, delivery:0};
    grouped[hubId].orders++;
    grouped[hubId].delivery += toNumber_(o.DeliveryCharge);
  });
  const defaultHubCommission = toNumber_(getSetting_('DefaultHubCommissionPerOrder') || 20);
  let count = 0;
  Object.keys(grouped).forEach(function(hubId){
    const g = grouped[hubId];
    const commission = g.orders * defaultHubCommission;
    appendObject_('HubStatements', {StatementID:'HST'+idStamp_()+count, PeriodStart:startDate, PeriodEnd:endDate, HubID:hubId, HubName:g.hubName, Orders:g.orders, DeliveryChargeTotal:g.delivery, HubCommission:commission, Deductions:0, NetPayable:commission, GeneratedAt:new Date(), SettlementStatus:'Pending', Remarks:'Generated monthly hub statement'});
    count++;
  });
  logActivity_('generateHubStatements','Admin',startDate+' to '+endDate+', hubs '+count);
  return {ok:true,message:'Generated '+count+' hub statement(s) for '+startDate+' to '+endDate+'.'};
}

function generateCurrentMonthCustomerStatements(){
  const range = currentMonthRange_();
  const result = generateCustomerStatementsForDates_(range.start, range.end);
  safeUiAlert_(result.message);
}

function generateCustomerStatementsForDates_(startDate, endDate){
  const orders = rowsAsObjects_('Orders').filter(function(o){ const d = dateKey_(o.DateTime); return d >= startDate && d <= endDate; });
  const grouped = {};
  orders.forEach(function(o){
    const phone = cleanPhone_(o.Phone || 'NO_PHONE') || 'NO_PHONE';
    if(!grouped[phone]) grouped[phone] = {name:o.CustomerName || '', orders:0, product:0, delivery:0, grand:0};
    grouped[phone].orders++;
    grouped[phone].product += toNumber_(o.ProductTotal);
    grouped[phone].delivery += toNumber_(o.DeliveryCharge);
    grouped[phone].grand += toNumber_(o.GrandTotal);
  });
  let count = 0;
  Object.keys(grouped).forEach(function(phone){
    const g = grouped[phone];
    appendObject_('CustomerStatements', {StatementID:'CST'+idStamp_()+count, PeriodStart:startDate, PeriodEnd:endDate, CustomerPhone:phone, CustomerName:g.name, Orders:g.orders, TotalPurchase:g.product, TotalDeliveryCharge:g.delivery, GrandTotal:g.grand, GeneratedAt:new Date(), Remarks:'Generated customer statement'});
    count++;
  });
  logActivity_('generateCustomerStatements','Admin',startDate+' to '+endDate+', customers '+count);
  return {ok:true,message:'Generated '+count+' customer statement(s) for '+startDate+' to '+endDate+'.'};
}

function refreshRatingsAndPerformance(){
  refreshProductRatingSummary_();
  refreshSellerPerformance_();
  refreshHubPerformance_();
  safeUiAlert_('Product ratings, seller performance and hub performance refreshed.');
}

function refreshProductRatingSummary_(){
  clearSheetData_('ProductRatingSummary');
  const reviews = rowsAsObjects_('Reviews').filter(function(r){ return String(r.Status).toLowerCase() === 'published' || String(r.VerifiedPurchase).toLowerCase() === 'yes'; });
  const products = objectBy_(rowsAsObjects_('Products'), 'ProductID');
  const grouped = {};
  reviews.forEach(function(r){
    const id = r.ProductID;
    if(!id) return;
    if(!grouped[id]) grouped[id] = {total:0,sum:0,stars:{1:0,2:0,3:0,4:0,5:0}};
    const rating = Math.max(1, Math.min(5, Math.round(toNumber_(r.ProductRating))));
    grouped[id].total++;
    grouped[id].sum += rating;
    grouped[id].stars[rating]++;
  });
  Object.keys(grouped).forEach(function(id){
    const g = grouped[id];
    appendObject_('ProductRatingSummary', {ProductID:id, ProductName:(products[id] && products[id].ProductName) || id, TotalReviews:g.total, AverageRating:g.total ? (g.sum/g.total).toFixed(2) : 0, FiveStar:g.stars[5], FourStar:g.stars[4], ThreeStar:g.stars[3], TwoStar:g.stars[2], OneStar:g.stars[1], LastUpdated:new Date()});
  });
}

function refreshSellerPerformance_(){
  clearSheetData_('SellerPerformance');
  const items = rowsAsObjects_('OrderItems');
  const returns = rowsAsObjects_('Returns');
  const reviews = rowsAsObjects_('Reviews');
  const sellers = objectBy_(rowsAsObjects_('Sellers'), 'SellerID');
  const grouped = {};
  items.forEach(function(it){
    const id = it.SellerID || 'FRESHLY_MART';
    if(!grouped[id]) grouped[id] = {orders:{}, returns:0, complaints:0, ratingSum:0, ratingCount:0};
    grouped[id].orders[it.OrderID] = true;
  });
  returns.forEach(function(r){ if(r.SellerID && grouped[r.SellerID]) grouped[r.SellerID].returns++; });
  reviews.forEach(function(r){
    const id = r.SellerID;
    if(!id) return;
    if(!grouped[id]) grouped[id] = {orders:{}, returns:0, complaints:0, ratingSum:0, ratingCount:0};
    grouped[id].ratingSum += toNumber_(r.SellerRating);
    grouped[id].ratingCount++;
  });
  Object.keys(grouped).forEach(function(id){
    const g = grouped[id];
    const totalOrders = Object.keys(g.orders).length;
    const rating = g.ratingCount ? (g.ratingSum/g.ratingCount).toFixed(2) : '';
    appendObject_('SellerPerformance', {SellerID:id, SellerName:(sellers[id] && sellers[id].BusinessName) || id, TotalOrders:totalOrders, CancelledDueToOOS:0, ReturnCount:g.returns, ComplaintCount:g.complaints, SellerRating:rating, ReturnRate:totalOrders ? (g.returns/totalOrders*100).toFixed(2)+'%' : '0%', Status:'Active'});
  });
}

function refreshHubPerformance_(){
  clearSheetData_('HubPerformance');
  const orders = rowsAsObjects_('Orders');
  const reviews = rowsAsObjects_('Reviews');
  const grouped = {};
  orders.forEach(function(o){
    const id = o.HubID || 'NO_HUB';
    if(!grouped[id]) grouped[id] = {hubName:o.HubName || id, total:0, delivered:0, cancelled:0, ratingSum:0, ratingCount:0};
    grouped[id].total++;
    if(String(o.OrderStatus).toLowerCase()==='delivered') grouped[id].delivered++;
    if(String(o.OrderStatus).toLowerCase()==='cancelled') grouped[id].cancelled++;
  });
  reviews.forEach(function(r){
    const id = r.HubID || 'NO_HUB';
    if(!grouped[id]) grouped[id] = {hubName:id, total:0, delivered:0, cancelled:0, ratingSum:0, ratingCount:0};
    grouped[id].ratingSum += toNumber_(r.DeliveryRating);
    grouped[id].ratingCount++;
  });
  Object.keys(grouped).forEach(function(id){
    const g = grouped[id];
    appendObject_('HubPerformance', {HubID:id, HubName:g.hubName, TotalOrders:g.total, DeliveredOrders:g.delivered, CancelledOrders:g.cancelled, DeliveryComplaintCount:0, DelayCount:0, PaymentIssueCount:0, HubRating:g.ratingCount ? (g.ratingSum/g.ratingCount).toFixed(2) : '', Status:'Active', LastUpdated:new Date()});
  });
}

/* ----------------------------- Formatting & validations ----------------------------- */

function formatAllFreshlyMartSheets(showAlert){
  Object.keys(FM_SHEETS).forEach(function(name){
    const sh = sheet_(name);
    const lastCol = sh.getLastColumn();
    const lastRow = Math.max(sh.getLastRow(), 1);
    sh.getRange(1,1,1,lastCol).setFontWeight('bold').setBackground('#e8f5ec').setFontColor('#103b22');
    sh.setFrozenRows(1);
    sh.getRange(1,1,lastRow,lastCol).setWrap(true).setVerticalAlignment('top');
    try{ if(sh.getFilter()) sh.getFilter().remove(); sh.getRange(1,1,lastRow,lastCol).createFilter(); }catch(err){}
    try{ sh.autoResizeColumns(1, lastCol); }catch(err){}
    applyNumberFormats_(sh);
  });
  logActivity_('formatAllFreshlyMartSheets','Admin','All sheets formatted');
  if(showAlert !== false) safeUiAlert_('All Freshly Mart backend sheets formatted.');
}

function applyNumberFormats_(sh){
  const headers = sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0];
  headers.forEach(function(h,idx){
    const col = idx+1;
    const name = String(h || '').toLowerCase().replace(/\s+/g,'');

    // Time-only columns should NOT use date format.
    // Otherwise Google Sheets displays time-only values as 30-Dec-1899.
    if(name === 'starttime' || name === 'endtime' || name === 'cutofftime'){
      try{ sh.getRange(2,col,Math.max(sh.getMaxRows()-1,1),1).setNumberFormat('hh:mm AM/PM'); }catch(err){}
    }else if(name === 'datetime' || name.indexOf('date') !== -1 || name === 'generatedat' || name === 'lastupdated' || name === 'collecteddate' || name === 'paiddate' || name === 'refunddate' || name === 'requesteddate'){
      try{ sh.getRange(2,col,Math.max(sh.getMaxRows()-1,1),1).setNumberFormat('dd-mmm-yyyy hh:mm AM/PM'); }catch(err){}
    }

    if(name.indexOf('price') !== -1 || name.indexOf('amount') !== -1 || name.indexOf('total') !== -1 || name.indexOf('charge') !== -1 || name.indexOf('payable') !== -1 || name.indexOf('commission') !== -1 || name.indexOf('deduction') !== -1 || name.indexOf('sales') !== -1){
      try{ sh.getRange(2,col,Math.max(sh.getMaxRows()-1,1),1).setNumberFormat('₹#,##0.00'); }catch(err){}
    }
  });
}

function fixDeliverySlotTimeFormatting(){
  formatAllFreshlyMartSheets(false);
  const sh = sheet_('DeliverySlots');
  const headers = sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0];
  ['StartTime','EndTime','CutOffTime'].forEach(function(h){
    const idx = headers.indexOf(h);
    if(idx !== -1){
      sh.getRange(2,idx+1,Math.max(sh.getMaxRows()-1,1),1).setNumberFormat('hh:mm AM/PM');
    }
  });
  const hubSh = sheet_('Hubs');
  const hubHeaders = hubSh.getRange(1,1,1,hubSh.getLastColumn()).getValues()[0];
  const c = hubHeaders.indexOf('CutOffTime');
  if(c !== -1){
    hubSh.getRange(2,c+1,Math.max(hubSh.getMaxRows()-1,1),1).setNumberFormat('hh:mm AM/PM');
  }
  logActivity_('fixDeliverySlotTimeFormatting','Admin','Time-only columns formatted as hh:mm AM/PM');
  safeUiAlert_('Delivery slot time formatting fixed. StartTime, EndTime and CutOffTime now display as time only, without 30-Dec-1899.');
}


/* ----------------------------- Payment & receipt automation ----------------------------- */

function paymentSettings_(){
  return {
    UPIID: getSetting_('UPIID') || '',
    UPIQRCodeImageURL: getSetting_('UPIQRCodeImageURL') || '',
    PaymentPolicy: getSetting_('PaymentPolicy') || 'All payments must be made only to Freshly Mart UPI / QR. No cash handling by hubs, delivery partners or sellers.',
    AllowCashPayment: getSetting_('AllowCashPayment') || 'No'
  };
}

function verifyPaymentByOrderIdPrompt(){
  const ui = SpreadsheetApp.getUi();
  const orderRes = ui.prompt('Verify UPI Payment', 'Enter Order ID:', ui.ButtonSet.OK_CANCEL);
  if(orderRes.getSelectedButton() !== ui.Button.OK) return;
  const refRes = ui.prompt('Verify UPI Payment', 'Enter UPI reference / transaction ID:', ui.ButtonSet.OK_CANCEL);
  if(refRes.getSelectedButton() !== ui.Button.OK) return;
  const amountRes = ui.prompt('Verify UPI Payment', 'Enter paid amount, or leave blank to use order total:', ui.ButtonSet.OK_CANCEL);
  if(amountRes.getSelectedButton() !== ui.Button.OK) return;
  const result = verifyPaymentInternal_({OrderID:orderRes.getResponseText(), UPIReference:refRes.getResponseText(), PaidAmount:amountRes.getResponseText()}, 'Google Sheet Menu');
  ui.alert(result.message + (result.ReceiptID ? '\nReceipt ID: '+result.ReceiptID : ''));
}

function generateReceiptByOrderIdPrompt(){
  const ui = SpreadsheetApp.getUi();
  const orderRes = ui.prompt('Generate Receipt', 'Enter Order ID:', ui.ButtonSet.OK_CANCEL);
  if(orderRes.getSelectedButton() !== ui.Button.OK) return;
  const receipt = generateReceiptForOrder_(orderRes.getResponseText(), 'Google Sheet Menu');
  ui.alert('Receipt generated. Receipt ID: '+receipt.ReceiptID);
}

function generateReceiptsForPaidOrders(){
  let count = 0, skipped = 0;
  rowsAsObjects_('Orders').forEach(function(o){
    if(isPaidStatus_(o.PaymentStatus)){
      try{ generateReceiptForOrder_(o.OrderID, 'Bulk Receipt Generation'); count++; }catch(err){ skipped++; }
    }
  });
  safeUiAlert_('Receipt generation completed. Generated/existing paid order receipts: '+count+'. Skipped: '+skipped+'.');
}

function savePaymentProof_(d){
  validateRequired_(d, ['OrderID','Phone','UPIReference'], 'Payment proof');
  const order = findRowObject_('Orders','OrderID', d.OrderID);
  if(!order) return {ok:false,message:'Order not found.'};
  if(cleanPhone_(order.Phone) !== cleanPhone_(d.Phone)) return {ok:false,message:'Phone number does not match the order.'};
  const payment = findRowObject_('Payments','OrderID', d.OrderID);
  const paymentId = payment && payment.PaymentID ? payment.PaymentID : 'PAY'+idStamp_();
  const amount = toNumber_(d.PaidAmount || order.GrandTotal);
  if(payment && payment.PaymentID){
    updateRowById_('Payments','PaymentID', payment.PaymentID, {UPIReference:d.UPIReference, PaymentStatus:'UPI Pending Verification', Remarks:'Customer submitted UPI proof. Awaiting admin verification.'});
  }else{
    appendObject_('Payments', {PaymentID:paymentId, DateTime:new Date(), OrderID:d.OrderID, CustomerName:order.CustomerName, Amount:amount, PaymentMode:order.PaymentMode || 'UPI Online', PaymentStatus:'UPI Pending Verification', CollectedBy:'Freshly Mart UPI', CollectedDate:'', UPIReference:d.UPIReference, Remarks:'Customer submitted UPI proof. Awaiting admin verification.'});
  }
  updateRowById_('Orders','OrderID', d.OrderID, {PaymentStatus:'UPI Pending Verification'});
  appendObject_('PaymentVerifications', {VerificationID:'PV'+idStamp_(), DateTime:new Date(), OrderID:d.OrderID, PaymentID:paymentId, CustomerName:order.CustomerName, Phone:order.Phone, ExpectedAmount:order.GrandTotal, PaidAmount:amount, PaymentMode:order.PaymentMode || 'UPI Online', UPIReference:d.UPIReference, VerificationStatus:'Pending Verification', VerifiedBy:'', ReceiptID:'', Remarks:'Submitted from public website'});
  logActivity_('savePaymentProof','Public','Payment proof submitted for '+d.OrderID);
  return {ok:true,message:'Payment proof submitted. Freshly Mart admin will verify and generate receipt.', OrderID:d.OrderID};
}

function verifyPaymentInternal_(d, verifiedBy){
  validateRequired_(d, ['OrderID','UPIReference'], 'Payment verification');
  const order = findRowObject_('Orders','OrderID', d.OrderID);
  if(!order) return {ok:false,message:'Order not found.'};
  const payment = findRowObject_('Payments','OrderID', d.OrderID);
  const paymentId = payment && payment.PaymentID ? payment.PaymentID : 'PAY'+idStamp_();
  const paidAmount = toNumber_(d.PaidAmount || d.Amount || order.GrandTotal);
  if(paidAmount <= 0) return {ok:false,message:'Paid amount must be greater than zero.'};
  if(payment && payment.PaymentID){
    updateRowById_('Payments','PaymentID', payment.PaymentID, {Amount:paidAmount, PaymentStatus:'Paid to Freshly Mart', CollectedBy:'Freshly Mart UPI', CollectedDate:new Date(), UPIReference:d.UPIReference, Remarks:d.Remarks || 'UPI payment verified by admin. No cash handled.'});
  }else{
    appendObject_('Payments', {PaymentID:paymentId, DateTime:new Date(), OrderID:d.OrderID, CustomerName:order.CustomerName, Amount:paidAmount, PaymentMode:order.PaymentMode || 'UPI Online', PaymentStatus:'Paid to Freshly Mart', CollectedBy:'Freshly Mart UPI', CollectedDate:new Date(), UPIReference:d.UPIReference, Remarks:d.Remarks || 'UPI payment verified by admin. No cash handled.'});
  }
  const newOrderStatus = String(order.OrderStatus || '').toLowerCase() === 'new' ? 'Confirmed' : order.OrderStatus;
  updateRowById_('Orders','OrderID', d.OrderID, {PaymentStatus:'Paid to Freshly Mart', OrderStatus:newOrderStatus});
  const receipt = generateReceiptForOrder_(d.OrderID, verifiedBy || 'Admin');
  appendObject_('PaymentVerifications', {VerificationID:'PV'+idStamp_(), DateTime:new Date(), OrderID:d.OrderID, PaymentID:paymentId, CustomerName:order.CustomerName, Phone:order.Phone, ExpectedAmount:order.GrandTotal, PaidAmount:paidAmount, PaymentMode:order.PaymentMode || 'UPI Online', UPIReference:d.UPIReference, VerificationStatus:'Verified', VerifiedBy:verifiedBy || 'Admin', ReceiptID:receipt.ReceiptID, Remarks:'Payment verified and receipt generated'});
  logActivity_('verifyPayment', verifiedBy || 'Admin', 'Order '+d.OrderID+' paid via Freshly Mart UPI. Receipt '+receipt.ReceiptID);
  return {ok:true,message:'Payment verified. Receipt generated automatically.', OrderID:d.OrderID, PaymentID:paymentId, ReceiptID:receipt.ReceiptID, ReceiptText:receipt.ReceiptText};
}

function generateReceiptForOrder_(orderId, generatedBy){
  orderId = String(orderId || '').trim();
  const order = findRowObject_('Orders','OrderID', orderId);
  if(!order) throw new Error('Order not found: '+orderId);
  if(!isPaidStatus_(order.PaymentStatus)) throw new Error('Receipt blocked. Order payment is not marked Paid to Freshly Mart.');
  const existing = rowsAsObjects_('Receipts').find(function(r){ return String(r.ReceiptType)==='Customer Payment' && String(r.OrderID)===orderId && String(r.PaymentStatus)==='Paid to Freshly Mart'; });
  if(existing) return existing;
  const payment = findRowObject_('Payments','OrderID', orderId) || {};
  const receiptId = 'REC'+idStamp_();
  const amount = toNumber_(payment.Amount || order.GrandTotal);
  const receiptDate = new Date();
  const receiptText = buildReceiptText_({
    ReceiptID:receiptId,
    ReceiptType:'Customer Payment',
    OrderID:order.OrderID,
    PartyName:order.CustomerName,
    Phone:order.Phone,
    Amount:amount,
    PaymentMode:payment.PaymentMode || order.PaymentMode || 'Freshly Mart UPI',
    UPIReference:payment.UPIReference || order.UPIReference || '',
    PaymentStatus:'Paid to Freshly Mart',
    ReceiptDate:receiptDate,
    Notes:'Payment received only through Freshly Mart UPI. No cash handled by hub, seller or delivery partner.'
  });
  const row = {ReceiptID:receiptId, DateTime:new Date(), ReceiptType:'Customer Payment', RelatedID:payment.PaymentID || '', OrderID:order.OrderID, PartyType:'Customer', PartyID:cleanPhone_(order.Phone), PartyName:order.CustomerName, Phone:order.Phone, PaymentMode:payment.PaymentMode || order.PaymentMode || 'Freshly Mart UPI', Amount:amount, UPIReference:payment.UPIReference || order.UPIReference || '', PaymentStatus:'Paid to Freshly Mart', ReceiptDate:receiptDate, ReceiptText:receiptText, GeneratedBy:generatedBy || 'Auto', Remarks:'Customer payment receipt'};
  appendObject_('Receipts', row);
  return row;
}

function getReceiptForCustomer_(orderId, phone){
  orderId = String(orderId || '').trim();
  phone = cleanPhone_(phone || '');
  if(!orderId || !phone) return {ok:false,message:'OrderID and Phone are required.'};
  const order = findRowObject_('Orders','OrderID', orderId);
  if(!order || cleanPhone_(order.Phone) !== phone) return {ok:false,message:'Receipt not found for this order/phone.'};
  let receipt = rowsAsObjects_('Receipts').find(function(r){ return String(r.OrderID)===orderId && String(r.ReceiptType)==='Customer Payment'; });
  if(!receipt && isPaidStatus_(order.PaymentStatus)) receipt = generateReceiptForOrder_(orderId, 'Customer Receipt Lookup');
  if(!receipt) return {ok:false,message:'Payment receipt is not generated yet. It will be available after payment verification.'};
  return {ok:true,receipt:receipt};
}

function buildReceiptText_(r){
  return [
    'Freshly Mart Receipt',
    '---------------------',
    'Receipt ID: '+(r.ReceiptID || ''),
    'Type: '+(r.ReceiptType || ''),
    r.OrderID ? 'Order ID: '+r.OrderID : '',
    'Date: '+Utilities.formatDate(parseDate_(r.ReceiptDate) || new Date(), FM_TIMEZONE, 'dd-MMM-yyyy hh:mm a'),
    'Name/Party: '+(r.PartyName || ''),
    r.Phone ? 'Phone: '+r.Phone : '',
    'Amount: ₹'+toNumber_(r.Amount).toLocaleString('en-IN'),
    'Payment Mode: '+(r.PaymentMode || 'UPI'),
    'UPI Reference: '+(r.UPIReference || ''),
    'Status: '+(r.PaymentStatus || ''),
    r.Notes || '',
    'Thank you for using Freshly Mart.'
  ].filter(String).join('\n');
}

function generatePaymentReconciliation(){
  const result = generatePaymentReconciliation_();
  safeUiAlert_(result.message);
}

function generatePaymentReconciliation_(){
  const headers = FM_SHEETS.PaymentReconciliation;
  const rows = [];
  const orders = objectBy_(rowsAsObjects_('Orders'), 'OrderID');
  rowsAsObjects_('Payments').forEach(function(p, idx){
    const o = orders[p.OrderID] || {};
    const expected = toNumber_(o.GrandTotal || p.Amount);
    const paid = isPaidStatus_(p.PaymentStatus) ? toNumber_(p.Amount) : 0;
    const balance = Math.max(expected - paid, 0);
    let status = 'Pending';
    if(isPaidStatus_(p.PaymentStatus) && Math.abs(expected - toNumber_(p.Amount)) < 0.01) status = 'Matched';
    else if(isPaidStatus_(p.PaymentStatus)) status = 'Amount Mismatch';
    else if(!p.UPIReference) status = 'UPI Reference Missing';
    else status = 'Awaiting Verification';
    const receipt = rowsAsObjects_('Receipts').find(function(r){ return String(r.OrderID)===String(p.OrderID) && String(r.ReceiptType)==='Customer Payment'; }) || {};
    rows.push(['RECON'+idStamp_()+idx, new Date(), p.OrderID, p.PaymentID, p.CustomerName || o.CustomerName || '', expected, toNumber_(p.Amount), balance, p.PaymentMode, p.PaymentStatus, p.UPIReference || '', receipt.ReceiptID || '', status, 'Auto reconciliation. All payments must be Freshly Mart UPI only.']);
  });
  replaceSheetRows_('PaymentReconciliation', headers, rows);
  logActivity_('generatePaymentReconciliation','Admin','Rows '+rows.length);
  return {ok:true,message:'Payment reconciliation generated. Rows: '+rows.length+'.'};
}

function generateCurrentMonthPaymentAutomation(){
  const result = generateCurrentMonthPaymentAutomation_(true);
  safeUiAlert_(result.message);
}

function generateCurrentMonthPaymentAutomation_(show){
  const range = currentMonthRange_();
  const receipts = countGenerateReceiptsForPaidOrders_();
  const recon = generatePaymentReconciliation_();
  const seller = generateSellerSettlementsForDates_(range.start, range.end);
  const supplier = generateSupplierPaymentsForDates_(range.start, range.end);
  const hub = generateHubSettlementsForDates_(range.start, range.end);
  const delivery = generateDeliverySettlementsForDates_(range.start, range.end);
  const tax = generateTaxSummaryForDates_(range.start, range.end);
  const message = 'Payment automation completed for '+range.start+' to '+range.end+'.\nReceipts checked: '+receipts+'.\n'+seller.message+'\n'+supplier.message+'\n'+hub.message+'\n'+delivery.message+'\n'+tax.message+'\n'+recon.message;
  if(show) safeUiAlert_(message);
  return {ok:true,message:message};
}

function countGenerateReceiptsForPaidOrders_(){
  let count = 0;
  rowsAsObjects_('Orders').forEach(function(o){ if(isPaidStatus_(o.PaymentStatus)){ try{ generateReceiptForOrder_(o.OrderID, 'Payment Automation'); count++; }catch(err){} } });
  return count;
}

function generateCurrentMonthSellerSettlements(){ const r=currentMonthRange_(); safeUiAlert_(generateSellerSettlementsForDates_(r.start,r.end).message); }
function generateCurrentMonthSupplierPayments(){ const r=currentMonthRange_(); safeUiAlert_(generateSupplierPaymentsForDates_(r.start,r.end).message); }
function generateCurrentMonthHubSettlements(){ const r=currentMonthRange_(); safeUiAlert_(generateHubSettlementsForDates_(r.start,r.end).message); }
function generateCurrentMonthDeliverySettlements(){ const r=currentMonthRange_(); safeUiAlert_(generateDeliverySettlementsForDates_(r.start,r.end).message); }

function eligiblePaidDeliveredOrders_(startDate, endDate){
  return rowsAsObjects_('Orders').filter(function(o){ const d = dateKey_(o.DateTime); return d >= startDate && d <= endDate && String(o.OrderStatus || '').toLowerCase() === 'delivered' && isPaidStatus_(o.PaymentStatus); });
}

function generateSellerSettlementsForDates_(startDate, endDate){
  const orders = objectBy_(eligiblePaidDeliveredOrders_(startDate,endDate), 'OrderID');
  const sellers = objectBy_(rowsAsObjects_('Sellers'), 'SellerID');
  const grouped = {};
  rowsAsObjects_('OrderItems').forEach(function(it){
    if(!orders[it.OrderID]) return;
    const sellerId = String(it.SellerID || '').trim();
    if(!sellerId) return;
    const seller = sellers[sellerId] || {};
    if(!grouped[sellerId]) grouped[sellerId] = {name:seller.BusinessName || seller.StoreName || sellerId, orders:{}, gross:0};
    grouped[sellerId].orders[it.OrderID] = true;
    grouped[sellerId].gross += toNumber_(it.Total);
  });
  let count = 0;
  Object.keys(grouped).forEach(function(sellerId){
    const g = grouped[sellerId], seller = sellers[sellerId] || {};
    const commissionPercent = toNumber_(seller.CommissionPercent || getSetting_('DefaultSellerCommissionPercent') || 10);
    const commission = g.gross * commissionPercent / 100;
    const settlementId = 'SETSEL'+idStamp_()+count;
    appendObject_('SellerSettlements', {SettlementID:settlementId, DateTime:new Date(), PeriodStart:startDate, PeriodEnd:endDate, SellerID:sellerId, SellerName:g.name, Orders:Object.keys(g.orders).length, GrossSales:g.gross, CommissionPercent:commissionPercent, CommissionAmount:commission, RefundDeduction:0, PenaltyDeduction:0, NetPayable:g.gross-commission, SettlementStatus:'Pending', PaidDate:'', PaymentMode:'UPI', UPIReference:'', ReceiptID:'', Remarks:'Auto generated from delivered + paid orders only'});
    count++;
  });
  logActivity_('generateSellerSettlements','Admin',startDate+' to '+endDate+', sellers '+count);
  return {ok:true,message:'Generated '+count+' seller settlement(s).'};
}

function generateSupplierPaymentsForDates_(startDate, endDate){
  const orders = objectBy_(eligiblePaidDeliveredOrders_(startDate,endDate), 'OrderID');
  const suppliers = objectBy_(rowsAsObjects_('Suppliers'), 'SupplierID');
  const grouped = {};
  rowsAsObjects_('OrderItems').forEach(function(it){
    if(!orders[it.OrderID]) return;
    const supplierId = String(it.SupplierID || '').trim();
    if(!supplierId) return;
    const supplier = suppliers[supplierId] || {};
    if(!grouped[supplierId]) grouped[supplierId] = {name:supplier.SupplierName || supplierId, orders:{}, gross:0};
    grouped[supplierId].orders[it.OrderID] = true;
    const cost = toNumber_(it.CostPrice) > 0 ? toNumber_(it.CostPrice) * toNumber_(it.Quantity || 1) : toNumber_(it.Total);
    grouped[supplierId].gross += cost;
  });
  let count = 0;
  Object.keys(grouped).forEach(function(supplierId){
    const g = grouped[supplierId];
    appendObject_('SupplierPayments', {SupplierPaymentID:'SUPPAY'+idStamp_()+count, DateTime:new Date(), PeriodStart:startDate, PeriodEnd:endDate, SupplierID:supplierId, SupplierName:g.name, Orders:Object.keys(g.orders).length, GrossPurchaseAmount:g.gross, ReturnDeduction:0, NetPayable:g.gross, SettlementStatus:'Pending', PaidDate:'', PaymentMode:'UPI', UPIReference:'', ReceiptID:'', Remarks:'Auto generated supplier payable'});
    count++;
  });
  logActivity_('generateSupplierPayments','Admin',startDate+' to '+endDate+', suppliers '+count);
  return {ok:true,message:'Generated '+count+' supplier payment(s).'};
}

function generateHubSettlementsForDates_(startDate, endDate){
  const orders = eligiblePaidDeliveredOrders_(startDate,endDate);
  const defaultHubFee = toNumber_(getSetting_('DefaultHubCommissionPerOrder') || 20);
  const grouped = {};
  orders.forEach(function(o){
    const hubId = String(o.HubID || '').trim() || 'NO_HUB';
    if(!grouped[hubId]) grouped[hubId] = {name:o.HubName || hubId, orders:0, pickup:0, delivery:0};
    grouped[hubId].orders++;
    if(String(o.DeliveryOption || '').toLowerCase().indexOf('pickup') !== -1) grouped[hubId].pickup++; else grouped[hubId].delivery++;
  });
  let count = 0;
  Object.keys(grouped).forEach(function(hubId){
    const g = grouped[hubId];
    appendObject_('HubSettlements', {HubSettlementID:'HUBSET'+idStamp_()+count, DateTime:new Date(), PeriodStart:startDate, PeriodEnd:endDate, HubID:hubId, HubName:g.name, Orders:g.orders, PickupOrders:g.pickup, DeliveryOrders:g.delivery, HandlingFee:g.orders*defaultHubFee, ReturnHandlingFee:0, Deductions:0, NetPayable:g.orders*defaultHubFee, SettlementStatus:'Pending', PaidDate:'', PaymentMode:'UPI', UPIReference:'', ReceiptID:'', Remarks:'No cash collection. Hub payout only after orders are paid to Freshly Mart.'});
    count++;
  });
  logActivity_('generateHubSettlements','Admin',startDate+' to '+endDate+', hubs '+count);
  return {ok:true,message:'Generated '+count+' hub settlement(s).'};
}

function generateDeliverySettlementsForDates_(startDate, endDate){
  const orders = eligiblePaidDeliveredOrders_(startDate,endDate);
  const grouped = {};
  orders.forEach(function(o){
    const id = String(o.DeliveryPartnerID || o.DeliveryPartner || '').trim();
    if(!id) return;
    if(!grouped[id]) grouped[id] = {name:o.DeliveryPartnerName || id, hub:o.HubID || '', deliveries:0, returns:0};
    grouped[id].deliveries++;
  });
  const defaultFee = toNumber_(getSetting_('DefaultDeliveryPartnerFee') || 30);
  let count = 0;
  Object.keys(grouped).forEach(function(id){
    const g = grouped[id];
    appendObject_('DeliverySettlements', {DeliverySettlementID:'DELSET'+idStamp_()+count, DateTime:new Date(), PeriodStart:startDate, PeriodEnd:endDate, DeliveryPartnerID:id, DeliveryPartnerName:g.name, HubID:g.hub, Deliveries:g.deliveries, ReturnPickups:g.returns, DeliveryFee:g.deliveries*defaultFee, Deductions:0, NetPayable:g.deliveries*defaultFee, SettlementStatus:'Pending', PaidDate:'', PaymentMode:'UPI', UPIReference:'', ReceiptID:'', Remarks:'Delivery payout. No cash collection allowed.'});
    count++;
  });
  logActivity_('generateDeliverySettlements','Admin',startDate+' to '+endDate+', delivery partners '+count);
  return {ok:true,message:'Generated '+count+' delivery settlement(s).'};
}

function generateTaxSummaryForDates_(startDate, endDate){
  const orders = eligiblePaidDeliveredOrders_(startDate,endDate);
  let count = 0;
  orders.forEach(function(o){
    appendObject_('TaxSummary', {TaxID:'TAX'+idStamp_()+count, DateTime:new Date(), PeriodStart:startDate, PeriodEnd:endDate, OrderID:o.OrderID, TaxableValue:o.GrandTotal, GSTAmount:'', GSTPercent:'', TCSAmount:'', TDSAmount:'', HSNCode:'', SACCode:'', Remarks:'Placeholder for CA/GST review. Enter GST/TCS values as applicable.'});
    count++;
  });
  return {ok:true,message:'Generated '+count+' tax summary placeholder row(s).'};
}

function markSettlementPaidPrompt(){
  const ui = SpreadsheetApp.getUi();
  const idRes = ui.prompt('Mark Settlement Paid', 'Enter Seller/Supplier/Hub/Delivery Settlement ID:', ui.ButtonSet.OK_CANCEL);
  if(idRes.getSelectedButton() !== ui.Button.OK) return;
  const refRes = ui.prompt('Mark Settlement Paid', 'Enter UPI reference / bank transaction ID:', ui.ButtonSet.OK_CANCEL);
  if(refRes.getSelectedButton() !== ui.Button.OK) return;
  const result = markSettlementPaid_({SettlementID:idRes.getResponseText(), UPIReference:refRes.getResponseText()});
  ui.alert(result.message + (result.ReceiptID ? '\nReceipt/Voucher ID: '+result.ReceiptID : ''));
}

function markSettlementPaid_(d){
  validateRequired_(d, ['SettlementID','UPIReference'], 'Settlement payment');
  const id = String(d.SettlementID || '').trim();
  const targets = [
    {sheet:'SellerSettlements', idField:'SettlementID', type:'Seller Settlement', partyType:'Seller', partyId:'SellerID', partyName:'SellerName', amount:'NetPayable'},
    {sheet:'SupplierPayments', idField:'SupplierPaymentID', type:'Supplier Payment', partyType:'Supplier', partyId:'SupplierID', partyName:'SupplierName', amount:'NetPayable'},
    {sheet:'HubSettlements', idField:'HubSettlementID', type:'Hub Settlement', partyType:'HubPartner', partyId:'HubID', partyName:'HubName', amount:'NetPayable'},
    {sheet:'DeliverySettlements', idField:'DeliverySettlementID', type:'Delivery Settlement', partyType:'DeliveryPartner', partyId:'DeliveryPartnerID', partyName:'DeliveryPartnerName', amount:'NetPayable'}
  ];
  for(let i=0;i<targets.length;i++){
    const t = targets[i];
    const row = findRowObject_(t.sheet, t.idField, id);
    if(row){
      const receipt = generateGenericReceipt_({ReceiptType:t.type+' Payment Voucher', RelatedID:id, OrderID:'', PartyType:t.partyType, PartyID:row[t.partyId] || '', PartyName:row[t.partyName] || '', Phone:'', PaymentMode:'UPI', Amount:toNumber_(row[t.amount]), UPIReference:d.UPIReference, PaymentStatus:'Paid', GeneratedBy:'Admin', Remarks:'Settlement paid by Freshly Mart'});
      const updates = {SettlementStatus:'Paid', PaidDate:new Date(), PaymentMode:'UPI', UPIReference:d.UPIReference, ReceiptID:receipt.ReceiptID};
      updateRowById_(t.sheet, t.idField, id, updates);
      appendObject_('SettlementLog', {LogID:'SLOG'+idStamp_(), DateTime:new Date(), SettlementType:t.type, SettlementID:id, PartyType:t.partyType, PartyID:row[t.partyId] || '', PartyName:row[t.partyName] || '', Amount:toNumber_(row[t.amount]), PaymentMode:'UPI', UPIReference:d.UPIReference, ReceiptID:receipt.ReceiptID, Status:'Paid', Remarks:d.Remarks || ''});
      logActivity_('markSettlementPaid','Admin', t.type+' '+id+' paid. Receipt '+receipt.ReceiptID);
      return {ok:true,message:t.type+' marked paid.', ReceiptID:receipt.ReceiptID};
    }
  }
  return {ok:false,message:'Settlement ID not found in settlement sheets.'};
}

function addManualExpensePrompt(){
  const ui = SpreadsheetApp.getUi();
  const typeRes = ui.prompt('Add Manual Expense', 'Expense type:', ui.ButtonSet.OK_CANCEL); if(typeRes.getSelectedButton() !== ui.Button.OK) return;
  const partyRes = ui.prompt('Add Manual Expense', 'Paid to / Party name:', ui.ButtonSet.OK_CANCEL); if(partyRes.getSelectedButton() !== ui.Button.OK) return;
  const amountRes = ui.prompt('Add Manual Expense', 'Amount:', ui.ButtonSet.OK_CANCEL); if(amountRes.getSelectedButton() !== ui.Button.OK) return;
  const refRes = ui.prompt('Add Manual Expense', 'UPI reference / payment reference:', ui.ButtonSet.OK_CANCEL); if(refRes.getSelectedButton() !== ui.Button.OK) return;
  const result = addExpense_({ExpenseType:typeRes.getResponseText(), PartyName:partyRes.getResponseText(), Amount:amountRes.getResponseText(), UPIReference:refRes.getResponseText(), PaymentStatus:'Paid'});
  ui.alert(result.message + (result.ReceiptID ? '\nReceipt ID: '+result.ReceiptID : ''));
}

function addExpense_(d){
  validateRequired_(d, ['ExpenseType','PartyName','Amount'], 'Expense');
  const amount = toNumber_(d.Amount);
  if(amount <= 0) return {ok:false,message:'Expense amount must be greater than zero.'};
  const expenseId = 'EXP'+idStamp_();
  let receiptId = '';
  if(String(d.PaymentStatus || 'Paid') === 'Paid'){
    const receipt = generateGenericReceipt_({ReceiptType:'Expense Payment Voucher', RelatedID:expenseId, PartyType:'Expense', PartyID:'', PartyName:d.PartyName, Phone:'', PaymentMode:'UPI', Amount:amount, UPIReference:d.UPIReference || '', PaymentStatus:'Paid', GeneratedBy:'Admin', Remarks:d.Remarks || d.ExpenseType});
    receiptId = receipt.ReceiptID;
  }
  appendObject_('ExpenseTracker', {ExpenseID:expenseId, DateTime:new Date(), ExpenseDate:d.ExpenseDate || new Date(), ExpenseType:d.ExpenseType, PartyName:d.PartyName, Amount:amount, PaymentMode:'UPI', UPIReference:d.UPIReference || '', PaymentStatus:d.PaymentStatus || 'Paid', ReceiptID:receiptId, Remarks:d.Remarks || ''});
  logActivity_('addExpense','Admin','Expense '+expenseId+' '+amount);
  return {ok:true,message:'Expense recorded.', ExpenseID:expenseId, ReceiptID:receiptId};
}

function generateGenericReceipt_(r){
  const receiptId = 'REC'+idStamp_();
  const receiptDate = new Date();
  const receiptText = buildReceiptText_(Object.assign({}, r, {ReceiptID:receiptId, ReceiptDate:receiptDate}));
  const row = {ReceiptID:receiptId, DateTime:new Date(), ReceiptType:r.ReceiptType || 'Payment Voucher', RelatedID:r.RelatedID || '', OrderID:r.OrderID || '', PartyType:r.PartyType || '', PartyID:r.PartyID || '', PartyName:r.PartyName || '', Phone:r.Phone || '', PaymentMode:r.PaymentMode || 'UPI', Amount:toNumber_(r.Amount), UPIReference:r.UPIReference || '', PaymentStatus:r.PaymentStatus || 'Paid', ReceiptDate:receiptDate, ReceiptText:receiptText, GeneratedBy:r.GeneratedBy || 'Auto', Remarks:r.Remarks || ''};
  appendObject_('Receipts', row);
  return row;
}

function replaceSheetRows_(sheetName, headers, rows){
  const sh = ensureSheet_(sheetName, headers);
  const last = sh.getLastRow();
  if(last > 1) sh.getRange(2,1,last-1,Math.max(sh.getLastColumn(), headers.length)).clearContent();
  if(rows && rows.length) sh.getRange(2,1,rows.length,headers.length).setValues(rows);
  formatSheet_(sh);
}

function applyBackendValidations(showAlert){
  applyValidationToColumn_('Settings','Status', FM_STATUS.ACTIVE);
  applyValidationToColumn_('Categories','Status', FM_STATUS.ACTIVE);
  applyValidationToColumn_('Banners','Status', FM_STATUS.ACTIVE);
  applyValidationToColumn_('Products','Status', FM_STATUS.PRODUCT_PUBLIC);
  applyValidationToColumn_('Products','StockStatus', FM_STATUS.STOCK);
  applyValidationToColumn_('Products','Featured', FM_STATUS.YESNO);
  applyValidationToColumn_('Sellers','Status', FM_STATUS.SELLER);
  applyValidationToColumn_('Sellers','FoodSeller', FM_STATUS.YESNO);
  applyValidationToColumn_('Sellers','GSTRequired', FM_STATUS.YESNO);
  applyValidationToColumn_('Sellers','GSTStatus', FM_STATUS.GST);
  applyValidationToColumn_('Sellers','GSTVerified', FM_STATUS.YESNO);
  applyValidationToColumn_('Sellers','FSSAIRequired', FM_STATUS.YESNO);
  applyValidationToColumn_('Sellers','FSSAIStatus', FM_STATUS.FSSAI);
  applyValidationToColumn_('Sellers','ComplianceRelaxation', FM_STATUS.YESNO);
  applyValidationToColumn_('Sellers','RelaxationFor', FM_STATUS.RELAXATION_FOR);
  applyValidationToColumn_('Sellers','ComplianceRiskLevel', FM_STATUS.RISK);
  applyValidationToColumn_('ProductSubmissions','ApprovalStatus', FM_STATUS.PRODUCT_APPROVAL);
  applyValidationToColumn_('ProductSubmissions','FoodRelated', FM_STATUS.YESNO);
  applyValidationToColumn_('ProductSubmissions','FSSAIRequired', FM_STATUS.YESNO);
  applyValidationToColumn_('ProductSubmissions','FSSAIValidated', ['Yes','No','Not Required']);
  applyValidationToColumn_('ProductSubmissions','GSTApplicable', FM_STATUS.YESNO);
  applyValidationToColumn_('ProductSubmissions','GSTValidated', ['Yes','No','Not Required']);
  applyValidationToColumn_('ProductSubmissions','TaxInclusivePrice', FM_STATUS.YESNO);
  applyValidationToColumn_('ProductSubmissions','ComplianceRelaxation', FM_STATUS.YESNO);
  applyValidationToColumn_('ProductSubmissions','RelaxationFor', FM_STATUS.RELAXATION_FOR);
  applyValidationToColumn_('ProductSubmissions','ComplianceRiskLevel', FM_STATUS.RISK);
  applyValidationToColumn_('HubApplications','Status', FM_STATUS.SELLER);
  applyValidationToColumn_('Hubs','Status', FM_STATUS.ACTIVE);
  applyValidationToColumn_('Hubs','PickupAvailable', FM_STATUS.YESNO);
  applyValidationToColumn_('Hubs','HomeDeliveryAvailable', FM_STATUS.YESNO);
  applyValidationToColumn_('Orders','OrderStatus', FM_STATUS.ORDER);
  applyValidationToColumn_('Orders','PaymentMode', FM_PAYMENT_MODES);
  applyValidationToColumn_('Orders','PaymentStatus', FM_STATUS.PAYMENT);
  applyValidationToColumn_('Payments','PaymentMode', FM_PAYMENT_MODES);
  applyValidationToColumn_('Payments','PaymentStatus', FM_STATUS.PAYMENT);
  applyValidationToColumn_('PaymentVerifications','PaymentMode', FM_PAYMENT_MODES);
  applyValidationToColumn_('PaymentVerifications','VerificationStatus', ['Pending Verification','Verified','Rejected']);
  applyValidationToColumn_('Receipts','PaymentMode', ['UPI','Freshly Mart UPI','UPI Online','UPI on Delivery','UPI at Hub Pickup']);
  applyValidationToColumn_('Receipts','PaymentStatus', FM_STATUS.PAYMENT.concat(['Paid','Pending','Completed']));
  ['SellerSettlements','SupplierPayments','HubSettlements','DeliverySettlements'].forEach(function(sn){ applyValidationToColumn_(sn,'SettlementStatus',['Pending','Paid','Hold','Cancelled']); });
  applyValidationToColumn_('ExpenseTracker','PaymentStatus',['Pending','Paid','Cancelled']);
  applyValidationToColumn_('Returns','ReturnStatus', FM_STATUS.RETURN);
  applyValidationToColumn_('Refunds','RefundStatus', FM_STATUS.REFUND);
  applyValidationToColumn_('Reviews','Status', FM_STATUS.REVIEW);
  applyValidationToColumn_('Referrals','Status', ['Pending','Approved','Rewarded','Rejected']);
  applyValidationToColumn_('Contacts','Status', ['New','In Progress','Closed']);
  logActivity_('applyBackendValidations','Admin','Dropdown validations applied');
  if(showAlert !== false) safeUiAlert_('Dropdown validations applied to backend sheets.');
}

function applyValidationToColumn_(sheetName, headerName, list){
  const sh = sheet_(sheetName);
  const headers = sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0];
  const idx = headers.indexOf(headerName);
  if(idx === -1) return;
  const rule = SpreadsheetApp.newDataValidation().requireValueInList(list, true).setAllowInvalid(true).build();
  sh.getRange(2, idx+1, Math.max(sh.getMaxRows()-1, 1), 1).setDataValidation(rule);
}

function validateBackendData(){
  const result = validateBackendData_(true);
  safeUiAlert_(result.message);
}

function validateBackendData_(log){
  clearSheetData_('ValidationErrors');
  const errors = [];
  validateProducts_(errors);
  validateSellers_(errors);
  validateHubs_(errors);
  validateOrders_(errors);
  validatePayments_(errors);
  validateProductSubmissions_(errors);
  validateBanners_(errors);
  errors.forEach(function(e,idx){ appendObject_('ValidationErrors', Object.assign({ErrorID:'ERR'+idStamp_()+idx, DateTime:new Date(), Status:'Open'}, e)); });
  if(log !== false) logActivity_('validateBackendData','Admin','Errors found '+errors.length);
  return {ok:true,message:'Backend validation completed. Issues found: '+errors.length+'. Check ValidationErrors sheet.', errorCount:errors.length};
}

function addError_(errors, sheet, row, field, issue, value, severity){
  errors.push({SheetName:sheet, RowNumber:row, Field:field, Issue:issue, Value:value, Severity:severity || 'Error'});
}

function validateProducts_(errors){
  rowsAsObjectsWithRow_('Products').forEach(function(r){
    if(!r.ProductID) addError_(errors,'Products',r.__row,'ProductID','Missing ProductID',r.ProductID);
    if(!r.ProductName) addError_(errors,'Products',r.__row,'ProductName','Missing product name',r.ProductName);
    if(!r.Category) addError_(errors,'Products',r.__row,'Category','Missing category',r.Category);
    if(toNumber_(r.SellingPrice) <= 0) addError_(errors,'Products',r.__row,'SellingPrice','Selling price must be greater than zero',r.SellingPrice);
    if(toNumber_(r.Stock) < 0) addError_(errors,'Products',r.__row,'Stock','Stock cannot be negative',r.Stock);
    if(r.Status && FM_STATUS.PRODUCT_PUBLIC.indexOf(String(r.Status)) === -1) addError_(errors,'Products',r.__row,'Status','Invalid product status',r.Status,'Warning');
  });
}

function validateSellers_(errors){
  rowsAsObjectsWithRow_('Sellers').forEach(function(r){
    if(!r.SellerID) addError_(errors,'Sellers',r.__row,'SellerID','Missing SellerID',r.SellerID);
    if(!r.BusinessName) addError_(errors,'Sellers',r.__row,'BusinessName','Missing business name',r.BusinessName);
    if(r.Phone && !isValidPhone_(r.Phone)) addError_(errors,'Sellers',r.__row,'Phone','Invalid phone number',r.Phone);
    if(r.Pincode && !isValidPincode_(r.Pincode)) addError_(errors,'Sellers',r.__row,'Pincode','Invalid pincode',r.Pincode);
    if(r.Status && FM_STATUS.SELLER.indexOf(String(r.Status)) === -1) addError_(errors,'Sellers',r.__row,'Status','Invalid seller status',r.Status,'Warning');
    const foodSeller = isFoodRelatedSeller_(r);
    const gstOk = sellerGSTIsAcceptable_(r);
    if(!gstOk) addError_(errors,'Sellers',r.__row,'GSTNumber','GST is mandatory for seller approval unless admin relaxation is valid.',r.GSTNumber || '');
    if(String(r.Status || '').toLowerCase() === 'approved' && !gstOk) addError_(errors,'Sellers',r.__row,'GSTStatus','Approved seller must have GST or valid GST relaxation.',r.GSTStatus || '');
    if(foodSeller && !hasFSSAINumber_(r.FSSAINumber) && !hasValidComplianceRelaxation_(r, 'FSSAI')) addError_(errors,'Sellers',r.__row,'FSSAINumber','FSSAI is mandatory for food-related seller approval unless admin relaxation is valid.',r.FSSAINumber);
    if(foodSeller && String(r.Status || '').toLowerCase() === 'approved' && !sellerFSSAIIsAcceptable_(r)) addError_(errors,'Sellers',r.__row,'FSSAIStatus','Approved food-related seller must have acceptable FSSAI status or valid FSSAI relaxation.',r.FSSAIStatus || '');
    if(String(r.ComplianceRelaxation || '').toLowerCase() === 'yes' && !hasValidComplianceRelaxation_(r, r.RelaxationFor || 'Both')) addError_(errors,'Sellers',r.__row,'RelaxationValidUntil','Compliance relaxation must have reason, approved by, risk level, and valid future date.',r.RelaxationValidUntil || '');
  });
}

function validateHubs_(errors){
  rowsAsObjectsWithRow_('Hubs').forEach(function(r){
    if(!r.HubID) addError_(errors,'Hubs',r.__row,'HubID','Missing HubID',r.HubID);
    if(!r.HubName) addError_(errors,'Hubs',r.__row,'HubName','Missing HubName',r.HubName);
    if(r.Pincode && !isValidPincode_(r.Pincode)) addError_(errors,'Hubs',r.__row,'Pincode','Invalid pincode',r.Pincode);
    if(r.DeliveryCharge && toNumber_(r.DeliveryCharge) < 0) addError_(errors,'Hubs',r.__row,'DeliveryCharge','Delivery charge cannot be negative',r.DeliveryCharge);
  });
}

function validateOrders_(errors){
  rowsAsObjectsWithRow_('Orders').forEach(function(r){
    if(!r.OrderID) addError_(errors,'Orders',r.__row,'OrderID','Missing OrderID',r.OrderID);
    if(!r.CustomerName) addError_(errors,'Orders',r.__row,'CustomerName','Missing customer name',r.CustomerName);
    if(r.Phone && !isValidPhone_(r.Phone)) addError_(errors,'Orders',r.__row,'Phone','Invalid phone number',r.Phone);
    if(r.Pincode && !isValidPincode_(r.Pincode)) addError_(errors,'Orders',r.__row,'Pincode','Invalid pincode',r.Pincode);
    if(toNumber_(r.GrandTotal) <= 0) addError_(errors,'Orders',r.__row,'GrandTotal','Grand total should be greater than zero',r.GrandTotal,'Warning');
    if(r.OrderStatus && FM_STATUS.ORDER.indexOf(String(r.OrderStatus)) === -1) addError_(errors,'Orders',r.__row,'OrderStatus','Invalid order status',r.OrderStatus,'Warning');
    if(r.PaymentMode && FM_PAYMENT_MODES.indexOf(String(r.PaymentMode)) === -1) addError_(errors,'Orders',r.__row,'PaymentMode','Invalid payment mode. Only UPI Online, UPI on Delivery, and UPI at Hub Pickup are allowed. Cash/COD is not allowed.',r.PaymentMode,'Error');
    if(r.PaymentStatus && FM_STATUS.PAYMENT.indexOf(String(r.PaymentStatus)) === -1) addError_(errors,'Orders',r.__row,'PaymentStatus','Invalid payment status',r.PaymentStatus,'Warning');
  });
}


function validatePayments_(errors){
  rowsAsObjectsWithRow_('Payments').forEach(function(r){
    if(!r.PaymentID) addError_(errors,'Payments',r.__row,'PaymentID','Missing PaymentID',r.PaymentID);
    if(r.PaymentMode && FM_PAYMENT_MODES.indexOf(String(r.PaymentMode)) === -1) addError_(errors,'Payments',r.__row,'PaymentMode','Invalid payment mode. Only Freshly Mart UPI payment modes are allowed.',r.PaymentMode,'Error');
    if(r.PaymentStatus && FM_STATUS.PAYMENT.indexOf(String(r.PaymentStatus)) === -1) addError_(errors,'Payments',r.__row,'PaymentStatus','Invalid payment status',r.PaymentStatus,'Warning');
    if(String(r.CollectedBy || '').toLowerCase().indexOf('cash') !== -1) addError_(errors,'Payments',r.__row,'CollectedBy','Cash collection is not allowed. Use Freshly Mart UPI only.',r.CollectedBy,'Error');
  });
}

function validateProductSubmissions_(errors){
  rowsAsObjectsWithRow_('ProductSubmissions').forEach(function(r){
    if(!r.SubmissionID) addError_(errors,'ProductSubmissions',r.__row,'SubmissionID','Missing SubmissionID',r.SubmissionID);
    if(!r.SellerID) addError_(errors,'ProductSubmissions',r.__row,'SellerID','Missing SellerID',r.SellerID);
    if(!r.ProductName) addError_(errors,'ProductSubmissions',r.__row,'ProductName','Missing product name',r.ProductName);
    if(toNumber_(r.SellingPrice) <= 0) addError_(errors,'ProductSubmissions',r.__row,'SellingPrice','Selling price must be greater than zero',r.SellingPrice);
    const seller = r.SellerID ? findRowObject_('Sellers','SellerID',r.SellerID) : null;
    const foodRelated = isFoodRelatedProduct_(r, seller || {});
    if(!seller || !sellerGSTIsAcceptable_(seller)) addError_(errors,'ProductSubmissions',r.__row,'GSTValidated','Product cannot be approved until seller has mandatory GST or valid admin relaxation.',r.GSTValidated || 'No');
    if(foodRelated && (!seller || !sellerFSSAIIsAcceptable_(seller))) addError_(errors,'ProductSubmissions',r.__row,'FSSAIValidated','Food-related product cannot be approved until seller has mandatory FSSAI details or valid admin relaxation.',r.FSSAIValidated || 'No');
  });
}

function validateBanners_(errors){
  rowsAsObjectsWithRow_('Banners').forEach(function(r){
    if(!r.BannerID) addError_(errors,'Banners',r.__row,'BannerID','Missing BannerID',r.BannerID);
    if(!r.Title) addError_(errors,'Banners',r.__row,'Title','Missing title',r.Title);
    if(r.Status && FM_STATUS.ACTIVE.indexOf(String(r.Status)) === -1) addError_(errors,'Banners',r.__row,'Status','Invalid banner status',r.Status,'Warning');
  });
}

/* ----------------------------- Safe archive & clearing ----------------------------- */

function archiveOldCompletedOrdersPrompt(){
  const ui = SpreadsheetApp.getUi();
  const res = ui.alert('Archive Completed Orders', 'This will copy Delivered/Cancelled/Refunded orders older than 30 days to archive sheets and remove them from Orders/OrderItems. Continue?', ui.ButtonSet.YES_NO);
  if(res !== ui.Button.YES) return;
  const result = archiveCompletedOrdersOlderThanDays_(30);
  ui.alert(result.message);
}

function archiveCompletedOrdersOlderThanDays_(days){
  ensureSheet_('OrderArchive', FM_SHEETS.Orders.concat(['ArchivedAt']));
  ensureSheet_('OrderItemsArchive', FM_SHEETS.OrderItems.concat(['ArchivedAt']));
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const orderRows = rowsAsObjectsWithRow_('Orders').filter(function(o){
    const st = String(o.OrderStatus || '').toLowerCase();
    const dt = parseDate_(o.DateTime);
    return ['delivered','cancelled','refunded'].indexOf(st) !== -1 && dt && dt < cutoff;
  });
  const ids = {};
  orderRows.forEach(function(o){ ids[o.OrderID] = true; });
  const itemRows = rowsAsObjectsWithRow_('OrderItems').filter(function(it){ return ids[it.OrderID]; });
  orderRows.forEach(function(o){ const copy = Object.assign({}, o); delete copy.__row; copy.ArchivedAt = new Date(); appendObject_('OrderArchive', copy); });
  itemRows.forEach(function(it){ const copy = Object.assign({}, it); delete copy.__row; copy.ArchivedAt = new Date(); appendObject_('OrderItemsArchive', copy); });
  deleteRowsByRowNumbers_('OrderItems', itemRows.map(function(r){ return r.__row; }));
  deleteRowsByRowNumbers_('Orders', orderRows.map(function(r){ return r.__row; }));
  appendObject_('ClearLog', {ClearID:'CLR'+idStamp_(), DateTime:new Date(), Action:'ArchiveCompletedOrders', SheetName:'Orders/OrderItems', RowsAffected:orderRows.length, DoneBy:'Admin', Remarks:'Archived completed orders older than '+days+' days'});
  logActivity_('archiveCompletedOrders','Admin','Orders archived '+orderRows.length+', items '+itemRows.length);
  return {ok:true,message:'Archived '+orderRows.length+' completed order(s) and '+itemRows.length+' order item row(s).'};
}

function clearValidationErrorsPrompt(){
  const ui = SpreadsheetApp.getUi();
  const res = ui.alert('Clear Validation Errors', 'This will clear rows from ValidationErrors sheet only. Continue?', ui.ButtonSet.YES_NO);
  if(res !== ui.Button.YES) return;
  const rows = clearSheetData_('ValidationErrors');
  appendObject_('ClearLog', {ClearID:'CLR'+idStamp_(), DateTime:new Date(), Action:'ClearValidationErrors', SheetName:'ValidationErrors', RowsAffected:rows, DoneBy:'Admin', Remarks:'Validation errors cleared'});
  ui.alert('ValidationErrors cleared. Rows removed: '+rows);
}

function clearReportOutputSheetsPrompt(){
  const ui = SpreadsheetApp.getUi();
  const res = ui.alert('Clear Report Output Sheets', 'This will clear DailyOrderReports, SellerStatements, HubStatements and CustomerStatements only. Master data will not be touched. Continue?', ui.ButtonSet.YES_NO);
  if(res !== ui.Button.YES) return;
  const names = ['DailyOrderReports','SellerStatements','HubStatements','CustomerStatements'];
  let total = 0;
  names.forEach(function(name){ total += clearSheetData_(name); });
  appendObject_('ClearLog', {ClearID:'CLR'+idStamp_(), DateTime:new Date(), Action:'ClearReportOutputs', SheetName:names.join(','), RowsAffected:total, DoneBy:'Admin', Remarks:'Report output sheets cleared'});
  ui.alert('Report output sheets cleared. Rows removed: '+total);
}

function clearSheetData_(sheetName){
  const sh = sheet_(sheetName);
  const rows = Math.max(sh.getLastRow()-1,0);
  if(rows > 0) sh.getRange(2,1,rows,Math.max(sh.getLastColumn(),1)).clearContent();
  return rows;
}

/* ----------------------------- Helpers ----------------------------- */

function getLiveProducts_(){
  return rowsAsObjects_('Products').filter(function(r){ return String(r.Status || '').toLowerCase() === 'live' || String(r.Status || '').toLowerCase() === 'active'; });
}

function activeRows_(name){
  return rowsAsObjects_(name).filter(function(r){ return String(r.Status || '').toLowerCase() !== 'inactive' && String(r.Status || '').toLowerCase() !== 'hidden'; });
}

function rowsAsObjects_(name){
  const sh = sheet_(name);
  const values = getData_(sh);
  if(values.length < 2) return [];
  const headers = values[0];
  return values.slice(1).filter(function(row){ return row.some(function(v){ return v !== ''; }); }).map(function(row){
    const obj = {};
    headers.forEach(function(h,i){ obj[h] = row[i]; });
    return obj;
  });
}

function rowsAsObjectsWithRow_(name){
  const sh = sheet_(name);
  const values = getData_(sh);
  if(values.length < 2) return [];
  const headers = values[0];
  return values.slice(1).map(function(row,idx){
    const obj = {__row: idx+2};
    headers.forEach(function(h,i){ obj[h] = row[i]; });
    return obj;
  }).filter(function(obj){ return Object.keys(obj).some(function(k){ return k !== '__row' && obj[k] !== ''; }); });
}

function getData_(sh){
  const lastRow = Math.max(sh.getLastRow(), 1);
  const lastCol = Math.max(sh.getLastColumn(), 1);
  return sh.getRange(1,1,lastRow,lastCol).getValues();
}

function appendObject_(sheetName, obj){
  const sh = sheet_(sheetName);
  const headers = sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0];
  const row = headers.map(function(h){ return obj[h] !== undefined ? obj[h] : ''; });
  sh.appendRow(row);
}

function findRowObject_(sheetName, idField, idValue){
  return rowsAsObjects_(sheetName).find(function(r){ return String(r[idField]) === String(idValue); });
}

function updateRowById_(sheetName, idField, idValue, updates){
  const sh = sheet_(sheetName);
  const values = getData_(sh);
  const headers = values[0];
  const idCol = headers.indexOf(idField);
  if(idCol === -1) throw new Error('ID field not found: '+idField);
  for(let r=1;r<values.length;r++){
    if(String(values[r][idCol]) === String(idValue)){
      Object.keys(updates).forEach(function(k){
        const c = headers.indexOf(k);
        if(c !== -1) sh.getRange(r+1,c+1).setValue(updates[k]);
      });
      return true;
    }
  }
  throw new Error('Record not found: '+idValue);
}

function deleteRowsByRowNumbers_(sheetName, rowNumbers){
  const sh = sheet_(sheetName);
  rowNumbers.sort(function(a,b){ return b-a; }).forEach(function(row){ if(row > 1) sh.deleteRow(row); });
}

function sheet_(name){
  const ss = SpreadsheetApp.getActive();
  let sh = ss.getSheetByName(name);
  if(!sh){
    sh = ss.insertSheet(name);
    const headers = FM_SHEETS[name] || ['ID','DateTime','Data'];
    sh.getRange(1,1,1,headers.length).setValues([headers]);
    sh.setFrozenRows(1);
  }
  return sh;
}

function getSetting_(name){
  const rows = rowsAsObjects_('Settings');
  const row = rows.find(function(r){ return String(r.SettingName).trim() === String(name).trim(); });
  return row ? row.Value : '';
}



function gstApprovalMode_(){
  return String(getSetting_('GSTApprovalMode') || 'Number Required').trim().toLowerCase();
}

function complianceRelaxationEnabled_(){
  return String(getSetting_('AllowComplianceRelaxation') || 'Yes').trim().toLowerCase() !== 'no';
}

function hasGSTNumber_(v){
  const s = String(v || '').trim().toUpperCase().replace(/\s+/g,'');
  // GSTIN is normally 15 characters. Keep this light so admin can verify separately.
  return /^[0-9]{2}[A-Z0-9]{13}$/.test(s) || s.length === 15;
}

function hasValidComplianceRelaxation_(obj, docType){
  obj = obj || {};
  if(!complianceRelaxationEnabled_()) return false;
  if(String(obj.ComplianceRelaxation || '').trim().toLowerCase() !== 'yes') return false;
  const forText = String(obj.RelaxationFor || '').trim().toLowerCase();
  const doc = String(docType || '').trim().toLowerCase();
  if(!forText || forText === 'none' || !doc || doc === 'none') return false;
  const covers = forText === 'both' || forText === doc || (doc === 'both' && (forText === 'gst' || forText === 'fssai' || forText === 'both'));
  if(!covers) return false;
  if(!String(obj.RelaxationReason || '').trim()) return false;
  if(!String(obj.RelaxationApprovedBy || '').trim()) return false;
  if(!String(obj.ComplianceRiskLevel || '').trim()) return false;
  const expiry = parseDate_(obj.RelaxationValidUntil);
  if(!expiry) return false;
  const today = new Date(); today.setHours(0,0,0,0);
  expiry.setHours(23,59,59,999);
  return expiry.getTime() >= today.getTime();
}

function complianceUpdatesFromAdminRequest_(d, existing){
  d = d || {}; existing = existing || {};
  const updates = {};
  // Admin can grant/refresh relaxation from admin-dashboard.html manual approval forms.
  const relaxationForRequest = String(d.RelaxationFor || '').trim();
  const wantsRelaxation = String(d.ComplianceRelaxation || '').trim().toLowerCase() === 'yes' || (relaxationForRequest && relaxationForRequest.toLowerCase() !== 'none');
  if(wantsRelaxation){
    updates.ComplianceRelaxation = String(d.ComplianceRelaxation || 'Yes');
    updates.RelaxationFor = String(d.RelaxationFor || existing.RelaxationFor || 'Both');
    updates.RelaxationReason = String(d.RelaxationReason || existing.RelaxationReason || '').trim();
    updates.RelaxationValidUntil = d.RelaxationValidUntil || existing.RelaxationValidUntil || '';
    updates.RelaxationApprovedBy = String(d.RelaxationApprovedBy || existing.RelaxationApprovedBy || 'Admin').trim();
    updates.ComplianceRiskLevel = String(d.ComplianceRiskLevel || existing.ComplianceRiskLevel || 'Medium').trim();
  }
  // Admin can also update document/status fields during approval.
  ['GSTNumber','GSTStatus','GSTVerified','PANNumber','FSSAINumber','FSSAIStatus','FSSAIExpiryDate'].forEach(function(k){
    if(d[k] !== undefined && String(d[k]).trim() !== '') updates[k] = d[k];
  });
  return updates;
}

function sellerGSTIsAcceptable_(seller){
  seller = seller || {};
  if(String(seller.GSTRequired || 'Yes').trim().toLowerCase() === 'no') return true;
  if(hasGSTNumber_(seller.GSTNumber)){
    const status = String(seller.GSTStatus || '').trim().toLowerCase();
    if(status === 'rejected' || status === 'expired') return false;
    if(gstApprovalMode_() === 'verified required') return status === 'verified';
    return true;
  }
  return hasValidComplianceRelaxation_(seller, 'GST');
}

function validateSellerGSTForApproval_(seller){
  if(sellerGSTIsAcceptable_(seller)) return true;
  throw new Error('Seller approval blocked. GST is mandatory by default. Update GSTNumber/GSTStatus or approve with compliance relaxation reason, approved by, risk level, and valid-until date.');
}

function validateSellerGSTForProductApproval_(seller, product){
  if(sellerGSTIsAcceptable_(seller)) return true;
  throw new Error('Product approval blocked. Seller must have GST or valid GST relaxation before product can go live.');
}

function complianceApprovalRemark_(seller, foodSeller){
  const parts = [];
  if(sellerGSTIsAcceptable_(seller)) parts.push('GST checked/relaxed');
  if(foodSeller && sellerFSSAIIsAcceptable_(seller)) parts.push('FSSAI checked/relaxed');
  if(String(seller.ComplianceRelaxation || '').toLowerCase() === 'yes') parts.push('Compliance relaxation: '+(seller.RelaxationFor || 'Both')+' until '+(seller.RelaxationValidUntil || 'not set'));
  return parts.length ? 'Approved. '+parts.join('. ') : 'Approved';
}

function fssaiApprovalMode_(){
  return String(getSetting_('FSSAIApprovalMode') || 'Number Required').trim().toLowerCase();
}

function foodKeywordText_(obj){
  obj = obj || {};
  return [obj.Category, obj.SubCategory, obj.BusinessType, obj.ProductName, obj.Description, obj.Brand].join(' ').toLowerCase();
}

function isFoodRelatedSeller_(seller){
  const text = foodKeywordText_(seller);
  return isFoodRelatedText_(text);
}

function isFoodRelatedProduct_(product, seller){
  product = product || {};
  seller = seller || {};
  if(String(product.FoodRelated || '').toLowerCase() === 'yes') return true;
  const text = foodKeywordText_(product);
  if(isFoodRelatedText_(text)) return true;
  // If the product category is unclear but seller is explicitly food-related, treat it as food-related.
  if(!product.Category && isFoodRelatedSeller_(seller)) return true;
  return false;
}

function isFoodRelatedText_(text){
  text = String(text || '').toLowerCase();
  const exactOrPhrase = [
    'fresh item','fresh-items','fresh fish','fish','seafood','fresh meat','meat','chicken','mutton','beef',
    'fruits','vegetables','fruit','vegetable','fresh food','food','bakery','dairy','milk','curd','ghee',
    'grocery','groceries','packaged food','homemade food','restaurant','cloud kitchen','catering',
    'snacks','beverages','juice','tea','coffee','spices','rice','oil','pulses','sugar','flour',
    'health drink','herbal drink','ayurveda food','nutraceutical','supplement food'
  ];
  return exactOrPhrase.some(function(k){ return text.indexOf(k) !== -1; });
}

function hasFSSAINumber_(v){
  const s = String(v || '').trim();
  return s.length >= 6;
}

function sellerFSSAIIsAcceptable_(seller){
  seller = seller || {};
  if(String(seller.FSSAIRequired || '').trim().toLowerCase() === 'no' && !isFoodRelatedSeller_(seller)) return true;
  if(hasFSSAINumber_(seller.FSSAINumber)){
    const status = String(seller.FSSAIStatus || '').trim().toLowerCase();
    if(status === 'rejected' || status === 'expired') return false;
    if(fssaiApprovalMode_() === 'verified required') return status === 'verified';
    return true;
  }
  return hasValidComplianceRelaxation_(seller, 'FSSAI');
}

function validateSellerFSSAIForApproval_(seller){
  if(!isFoodRelatedSeller_(seller)) return true;
  if(sellerFSSAIIsAcceptable_(seller)) return true;
  throw new Error('Seller approval blocked. FSSAI is mandatory for food-related sellers. Update FSSAINumber/FSSAIStatus or approve with valid FSSAI/Both compliance relaxation.');
}

function validateSellerFSSAIForProductApproval_(seller, product){
  if(!isFoodRelatedProduct_(product, seller)) return true;
  if(sellerFSSAIIsAcceptable_(seller)) return true;
  throw new Error('Product approval blocked. Seller must have FSSAI or valid FSSAI relaxation for food-related products.');
}

function normalizeCategory_(cat){
  const m = {
    'Grocery':'grocery','Daily Essentials':'daily-essentials','Home Products':'home-products','Fashion':'fashion','Stationery':'stationery','Electronics Accessories':'electronics-accessories','Wellness Products':'wellness','Local Store Products':'local-stores'
  };
  return m[cat] || String(cat || '').toLowerCase().replace(/\s+/g,'-');
}

function formatItemsForPrint_(items){
  if(!items) return '';
  try{
    const arr = typeof items === 'string' ? JSON.parse(items) : items;
    if(Array.isArray(arr)) return arr.map(function(it,i){ return (i+1)+'. '+(it.ProductName || it.name || it.ProductID || 'Item')+' x '+(it.qty || it.Quantity || 1); }).join('\n');
  }catch(err){}
  return String(items);
}

function objectBy_(rows, key){
  const obj = {};
  rows.forEach(function(r){ obj[String(r[key] || '')] = r; });
  return obj;
}

function sum_(arr){ return arr.reduce(function(a,b){ return a + toNumber_(b); }, 0); }
function toNumber_(v){ const n = Number(String(v || 0).replace(/[^0-9.-]/g,'')); return isNaN(n) ? 0 : n; }
function cleanPhone_(v){ return String(v || '').replace(/\D/g,'').slice(-10); }
function isValidPhone_(v){ return /^\d{10}$/.test(cleanPhone_(v)); }
function isValidPincode_(v){ return /^\d{6}$/.test(String(v || '').replace(/\D/g,'')); }
function validatePhone_(v, field){ if(!isValidPhone_(v)) throw new Error(field+' must be a valid 10-digit mobile number.'); }
function validatePincode_(v){ if(!isValidPincode_(v)) throw new Error('Pincode must be a valid 6-digit pincode.'); }
function validatePositiveNumber_(v, field){ if(toNumber_(v) <= 0) throw new Error(field+' must be greater than zero.'); }
function validateNonNegativeNumber_(v, field){ if(toNumber_(v) < 0) throw new Error(field+' cannot be negative.'); }
function validateRating_(v, field){ const n = toNumber_(v); if(n < 1 || n > 5) throw new Error(field+' must be between 1 and 5.'); }
function validateRequired_(d, fields, formName){
  const missing = fields.filter(function(f){ return d[f] === undefined || String(d[f]).trim() === ''; });
  if(missing.length) throw new Error(formName+' missing required field(s): '+missing.join(', '));
}

function orderMatchesCustomer_(orderId, phone){
  const order = findRowObject_('Orders','OrderID',orderId);
  return !!order && cleanPhone_(order.Phone) === cleanPhone_(phone);
}

function idStamp_(){ return Utilities.formatDate(new Date(), FM_TIMEZONE, 'yyMMddHHmmssSSS'); }
function today_(){ return Utilities.formatDate(new Date(), FM_TIMEZONE, 'yyyy-MM-dd'); }
function currentMonthRange_(){
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth()+1, 0);
  return {start: Utilities.formatDate(start, FM_TIMEZONE, 'yyyy-MM-dd'), end: Utilities.formatDate(end, FM_TIMEZONE, 'yyyy-MM-dd')};
}
function dateKey_(v){
  const d = parseDate_(v);
  return d ? Utilities.formatDate(d, FM_TIMEZONE, 'yyyy-MM-dd') : '';
}
function parseDate_(v){
  if(v instanceof Date && !isNaN(v.getTime())) return v;
  if(!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

function formatSlotTime_(v){
  if(v instanceof Date && !isNaN(v.getTime())){
    return Utilities.formatDate(v, FM_TIMEZONE, 'hh:mm a');
  }
  const raw = String(v || '').trim();
  if(!raw) return '';

  // If a previous sheet format converted a time-only value into a full 1899 date string,
  // still return only the time portion for website dropdowns.
  const parsed = new Date(raw);
  if(!isNaN(parsed.getTime()) && /\d{1,2}:\d{2}|am|pm/i.test(raw)){
    return Utilities.formatDate(parsed, FM_TIMEZONE, 'hh:mm a');
  }

  const match = raw.match(/(\d{1,2})[:.](\d{2})\s*(AM|PM|am|pm)?/);
  if(match){
    let h = Number(match[1]);
    const m = match[2];
    let ap = match[3] ? match[3].toUpperCase() : '';
    if(!ap){
      ap = h >= 12 ? 'PM' : 'AM';
      if(h > 12) h -= 12;
      if(h === 0) h = 12;
    }
    return String(h).padStart(2,'0') + ':' + m + ' ' + ap;
  }
  return raw;
}
function sanitizeSheetName_(name){ return String(name || 'Sheet').replace(/[\\\/\?\*\[\]\:]/g,'_'); }
function logActivity_(action, user, details){
  try{ appendObject_('ActivityLog', {LogID:'LOG'+idStamp_(), DateTime:new Date(), Action:action, User:user, Details:details}); }catch(err){}
}
function safeUiAlert_(msg){
  try{ SpreadsheetApp.getUi().alert(String(msg)); }catch(err){ Logger.log(msg); }
}
function json_(obj){ return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }
