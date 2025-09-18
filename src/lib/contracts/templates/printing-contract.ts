// Printing Contract Template - Simplified Version
// قالب عقد الطباعة - نسخة مبسطة

import { ContractTemplate } from '../types'

export const printingContractTemplate: Omit<ContractTemplate, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'usageCount'> = {
  name: 'عقد طباعة العبوات',
  description: 'قالب العقد الخاص بطباعة وإنتاج العبوات المخصصة للمطاعم',
  type: 'printing',
  version: '1.0',
  isActive: true,
  
  sections: [
    {
      id: 'header',
      title: 'رأس العقد',
      order: 1,
      required: true,
      content: `
# عقد طباعة العبوات المخصصة

**رقم العقد:** {{contract.contractNumber}}  
**تاريخ العقد:** {{contract.createdAt}}

## أطراف العقد:

**الطرف الأول (لاند سبايس):**
- الاسم: {{landspice.name}}
- الممثل القانوني: {{landspice.representative.name}}
- الهاتف: {{landspice.representative.phone}}

**الطرف الثاني (البنك الوسيط):**
- الاسم: {{bank.name}}
- الممثل القانوني: {{bank.representative.name}}

**الطرف الثالث (المورد):**
- الاسم: {{supplier.name}}
- السجل التجاري: {{supplier.registrationNumber}}
- الممثل القانوني: {{supplier.representative.name}}
      `,
      variables: [
        'contract.contractNumber', 'contract.createdAt', 'landspice.name',
        'landspice.representative.name', 'landspice.representative.phone',
        'bank.name', 'bank.representative.name', 'supplier.name',
        'supplier.registrationNumber', 'supplier.representative.name'
      ]
    },
    
    {
      id: 'scope',
      title: 'نطاق الأعمال',
      order: 2,
      required: true,
      content: `
## نطاق الأعمال والمنتجات

### المنتجات المطلوبة:
- عبوات شطة 10مل: {{printing.chiliQuantity}} عبوة
- عبوات كاتشب 10مل: {{printing.ketchupQuantity}} عبوة
- **إجمالي الكمية:** {{printing.totalQuantity}} عبوة

### المواصفات الفنية:
- نوع الطباعة: {{printing.printType}}
- جودة الطباعة: {{printing.quality}} DPI
- مقاومة المياه والزيوت
- مطابقة لمعايير الأمان الغذائي السعودية
      `,
      variables: [
        'printing.chiliQuantity', 'printing.ketchupQuantity',
        'printing.totalQuantity', 'printing.printType', 'printing.quality'
      ]
    },
    
    {
      id: 'timeline',
      title: 'الجدول الزمني',
      order: 3,
      required: true,
      content: `
## الجدول الزمني للتنفيذ

| المرحلة | المسؤول | المدة |
|---------|----------|------|
| استلام الطلب | المورد | {{timeline.orderProcessing}} أيام |
| إعداد أفلام الطباعة | المورد | {{timeline.filmPreparation}} أيام |
| الإنتاج والطباعة | المورد | {{timeline.production}} أيام |
| التعبئة والشحن | المورد | {{timeline.packaging}} أيام |

**تاريخ التسليم النهائي:** {{contract.endDate}}
      `,
      variables: [
        'timeline.orderProcessing', 'timeline.filmPreparation',
        'timeline.production', 'timeline.packaging', 'contract.endDate'
      ]
    },
    
    {
      id: 'financial',
      title: 'الشروط المالية',
      order: 4,
      required: true,
      content: `
## الشروط المالية

**القيمة الإجمالية:** {{contract.totalValue}} {{contract.currency}}

### جدول الدفعات:
- دفعة تأكيد الطلب: {{payments.confirmation.percentage}}% عند التوقيع
- دفعة الإنتاج: {{payments.production.percentage}}% بعد موافقة العينات  
- دفعة التسليم: {{payments.delivery.percentage}}% عند استلام البضاعة

جميع المدفوعات تتم من البنك الوسيط للمورد مباشرة.
      `,
      variables: [
        'contract.totalValue', 'contract.currency',
        'payments.confirmation.percentage', 'payments.production.percentage',
        'payments.delivery.percentage'
      ]
    }
  ],
  
  defaultTerms: [
    {
      title: 'جودة الطباعة',
      description: 'التزام بجودة الطباعة حسب المواصفات',
      category: 'quality',
      mandatory: true,
      negotiable: false,
      defaultValue: 'مطابقة 100% للعينات'
    },
    {
      title: 'مواعيد التسليم',
      description: 'التزام بالجدول الزمني',
      category: 'delivery',
      mandatory: true,
      negotiable: true,
      defaultValue: 'حسب الجدول المحدد'
    },
    {
      title: 'ضمان المنتج',
      description: 'ضمان ضد عيوب التصنيع',
      category: 'quality',
      mandatory: true,
      negotiable: true,
      defaultValue: '6 أشهر'
    }
  ],
  
  defaultMilestones: [
    {
      title: 'استلام الطلب والتصاميم',
      description: 'استلام ومراجعة طلب الطباعة والتصاميم',
      dueDate: new Date(),
      completedDate: undefined,
      status: 'pending',
      responsible: 'supplier',
      deliverables: ['تأكيد استلام الطلب', 'مراجعة التصاميم'],
      dependencies: []
    },
    {
      title: 'إنتاج العينات',
      description: 'إنتاج عينات أولية للموافقة',
      dueDate: new Date(),
      completedDate: undefined,
      status: 'pending',
      responsible: 'supplier',
      deliverables: ['عينات أولية'],
      dependencies: ['استلام الطلب والتصاميم']
    },
    {
      title: 'الإنتاج الكامل',
      description: 'بدء الإنتاج الكامل بعد موافقة العينات',
      dueDate: new Date(),
      completedDate: undefined,
      status: 'pending',
      responsible: 'supplier',
      deliverables: ['المنتج النهائي'],
      dependencies: ['إنتاج العينات']
    },
    {
      title: 'التسليم النهائي',
      description: 'شحن وتسليم البضاعة لمستودعات لاند سبايس',
      dueDate: new Date(),
      completedDate: undefined,
      status: 'pending',
      responsible: 'supplier',
      deliverables: ['البضاعة مسلمة', 'شهادات الجودة'],
      dependencies: ['الإنتاج الكامل']
    }
  ],
  
  legalReview: true,
  approvedBy: undefined,
  approvedAt: undefined
}
