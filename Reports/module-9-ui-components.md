# مكونات واجهة المستخدم المالية - الوحدة التاسعة

**الوحدة:** النظام المالي والمحاسبي  
**النطاق:** مكونات الواجهة التفاعلية والتجربة المالية  

---

## 🎨 مكونات واجهة المستخدم المالية المتقدمة

### **AccountingDashboard.tsx** (700+ سطر)
- **لوحة تحكم شاملة:** نظرة عامة على الوضع المالي
- **إحصائيات مالية:** 4 مؤشرات رئيسية للأداء المالي
- **الرسوم البيانية:** توزيع الحسابات واتجاهات الإيرادات والمصروفات
- **الإجراءات السريعة:** أزرار وصول سريع للعمليات الأساسية
- **ملخص ميزان المراجعة:** عرض سريع لحالة التوازن المحاسبي

#### **الميزات الرئيسية:**
- **مؤشرات الأداء المالي في الوقت الحقيقي**
- **رسوم بيانية تفاعلية مع Chart.js**  
- **تنبيهات ذكية للعمليات المهمة**
- **واجهة مستجيبة تعمل على جميع الأجهزة**

### **ChartOfAccounts.tsx** (800+ سطر)
- **عرض شجري تفاعلي:** هيكل هرمي للحسابات مع إمكانية التوسيع/الطي
- **3 أنماط عرض:** شجرة، جدول، مضغوط
- **بحث وفلترة متقدمة:** 4 معايير فلترة مختلفة
- **إحصائيات الحسابات:** ملخص لكل نوع حساب مع الأرصدة
- **إدارة الحسابات:** إضافة وتحرير وحذف الحسابات

#### **الميزات الرئيسية:**
- **شجرة تفاعلية مع Drag & Drop**
- **بحث ذكي بإكمال تلقائي**
- **فلترة متعددة المعايير (نوع، حالة، رصيد)**
- **تصدير شجرة الحسابات بصيغ متعددة**

### **JournalEntryForm.tsx** (650+ سطر)
- **نموذج قيد محاسبي متقدم:** إدخال القيود مع التحقق التلقائي
- **سطور القيد الديناميكية:** إضافة وحذف سطور القيد
- **التحقق من التوازن:** تحقق مباشر من توازن المدين والدائن
- **اختيار الحسابات:** قائمة منسدلة للحسابات المتاحة للترحيل
- **العملات المتعددة:** دعم عملات مختلفة مع أسعار الصرف

#### **الميزات الرئيسية:**
- **تحقق فوري من التوازن المحاسبي**
- **اقتراحات ذكية للحسابات**
- **حفظ كمسودة مع استكمال لاحق**
- **قوالب قيود جاهزة للعمليات المتكررة**

### **FinancialReports.tsx** (600+ سطر)
- **مركز التقارير المالية:** واجهة موحدة لجميع التقارير
- **ميزان المراجعة:** عرض مفصل مع التحقق من التوازن
- **قائمة الدخل:** تقرير الأرباح والخسائر مع هوامش الربح
- **اختيار الفترات:** فترات محددة مسبقاً أو فترات مخصصة
- **تصدير التقارير:** إمكانية تصدير بصيغ PDF وExcel وCSV

#### **الميزات الرئيسية:**
- **تقارير تفاعلية مع إمكانية الحفر العميق**
- **مقارنة فترات متعددة جنباً إلى جنب**
- **تصدير متقدم مع قوالب مخصصة**
- **طباعة محسنة للتقارير الرسمية**

---

## 🎯 تجربة المستخدم المتخصصة

### **لوحة التحكم الذكية**
```jsx
// Dashboard Financial KPIs
const FinancialKPIs = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard
        title="إجمالي الإيرادات"
        value={totalRevenue}
        trend={revenueTrend}
        color="green"
        icon={<TrendingUpIcon />}
      />
      <StatCard
        title="صافي الربح"
        value={netProfit}
        trend={profitTrend}
        color="blue"
        icon={<DollarSignIcon />}
      />
      <StatCard
        title="الأرصدة البنكية"
        value={bankBalance}
        trend={balanceTrend}
        color="purple"
        icon={<BankIcon />}
      />
      <StatCard
        title="الذمم المدينة"
        value={accountsReceivable}
        trend={receivablesTrend}
        color="orange"
        icon={<ReceiptIcon />}
      />
    </div>
  );
};
```

### **واجهة شجرة الحسابات**
```jsx
// Interactive Account Tree
const AccountTree = () => {
  const [viewMode, setViewMode] = useState('tree'); // tree | table | compact
  const [filter, setFilter] = useState({
    type: 'all',
    status: 'active',
    hasBalance: false,
    searchTerm: ''
  });

  return (
    <div className="space-y-4">
      <AccountTreeToolbar 
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        filter={filter}
        onFilterChange={setFilter}
      />
      
      {viewMode === 'tree' && (
        <TreeView
          accounts={filteredAccounts}
          expandedNodes={expandedNodes}
          onToggleNode={handleToggleNode}
          onAccountSelect={handleAccountSelect}
        />
      )}
    </div>
  );
};
```

