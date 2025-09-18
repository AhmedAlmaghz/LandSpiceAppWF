// Design Contract Template
// قالب عقد التصميم

import { ContractTemplate } from '../types'

export const designContractTemplate: Omit<ContractTemplate, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'usageCount'> = {
  name: 'عقد تصميم العبوات',
  description: 'قالب العقد الخاص بتصميم وإعداد عبوات الشطة والكاتشب المطبوعة',
  type: 'design',
  version: '1.0',
  isActive: true,
  
  sections: [
    {
      id: 'header',
      title: 'رأس العقد',
      order: 1,
      required: true,
      content: `
# عقد تصميم العبوات المطبوعة

**رقم العقد:** {{contract.contractNumber}}  
**تاريخ العقد:** {{contract.createdAt}}

## أطراف العقد:

**الطرف الأول (لاند سبايس):**
- الاسم: {{landspice.name}}
- الاسم القانوني: {{landspice.legalName}}
- الممثل القانوني: {{landspice.representative.name}} - {{landspice.representative.position}}
- الهاتف: {{landspice.representative.phone}}
- البريد الإلكتروني: {{landspice.representative.email}}

**الطرف الثاني (المطعم):**
- الاسم التجاري: {{restaurant.name}}
- الاسم القانوني: {{restaurant.legalName}}  
- السجل التجاري: {{restaurant.registrationNumber}}
- الممثل القانوني: {{restaurant.representative.name}} - {{restaurant.representative.position}}
- الهاتف: {{restaurant.representative.phone}}
- البريد الإلكتروني: {{restaurant.representative.email}}
- العنوان: {{restaurant.mainBranch.address}}
      `,
      variables: [
        'contract.contractNumber',
        'contract.createdAt',
        'landspice.name',
        'landspice.legalName',
        'landspice.representative.name',
        'landspice.representative.position',
        'landspice.representative.phone',
        'landspice.representative.email',
        'restaurant.name',
        'restaurant.legalName',
        'restaurant.registrationNumber',
        'restaurant.representative.name',
        'restaurant.representative.position',
        'restaurant.representative.phone',
        'restaurant.representative.email',
        'restaurant.mainBranch.address'
      ]
    },
    
    {
      id: 'scope',
      title: 'نطاق الأعمال',
      order: 2,
      required: true,
      content: `
## نطاق الأعمال والخدمات

يتعهد **الطرف الأول (لاند سبايس)** بتقديم الخدمات التالية للطرف الثاني:

### 1. خدمات التصميم:
- تصميم عبوات الشطة بحجم 10 مل مطبوعة بشعار المطعم
- تصميم عبوات الكاتشب بحجم 10 مل مطبوعة بشعار المطعم
- إضافة اسم المطعم وعنوانه ومعلومات الاتصال على العبوات
- تقديم عدد {{design.revisionsCount}} مراجعات مجانية للتصميم

### 2. المواصفات الفنية:
- **الأبعاد:** {{specifications.dimensions}}
- **الألوان:** {{specifications.colors}}
- **المواد:** {{specifications.materials}}
- **جودة الطباعة:** {{specifications.quality}}
- **معايير الأمان الغذائي:** {{specifications.foodSafety}}

### 3. التسليمات المطلوبة:
- ملفات التصميم النهائية بصيغة عالية الجودة (AI, PSD, PDF)
- عينات أولية للموافقة
- دليل استخدام الهوية البصرية للعبوات
- شهادة مطابقة معايير الأمان الغذائي
      `,
      variables: [
        'design.revisionsCount',
        'specifications.dimensions',
        'specifications.colors',
        'specifications.materials',
        'specifications.quality',
        'specifications.foodSafety'
      ]
    },
    
    {
      id: 'timeline',
      title: 'الجدول الزمني',
      order: 3,
      required: true,
      content: `
## الجدول الزمني للتنفيذ

| المرحلة | الوصف | المدة | تاريخ الاستحقاق |
|---------|-------|------|----------------|
| 1 | تجميع متطلبات التصميم | {{milestones.requirements.duration}} أيام | {{milestones.requirements.dueDate}} |
| 2 | إعداد التصاميم الأولية | {{milestones.initialDesign.duration}} أيام | {{milestones.initialDesign.dueDate}} |
| 3 | مراجعة وتعديل التصاميم | {{milestones.revisions.duration}} أيام | {{milestones.revisions.dueDate}} |
| 4 | إنتاج العينات الأولية | {{milestones.samples.duration}} أيام | {{milestones.samples.dueDate}} |
| 5 | الموافقة النهائية | {{milestones.finalApproval.duration}} أيام | {{milestones.finalApproval.dueDate}} |
| 6 | تسليم الملفات النهائية | {{milestones.delivery.duration}} أيام | {{milestones.delivery.dueDate}} |

**المدة الإجمالية:** {{contract.duration}} يوم  
**تاريخ بداية التنفيذ:** {{contract.startDate}}  
**تاريخ التسليم النهائي:** {{contract.endDate}}
      `,
      variables: [
        'milestones.requirements.duration',
        'milestones.requirements.dueDate',
        'milestones.initialDesign.duration',
        'milestones.initialDesign.dueDate',
        'milestones.revisions.duration',
        'milestones.revisions.dueDate',
        'milestones.samples.duration',
        'milestones.samples.dueDate',
        'milestones.finalApproval.duration',
        'milestones.finalApproval.dueDate',
        'milestones.delivery.duration',
        'milestones.delivery.dueDate',
        'contract.duration',
        'contract.startDate',
        'contract.endDate'
      ]
    },
    
    {
      id: 'financial',
      title: 'الشروط المالية',
      order: 4,
      required: true,
      content: `
## الشروط المالية

### القيمة الإجمالية للعقد:
**{{contract.totalValue}} {{contract.currency}}** ({{contract.totalValueWords}})

### جدول الدفعات:
{{#each payments}}
| الدفعة | الوصف | المبلغ | تاريخ الاستحقاق | حالة الدفع |
|--------|-------|-------|----------------|------------|
{{#each this}}
| {{@index}} | {{description}} | {{amount}} {{../contract.currency}} | {{dueDate}} | {{status}} |
{{/each}}
{{/each}}

### شروط الدفع:
- جميع المبالغ تُدفع بالريال السعودي
- الدفع خلال {{financial.paymentTerms}} يوم من تاريخ الفاتورة
- في حالة التأخير، تطبق غرامة {{financial.latePaymentPenalty}}% شهرياً
- لا يحق للمطعم طلب استرداد المبالغ المدفوعة بعد بدء التنفيذ
      `,
      variables: [
        'contract.totalValue',
        'contract.currency',
        'contract.totalValueWords',
        'financial.paymentTerms',
        'financial.latePaymentPenalty'
      ]
    },
    
    {
      id: 'obligations',
      title: 'التزامات الأطراف',
      order: 5,
      required: true,
      content: `
## التزامات الأطراف

### التزامات لاند سبايس (الطرف الأول):
1. **الجودة والمطابقة:**
   - ضمان جودة التصميم وفقاً للمعايير المتفق عليها
   - مطابقة التصاميم لمعايير الأمان الغذائي السعودية
   - تقديم خدمة عملاء متميزة طوال فترة التنفيذ

2. **التسليم في الوقت المحدد:**
   - الالتزام بالجدول الزمني المتفق عليه
   - إشعار المطعم بأي تأخير محتمل قبل 48 ساعة على الأقل
   - تقديم بدائل في حالة وجود عوائق تقنية

3. **السرية والحماية:**
   - حماية المعلومات التجارية والتصاميم الخاصة بالمطعم
   - عدم استخدام التصاميم لأي غرض آخر دون موافقة كتابية
   - الاحتفاظ بنسخ احتياطية آمنة من جميع الملفات

### التزامات المطعم (الطرف الثاني):
1. **تقديم المعلومات المطلوبة:**
   - توفير الشعار والهوية البصرية بجودة عالية
   - تحديد المتطلبات والمواصفات بوضوح
   - الرد على الاستفسارات خلال {{obligations.responseTime}} ساعة

2. **المراجعة والموافقة:**
   - مراجعة التصاميم المقدمة خلال {{obligations.reviewTime}} أيام عمل
   - تقديم تعليقات واضحة ومحددة للتعديلات المطلوبة
   - الموافقة النهائية كتابياً قبل بدء الطباعة

3. **الدفع في الوقت المحدد:**
   - سداد الدفعات وفقاً للجدول المتفق عليه
   - إشعار لاند سبايس بأي مشاكل في الدفع مسبقاً
   - تحمل أي رسوم إضافية ناتجة عن التأخير في الدفع
      `,
      variables: [
        'obligations.responseTime',
        'obligations.reviewTime'
      ]
    },
    
    {
      id: 'intellectual_property',
      title: 'الملكية الفكرية',
      order: 6,
      required: true,
      content: `
## الملكية الفكرية وحقوق الاستخدام

### 1. ملكية التصاميم:
- التصاميم المعدة خصيصاً للمطعم تُصبح ملكاً له بعد السداد الكامل
- يحتفظ لاند سبايس بالحق في استخدام التصاميم كنماذج تسويقية
- لا يحق لأي طرف بيع أو تسريب التصاميم لأطراف ثالثة

### 2. حقوق الاستخدام:
- المطعم له الحق الحصري في استخدام تصاميمه التجارية
- يحق للمطعم تعديل التصاميم بعد الموافقة الكتابية من لاند سبايس
- في حالة انتهاء العلاقة التجارية، يحتفظ المطعم بحقوق التصاميم

### 3. الالتزامات القانونية:
- كلا الطرفين مسؤول عن عدم انتهاك حقوق الملكية الفكرية للآخرين
- في حالة وجود نزاع حول الملكية الفكرية، يُحل وفقاً للقانون السعودي
- أي انتهاك لحقوق الملكية الفكرية يُعتبر إخلالاً بالعقد
      `,
      variables: []
    },
    
    {
      id: 'quality_standards',
      title: 'معايير الجودة',
      order: 7,
      required: true,
      content: `
## معايير الجودة والمطابقة

### 1. معايير التصميم:
- **دقة الألوان:** استخدام نظام ألوان {{quality.colorSystem}} مع دقة {{quality.colorAccuracy}}%
- **جودة الخطوط:** استخدام خطوط عربية واضحة ومقروءة
- **وضوح الشعار:** ضمان وضوح الشعار بحد أدنى {{quality.logoResolution}} DPI
- **التوافق مع الهوية:** مطابقة الهوية البصرية للمطعم 100%

### 2. المعايير الفنية:
- **صيغ الملفات:** تسليم الملفات بصيغ {{quality.fileFormats}}
- **الأبعاد والقياسات:** دقة القياسات بحد أقصى انحراف {{quality.dimensionTolerance}}مم
- **جودة الطباعة:** مطابقة للمعايير الدولية {{quality.printingStandards}}
- **متانة التصميم:** ضمان عدم تأثر التصميم بالرطوبة والحرارة

### 3. معايير الأمان الغذائي:
- مطابقة للمعايير السعودية {{safety.saudiStandards}}
- خلو من المواد الضارة والسامة
- صالحة للاستخدام مع المنتجات الغذائية
- حاصلة على شهادات الجودة المطلوبة

### 4. إجراءات ضمان الجودة:
- مراجعة جودة كل تصميم قبل التسليم
- اختبار العينات الأولية للتأكد من المطابقة
- تقديم تقرير جودة مفصل مع كل تسليم
- إمكانية الإعادة والتصحيح في حالة عدم المطابقة
      `,
      variables: [
        'quality.colorSystem',
        'quality.colorAccuracy',
        'quality.logoResolution',
        'quality.fileFormats',
        'quality.dimensionTolerance',
        'quality.printingStandards',
        'safety.saudiStandards'
      ]
    },
    
    {
      id: 'termination',
      title: 'إنهاء العقد',
      order: 8,
      required: true,
      content: `
## شروط إنهاء العقد

### 1. الإنهاء الطبيعي:
- ينتهي العقد تلقائياً عند اكتمال جميع الالتزامات
- تسليم جميع الملفات والمخرجات النهائية
- تسوية جميع المبالغ المالية المستحقة

### 2. الإنهاء المبكر من قبل المطعم:
- إشعار كتابي قبل {{termination.noticepériode}} يوم
- دفع {{termination.cancellationFee}}% من القيمة الإجمالية كرسوم إلغاء
- الاحتفاظ بحقوق الأعمال المنجزة حتى تاريخ الإنهاء

### 3. الإنهاء بسبب الإخلال:
في حالة إخلال أي طرف بالتزاماته:
- إشعار كتابي بالإخلال مع مهلة {{termination.cureTimeout}} يوم للتصحيح
- في حالة عدم التصحيح، يحق للطرف الآخر إنهاء العقد فوراً
- المطالبة بالتعويضات المناسبة عن الأضرار

### 4. حالات القوة القاهرة:
- الكوارث الطبيعية، الحروب، الأوبئة
- تعليق التنفيذ دون التزام بالتعويض
- إعادة التقييم بعد انتهاء حالة القوة القاهرة
- إمكانية الإنهاء بالتراضي إذا امتدت القوة القاهرة أكثر من {{termination.forceMajeureLimit}} يوم

### 5. التصفية النهائية:
- تسليم جميع الملفات والمواد المعدة
- تسوية المبالغ المالية المستحقة لكلا الطرفين
- إعادة أي مواد أو معلومات سرية
- إتلاف النسخ الاحتياطية عند الطلب
      `,
      variables: [
        'termination.noticePeriod',
        'termination.cancellationFee',
        'termination.cureTimeout',
        'termination.forceMajeureLimit'
      ]
    },
    
    {
      id: 'legal_provisions',
      title: 'الأحكام القانونية',
      order: 9,
      required: true,
      content: `
## الأحكام القانونية والختامية

### 1. القانون المطبق:
- يخضع هذا العقد لأحكام النظام السعودي
- تطبق الأنظمة التجارية السعودية في تفسير البنود
- اللغة العربية هي المُعتمدة في حالة وجود ترجمات

### 2. تسوية النزاعات:
- الأولوية للحل الودي بين الطرفين خلال {{legal.amicableTimeout}} يوم
- في حالة فشل الحل الودي، يُرفع النزاع للتحكيم التجاري السعودي
- مقر التحكيم في {{legal.arbitrationLocation}}
- قرار التحكيم نهائي وملزم للطرفين

### 3. التعديل والإضافة:
- أي تعديل على العقد يجب أن يكون كتابياً وموقعاً من الطرفين
- الملاحق تُعتبر جزءاً لا يتجزأ من العقد
- في حالة التعارض، تُقدم الأحكام الأحدث زمنياً

### 4. النفاذ والسريان:
- يُعتبر العقد نافذاً من تاريخ توقيع الطرفين
- يبقى العقد ساري المفعول حتى إتمام جميع الالتزامات
- في حالة بطلان أي بند، تبقى بقية البنود سارية

### 5. العناوين والإشعارات:
- جميع الإشعارات تُرسل للعناوين المذكورة في مقدمة العقد
- الإشعارات عبر البريد الإلكتروني المسجل مُعتمدة
- تُعتبر الإشعارات مُستلمة بعد {{legal.noticeDeliveryTime}} ساعة من الإرسال
      `,
      variables: [
        'legal.amicableTimeout',
        'legal.arbitrationLocation',
        'legal.noticeDeliveryTime'
      ]
    },
    
    {
      id: 'signatures',
      title: 'التوقيعات',
      order: 10,
      required: true,
      content: `
## التوقيعات والاعتمادات

تم توقيع هذا العقد في تاريخ {{contract.signedDate}} في {{contract.signedLocation}} من قبل:

### الطرف الأول - لاند سبايس:
**الاسم:** {{landspice.representative.name}}  
**المنصب:** {{landspice.representative.position}}  
**التاريخ:** {{landspice.signedAt}}  
**التوقيع:** _______________________

**الشاهد:**  
**الاسم:** {{landspice.witness.name}}  
**التوقيع:** _______________________

### الطرف الثاني - {{restaurant.name}}:
**الاسم:** {{restaurant.representative.name}}  
**المنصب:** {{restaurant.representative.position}}  
**التاريخ:** {{restaurant.signedAt}}  
**التوقيع:** _______________________

**الشاهد:**  
**الاسم:** {{restaurant.witness.name}}  
**التوقيع:** _______________________

---

**ختم الشركة (لاند سبايس):**

**ختم المطعم ({{restaurant.name}}):**

---
*هذا العقد محرر من نسختين متطابقتين، لكل طرف نسخة للاحتفاظ والعمل بمقتضاها.*
      `,
      variables: [
        'contract.signedDate',
        'contract.signedLocation',
        'landspice.representative.name',
        'landspice.representative.position',
        'landspice.signedAt',
        'landspice.witness.name',
        'restaurant.name',
        'restaurant.representative.name',
        'restaurant.representative.position',
        'restaurant.signedAt',
        'restaurant.witness.name'
      ]
    }
  ],
  
  defaultTerms: [
    {
      title: 'جودة التصميم',
      description: 'يلتزم لاند سبايس بتقديم تصاميم عالية الجودة تتوافق مع المعايير الدولية',
      category: 'quality',
      mandatory: true,
      negotiable: false,
      defaultValue: 'مطابقة 100% للمواصفات المتفق عليها'
    },
    {
      title: 'مراجعات التصميم',
      description: 'عدد المراجعات المجانية المسموحة للتصميم',
      category: 'delivery',
      mandatory: true,
      negotiable: true,
      defaultValue: '3 مراجعات مجانية'
    },
    {
      title: 'سرية المعلومات',
      description: 'التزام الطرفين بالحفاظ على سرية المعلومات التجارية',
      category: 'liability',
      mandatory: true,
      negotiable: false,
      defaultValue: 'التزام تام بالسرية'
    },
    {
      title: 'شروط الدفع',
      description: 'مواعيد وطرق سداد المبالغ المستحقة',
      category: 'payment',
      mandatory: true,
      negotiable: true,
      defaultValue: '30 يوم من تاريخ الفاتورة'
    },
    {
      title: 'إنهاء العقد',
      description: 'شروط وإجراءات إنهاء العقد',
      category: 'termination',
      mandatory: true,
      negotiable: true,
      defaultValue: 'إشعار 30 يوم مسبق'
    }
  ],
  
  defaultMilestones: [
    {
      title: 'تجميع المتطلبات',
      description: 'جمع وتحليل متطلبات التصميم من المطعم',
      dueDate: new Date(), // Will be calculated based on contract start date
      completedDate: undefined,
      status: 'pending',
      responsible: 'landspice',
      deliverables: ['وثيقة المتطلبات', 'قائمة المواصفات الفنية'],
      dependencies: []
    },
    {
      title: 'التصميم الأولي',
      description: 'إعداد التصاميم الأولية للعبوات',
      dueDate: new Date(), // Will be calculated
      completedDate: undefined,
      status: 'pending',
      responsible: 'landspice',
      deliverables: ['تصميم أولي للشطة', 'تصميم أولي للكاتشب'],
      dependencies: ['تجميع المتطلبات']
    },
    {
      title: 'المراجعة والتعديل',
      description: 'مراجعة التصاميم من قبل المطعم وإجراء التعديلات',
      dueDate: new Date(), // Will be calculated
      completedDate: undefined,
      status: 'pending',
      responsible: 'restaurant',
      deliverables: ['ملاحظات المراجعة', 'التعديلات المطلوبة'],
      dependencies: ['التصميم الأولي']
    },
    {
      title: 'إنتاج العينات',
      description: 'إنتاج عينات أولية للتصاميم المعدلة',
      dueDate: new Date(), // Will be calculated
      completedDate: undefined,
      status: 'pending',
      responsible: 'landspice',
      deliverables: ['عينة عبوة الشطة', 'عينة عبوة الكاتشب'],
      dependencies: ['المراجعة والتعديل']
    },
    {
      title: 'الموافقة النهائية',
      description: 'موافقة المطعم النهائية على التصاميم',
      dueDate: new Date(), // Will be calculated
      completedDate: undefined,
      status: 'pending',
      responsible: 'restaurant',
      deliverables: ['موافقة كتابية نهائية'],
      dependencies: ['إنتاج العينات']
    },
    {
      title: 'التسليم النهائي',
      description: 'تسليم جميع ملفات التصميم النهائية',
      dueDate: new Date(), // Will be calculated
      completedDate: undefined,
      status: 'pending',
      responsible: 'landspice',
      deliverables: ['ملفات AI النهائية', 'ملفات PDF للطباعة', 'دليل الاستخدام'],
      dependencies: ['الموافقة النهائية']
    }
  ],
  
  legalReview: true,
  approvedBy: undefined,
  approvedAt: undefined
}
