// Supply Contract Template
// قالب عقد التوريد

import { ContractTemplate } from '../types'

export const supplyContractTemplate: Omit<ContractTemplate, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'usageCount'> = {
  name: 'عقد توريد المنتجات',
  description: 'قالب العقد الخاص بتوريد الشطة والكاتشب للمطاعم',
  type: 'supply',
  version: '1.0',
  isActive: true,
  
  sections: [
    {
      id: 'header',
      title: 'رأس العقد',
      order: 1,
      required: true,
      content: `
# عقد توريد المنتجات الغذائية

**رقم العقد:** {{contract.contractNumber}}  
**تاريخ العقد:** {{contract.createdAt}}

## أطراف العقد:

**الطرف الأول (لاند سبايس - المورد):**
- الاسم التجاري: {{landspice.name}}
- الاسم القانوني: {{landspice.legalName}}
- السجل التجاري: {{landspice.registrationNumber}}
- الممثل القانوني: {{landspice.representative.name}} - {{landspice.representative.position}}
- الهاتف: {{landspice.representative.phone}}
- البريد الإلكتروني: {{landspice.representative.email}}

**الطرف الثاني (المطعم - العميل):**
- الاسم التجاري: {{restaurant.name}}
- الاسم القانوني: {{restaurant.legalName}}
- السجل التجاري: {{restaurant.registrationNumber}}
- الممثل القانوني: {{restaurant.representative.name}} - {{restaurant.representative.position}}
- الهاتف: {{restaurant.representative.phone}}
- البريد الإلكتروني: {{restaurant.representative.email}}
- العنوان الرئيسي: {{restaurant.mainAddress}}
      `,
      variables: [
        'contract.contractNumber', 'contract.createdAt', 'landspice.name',
        'landspice.legalName', 'landspice.registrationNumber', 
        'landspice.representative.name', 'landspice.representative.position',
        'landspice.representative.phone', 'landspice.representative.email',
        'restaurant.name', 'restaurant.legalName', 'restaurant.registrationNumber',
        'restaurant.representative.name', 'restaurant.representative.position',
        'restaurant.representative.phone', 'restaurant.representative.email',
        'restaurant.mainAddress'
      ]
    },
    
    {
      id: 'products_services',
      title: 'المنتجات والخدمات',
      order: 2,
      required: true,
      content: `
## المنتجات والخدمات المتعاقد عليها

### 1. المنتجات الأساسية:
| المنتج | الحجم | الكمية الشهرية | المواصفات |
|--------|-------|----------------|-----------|
| شطة مخصصة | 10 مل | {{supply.monthlyChiliQuantity}} عبوة | {{supply.chiliSpecs}} |
| كاتشب مخصص | 10 مل | {{supply.monthlyKetchupQuantity}} عبوة | {{supply.ketchupSpecs}} |

**إجمالي الحصة الشهرية:** {{supply.totalMonthlyQuantity}} عبوة  
**الحصة السنوية المتوقعة:** {{supply.annualQuantity}} عبوة

### 2. خصائص المنتجات:
- **الشطة:** مزيج متوازن من الطماطم والفلفل الحار، مستوى الحرارة {{supply.chiliHeatLevel}}
- **الكاتشب:** كاتشب طماطم طبيعي بدون مواد حافظة ضارة
- **العبوات:** مطبوعة بشعار المطعم واسمه ومعلومات الاتصال
- **مدة الصلاحية:** {{supply.shelfLife}} شهر من تاريخ التصنيع

### 3. معايير الجودة:
- مطابقة للمواصفات السعودية للسلامة الغذائية
- خالية من المواد المسرطنة والمضرة بالصحة
- معبأة في بيئة صحية ومعقمة
- حاصلة على شهادات الجودة المطلوبة (SFDA)

### 4. خدمات إضافية:
- توصيل مجاني لجميع فروع المطعم
- استبدال فوري للمنتجات المنتهية الصلاحية
- دعم فني وخدمة عملاء على مدار الساعة
- تقارير شهرية عن الاستهلاك والمخزون
      `,
      variables: [
        'supply.monthlyChiliQuantity', 'supply.chiliSpecs',
        'supply.monthlyKetchupQuantity', 'supply.ketchupSpecs',
        'supply.totalMonthlyQuantity', 'supply.annualQuantity',
        'supply.chiliHeatLevel', 'supply.shelfLife'
      ]
    },
    
    {
      id: 'delivery_schedule',
      title: 'جدول التوريد',
      order: 3,
      required: true,
      content: `
## جدول التوريد والتسليم

### 1. دورية التوريد:
- **التكرار:** {{schedule.frequency}} (شهرياً)
- **يوم التوريد:** {{schedule.deliveryDay}} من كل شهر
- **وقت التوريد:** {{schedule.deliveryTime}}
- **مدة التوريد:** {{schedule.deliveryDuration}} ساعة

### 2. مواقع التسليم:
{{#each restaurant.branches}}
| الفرع | العنوان | الكمية المطلوبة | جهة الاستلام |
|-------|---------|----------------|---------------|
| {{name}} | {{address.full}} | {{allocation.monthly}} عبوة | {{manager}} |
{{/each}}

### 3. إجراءات التسليم:
- إشعار مسبق قبل {{schedule.advanceNotice}} ساعة من موعد التوريد
- تأكيد موعد التسليم مع مسؤول كل فرع
- فحص المنتجات عند التسليم للتأكد من السلامة
- الحصول على توقيع استلام من المسؤول المعتمد

### 4. معالجة الطوارئ:
- في حالة الحاجة لكميات إضافية، الإشعار قبل {{schedule.emergencyNotice}} ساعة
- توريد طارئ خلال {{schedule.emergencyDelivery}} ساعة من الطلب
- رسوم إضافية {{schedule.emergencyFee}}% للتوريد الطارئ
- حد أقصى {{schedule.maxEmergencyQuantity}}% زيادة عن الحصة الشهرية

### 5. إدارة المخزون:
- متابعة مستويات المخزون في كل فرع أسبوعياً
- تنبيه تلقائي عند انخفاض المخزون لأقل من أسبوع
- إمكانية تعديل الكميات حسب الاستهلاك الفعلي
- تقرير شهري مفصل عن معدلات الاستهلاك
      `,
      variables: [
        'schedule.frequency', 'schedule.deliveryDay', 'schedule.deliveryTime',
        'schedule.deliveryDuration', 'schedule.advanceNotice', 
        'schedule.emergencyNotice', 'schedule.emergencyDelivery',
        'schedule.emergencyFee', 'schedule.maxEmergencyQuantity'
      ]
    },
    
    {
      id: 'pricing',
      title: 'الأسعار والدفع',
      order: 4,
      required: true,
      content: `
## الأسعار وشروط الدفع

### 1. الأسعار الثابتة:
| المنتج | سعر الوحدة | الكمية الشهرية | المبلغ الشهري |
|--------|-------------|----------------|---------------|
| شطة مخصصة | {{pricing.chiliUnitPrice}} {{contract.currency}} | {{supply.monthlyChiliQuantity}} | {{pricing.monthlyChiliTotal}} {{contract.currency}} |
| كاتشب مخصص | {{pricing.ketchupUnitPrice}} {{contract.currency}} | {{supply.monthlyKetchupQuantity}} | {{pricing.monthlyKetchupTotal}} {{contract.currency}} |
| **المجموع الشهري** | | | **{{pricing.monthlyTotal}} {{contract.currency}}** |

### 2. الرسوم الإضافية:
- رسوم التوصيل: **مجاناً** للكميات العادية
- التوريد الطارئ: {{schedule.emergencyFee}}% إضافية
- تغيير مواعيد التوريد: {{pricing.rescheduleeFee}} {{contract.currency}}
- خدمات إضافية: حسب الاتفاق المسبق

### 3. شروط الدفع:
- الدفع: {{payment.terms}} من تاريخ التسليم
- طريقة الدفع: {{payment.method}}
- العملة: {{contract.currency}}
- الخصم للدفع المبكر: {{payment.earlyPaymentDiscount}}% للدفع خلال {{payment.earlyPaymentDays}} أيام

### 4. الفوترة:
- إصدار فاتورة شهرية في {{billing.invoiceDay}} من كل شهر
- تفاصيل الفاتورة تشمل الكميات المسلمة والأسعار
- إرسال الفاتورة عبر البريد الإلكتروني والواتساب
- نسخة ورقية عند الطلب

### 5. تسوية المدفوعات:
- مراجعة الحسابات في نهاية كل شهر
- تسوية أي خلافات خلال {{payment.disputeResolution}} أيام
- غرامة التأخير: {{payment.lateFee}}% شهرياً على المبالغ المتأخرة
- إيقاف التوريد في حالة تأخر الدفع أكثر من {{payment.cutoffDays}} يوم
      `,
      variables: [
        'pricing.chiliUnitPrice', 'contract.currency', 'supply.monthlyChiliQuantity',
        'pricing.monthlyChiliTotal', 'pricing.ketchupUnitPrice', 
        'supply.monthlyKetchupQuantity', 'pricing.monthlyKetchupTotal',
        'pricing.monthlyTotal', 'schedule.emergencyFee', 'pricing.rescheduleeFee',
        'payment.terms', 'payment.method', 'payment.earlyPaymentDiscount',
        'payment.earlyPaymentDays', 'billing.invoiceDay', 'payment.disputeResolution',
        'payment.lateFee', 'payment.cutoffDays'
      ]
    },
    
    {
      id: 'quality_standards',
      title: 'معايير الجودة والسلامة',
      order: 5,
      required: true,
      content: `
## معايير الجودة والسلامة الغذائية

### 1. المعايير الأساسية:
- **مطابقة للمواصفات السعودية:** {{quality.saudiStandards}}
- **شهادة SFDA:** سارية المفعول وحديثة
- **معايير الهاسب (HACCP):** تطبيق كامل لنظام تحليل المخاطر
- **شهادة ISO 22000:** للسلامة الغذائية

### 2. إجراءات ضمان الجودة:
- **فحص يومي:** للمواد الخام والمنتج النهائي
- **اختبارات المختبر:** أسبوعياً للتأكد من السلامة الميكروبيولوجية
- **تتبع المنتج:** رقم دفعة (Batch Number) لكل منتج لتسهيل التتبع
- **سجلات الجودة:** توثيق كامل لجميع مراحل الإنتاج

### 3. معالجة المشاكل:
- **الاستجابة السريعة:** خلال {{quality.responseTime}} ساعة لأي شكوى جودة
- **السحب من السوق:** فوري لأي منتج مشكوك في سلامته
- **الاستبدال المجاني:** لأي منتج لا يلبي معايير الجودة
- **التحسين المستمر:** مراجعة شهرية للعمليات وتطوير الجودة

### 4. التخزين والنقل:
- **درجة حرارة التخزين:** {{storage.temperature}} درجة مئوية
- **الرطوبة:** أقل من {{storage.humidity}}%
- **التهوية:** مستودعات مكيفة ومجهزة بأنظمة تنقية الهواء
- **النظافة:** برنامج تطهير يومي للمعدات والمستودعات

### 5. التدريب والتأهيل:
- تدريب دوري للعاملين على معايير السلامة الغذائية
- شهادات تأهيل للعاملين في التصنيع والتعبئة
- برنامج تحديث مستمر للمعرفة والمهارات
- التزام كامل بلوائح وزارة الصحة السعودية

### 6. الضمانات:
- ضمان جودة {{quality.warrantyPeriod}} يوم من تاريخ التسليم
- ضمان استبدال فوري للمنتجات التالفة أو منتهية الصلاحية
- تأمين شامل ضد مخاطر التلوث والضرر
- تعويض مناسب في حالة الإضرار بسمعة المطعم
      `,
      variables: [
        'quality.saudiStandards', 'quality.responseTime', 'storage.temperature',
        'storage.humidity', 'quality.warrantyPeriod'
      ]
    },
    
    {
      id: 'termination',
      title: 'إنهاء العقد',
      order: 6,
      required: true,
      content: `
## شروط إنهاء وتجديد العقد

### 1. مدة العقد:
- **المدة الأساسية:** {{contract.duration}} شهر
- **تاريخ البداية:** {{contract.startDate}}
- **تاريخ الانتهاء:** {{contract.endDate}}
- **التجديد التلقائي:** {{contract.autoRenewal}} لمدة {{contract.renewalPeriod}} شهر

### 2. إنهاء العقد العادي:
- إشعار مسبق {{termination.noticePeriod}} يوم قبل انتهاء العقد
- تسوية جميع المستحقات المالية
- إعادة أي مواد أو معدات مستعارة
- إتمام جميع التوريدات المتفق عليها

### 3. إنهاء العقد المبكر:
**من قبل المطعم:**
- إشعار كتابي قبل {{termination.earlyNoticePeriod}} يوم
- دفع غرامة إنهاء مبكر {{termination.penaltyPercentage}}% من قيمة الفترة المتبقية
- تحمل تكاليف الإنتاج الجاري والمواد المحضرة

**من قبل لاند سبايس:**
- في حالة تأخر الدفع أكثر من {{termination.paymentGracePeriod}} يوم
- في حالة مخالفة شروط العقد المتكررة
- إشعار {{termination.supplierNoticePeriod}} يوم للمطعم

### 4. حالات القوة القاهرة:
- الكوارث الطبيعية والأوبئة
- الحروب والأزمات السياسية
- تعليق التراخيص الحكومية
- تعطل خطوط الإنتاج لأكثر من {{termination.forceMajeurePeriod}} يوم

### 5. التصفية النهائية:
- جرد المخزون المتبقي في فروع المطعم
- تسوية المبالغ المستحقة للطرفين
- إعادة أي عبوات فارغة أو معدات
- تسليم تقرير نهائي بالكميات والمبالغ
- توقيع محضر إنهاء العقد من الطرفين

### 6. ما بعد إنهاء العقد:
- التزام بالسرية لمدة {{termination.confidentialityPeriod}} شهر
- عدم منافسة مباشرة في نفس المنطقة لمدة {{termination.nonCompetePeriod}} شهر
- إمكانية العودة للتعاقد مرة أخرى بشروط جديدة
- الاحتفاظ بحقوق المطعم في استخدام تصاميمه الخاصة
      `,
      variables: [
        'contract.duration', 'contract.startDate', 'contract.endDate',
        'contract.autoRenewal', 'contract.renewalPeriod', 'termination.noticePeriod',
        'termination.earlyNoticePeriod', 'termination.penaltyPercentage',
        'termination.paymentGracePeriod', 'termination.supplierNoticePeriod',
        'termination.forceMajeurePeriod', 'termination.confidentialityPeriod',
        'termination.nonCompetePeriod'
      ]
    }
  ],
  
  defaultTerms: [
    {
      title: 'جودة المنتجات',
      description: 'التزام لاند سبايس بتوريد منتجات عالية الجودة',
      category: 'quality',
      mandatory: true,
      negotiable: false,
      defaultValue: 'مطابقة 100% للمواصفات السعودية'
    },
    {
      title: 'انتظام التوريد',
      description: 'التزام بمواعيد التوريد الشهرية',
      category: 'delivery',
      mandatory: true,
      negotiable: true,
      defaultValue: 'توريد في الموعد المحدد أو قبله'
    },
    {
      title: 'شروط الدفع',
      description: 'مواعيد وطرق سداد الفواتير',
      category: 'payment',
      mandatory: true,
      negotiable: true,
      defaultValue: '30 يوم من تاريخ الفاتورة'
    }
  ],
  
  defaultMilestones: [
    {
      title: 'تأكيد الطلب الشهري',
      description: 'تأكيد كميات ومواصفات الطلب للشهر القادم',
      dueDate: new Date(),
      completedDate: undefined,
      status: 'pending',
      responsible: 'restaurant',
      deliverables: ['تأكيد الكميات', 'تحديد مواقع التسليم'],
      dependencies: []
    },
    {
      title: 'تحضير المنتجات',
      description: 'إنتاج وتحضير المنتجات حسب الطلب',
      dueDate: new Date(),
      completedDate: undefined,
      status: 'pending',
      responsible: 'landspice',
      deliverables: ['منتجات جاهزة', 'شهادات جودة'],
      dependencies: ['تأكيد الطلب الشهري']
    },
    {
      title: 'التوريد والتسليم',
      description: 'توصيل المنتجات لجميع فروع المطعم',
      dueDate: new Date(),
      completedDate: undefined,
      status: 'pending',
      responsible: 'landspice',
      deliverables: ['منتجات مُسلّمة', 'إيصالات استلام'],
      dependencies: ['تحضير المنتجات']
    },
    {
      title: 'الفوترة والدفع',
      description: 'إصدار الفاتورة وتسوية المدفوعات',
      dueDate: new Date(),
      completedDate: undefined,
      status: 'pending',
      responsible: 'both',
      deliverables: ['فاتورة مُرسلة', 'دفعة مُستلمة'],
      dependencies: ['التوريد والتسليم']
    }
  ],
  
  legalReview: true,
  approvedBy: undefined,
  approvedAt: undefined
}