### **نموذج القيود الذكي**
```jsx
// Smart Journal Entry Form
const JournalEntryForm = () => {
  const [entries, setEntries] = useState([
    { account: '', debit: 0, credit: 0, description: '' },
    { account: '', debit: 0, credit: 0, description: '' }
  ]);
  
  const totalDebit = entries.reduce((sum, entry) => sum + entry.debit, 0);
  const totalCredit = entries.reduce((sum, entry) => sum + entry.credit, 0);
  const isBalanced = totalDebit === totalCredit && totalDebit > 0;

  return (
    <form className="space-y-6">
      <JournalEntryHeader />
      
      <div className="space-y-2">
        {entries.map((entry, index) => (
          <JournalEntryLine
            key={index}
            entry={entry}
            onChange={(updatedEntry) => updateEntry(index, updatedEntry)}
            onRemove={() => removeEntry(index)}
            availableAccounts={availableAccounts}
          />
        ))}
      </div>
      
      <BalanceIndicator
        debit={totalDebit}
        credit={totalCredit}
        isBalanced={isBalanced}
      />
      
      <div className="flex justify-between">
        <Button onClick={addEntryLine}>إضافة سطر</Button>
        <Button 
          type="submit" 
          disabled={!isBalanced}
          className="bg-green-600 hover:bg-green-700"
        >
          حفظ القيد
        </Button>
      </div>
    </form>
  );
};
```

---

## 📊 مكونات التقارير التفاعلية

### **مكونات عرض البيانات**
- **DataTable:** جداول بيانات متقدمة مع فرز وفلترة
- **ChartComponents:** مكونات رسوم بيانية متخصصة
- **FilterPanel:** لوحة فلترة متقدمة مع معايير متعددة
- **ExportToolbar:** أدوات التصدير والطباعة

### **مكونات التفاعل**
- **DateRangePicker:** اختيار فترات مرنة
- **AccountSelector:** اختيار حسابات مع بحث ذكي  
- **CurrencyConverter:** تحويل عملات مع أسعار فورية
- **ReportTemplate:** قوالب تقارير قابلة للتخصيص

---

## 🎨 التصميم والتفاعل

### **نظام الألوان المالية**
```css
/* Financial Color Scheme */
:root {
  --color-profit: #10b981;      /* أخضر للأرباح */
  --color-loss: #ef4444;        /* أحمر للخسائر */
  --color-assets: #3b82f6;      /* أزرق للأصول */
  --color-liabilities: #f59e0b; /* برتقالي للخصوم */
  --color-equity: #8b5cf6;      /* بنفسجي لحقوق الملكية */
  --color-revenue: #06d6a0;     /* أخضر مائي للإيرادات */
  --color-expense: #f72585;     /* وردي للمصروفات */
}
```

### **أنماط التفاعل**
- **Hover Effects:** تأثيرات تفاعلية عند التمرير
- **Loading States:** حالات تحميل مع هياكل عظمية
- **Error Boundaries:** معالجة أخطاء محسنة مع رسائل واضحة  
- **Toast Notifications:** إشعارات فورية للعمليات

### **التجربة المحمولة**
- **تصميم متجاوب:** يعمل بكفاءة على الهواتف والأجهزة اللوحية
- **لمسات محسنة:** أزرار وعناصر تحكم مناسبة للمس
- **تخطيط تكيفي:** يعيد ترتيب العناصر حسب حجم الشاشة
- **أداء محسن:** تحميل سريع على الشبكات البطيئة

---

## 🔧 المكونات المساعدة

### **مكونات عامة**
- **LoadingSpinner:** مؤشر تحميل مخصص
- **EmptyState:** حالة فارغة مع دعوة للعمل  
- **ErrorAlert:** تنبيهات أخطاء مع حلول مقترحة
- **ConfirmDialog:** حوارات تأكيد للعمليات الحساسة

### **مكونات مالية متخصصة**
- **CurrencyDisplay:** عرض العملات مع الرموز المحلية
- **AccountBreadcrumb:** مسار التنقل في شجرة الحسابات  
- **BalanceIndicator:** مؤشر التوازن المحاسبي
- **TransactionStatus:** حالة المعاملات المالية

---

## 📚 الملفات ذات الصلة

- **[ملخص الوحدة](module-9-summary.md)** - الملخص العام والأهداف
- **[البنية التحتية](module-9-infrastructure.md)** - التفاصيل التقنية للخدمات
- **[الميزات اليمنية](module-9-yemeni-features.md)** - الخصائص المحلية اليمنية
- **[المواصفات التقنية](module-9-technical-specs.md)** - قائمة الملفات والإحصائيات
- **[الخاتمة](module-9-conclusion.md)** - حالة المشروع والخطوات التالية

---

**أعدّت بواسطة: ترس الشفرة-1**  
**18 سبتمبر 2025**
