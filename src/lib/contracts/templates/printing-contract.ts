// Printing Service Contract Template
// قالب عقد خدمات الطباعة

import { ContractTemplate } from '../types'

export const printingContractTemplate: ContractTemplate = {
  id: 'template_printing_001',
  name: 'عقد خدمات الطباعة والإنتاج',
  description: 'قالب عقد شامل لخدمات طباعة وإنتاج مواد التعبئة والتغليف للمطاعم',
  category: 'printing',
  type: 'supply',
  language: 'ar',
  version: '1.0.0',
  isActive: true,

  structure: {
    header: `
      <div class="contract-header">
        <h1>عقد خدمات الطباعة والإنتاج</h1>
        <h2>{{contractNumber}}</h2>
        <p>المملكة العربية السعودية</p>
      </div>
    `,
    
    sections: [
      {
        id: 'parties',
        title: 'أطراف العقد',
        content: `
          <h3>الطرف الأول: لاند سبايس</h3>
          <p><strong>شركة لاند سبايس للتجارة والتسويق</strong></p>
          <ul>
            <li>السجل التجاري: {{landspiceRegistrationNumber}}</li>
            <li>ممثل الشركة: {{landspiceRepresentative}}</li>
          </ul>

          <h3>الطرف الثاني: المورد</h3>
          <p><strong>{{supplierName}}</strong></p>
          <ul>
            <li>السجل التجاري: {{supplierRegistrationNumber}}</li>
            <li>ممثل الشركة: {{supplierRepresentative}}</li>
          </ul>
        `,
        order: 1,
        isRequired: true,
        variables: ['contractNumber', 'landspiceRegistrationNumber', 'landspiceRepresentative', 'supplierName', 'supplierRegistrationNumber', 'supplierRepresentative']
      },
      {
        id: 'scope',
        title: 'نطاق الخدمات',
        content: `
          <h4>منتجات التعبئة والتغليف:</h4>
          <ul>
            <li>علب الكاتشب (250 مل) - {{ketchupQuantity}} شهرياً</li>
            <li>علب الشطة (250 مل) - {{hotSauceQuantity}} شهرياً</li>
            <li>أكياس ورقية - {{bagsQuantity}} شهرياً</li>
            <li>أكواب متعددة المقاسات - {{cupsQuantity}} شهرياً</li>
          </ul>

          <h4>خدمات الطباعة:</h4>
          <ul>
            <li>طباعة التصاميم بجودة عالية</li>
            <li>تطبيق الألوان وفقاً للهوية البصرية</li>
            <li>ضمان ثبات الألوان ومقاومة الماء</li>
            <li>التعبئة والتغليف الآمن</li>
          </ul>
        `,
        order: 2,
        isRequired: true,
        variables: ['ketchupQuantity', 'hotSauceQuantity', 'bagsQuantity', 'cupsQuantity']
      },
      {
        id: 'quality',
        title: 'معايير الجودة',
        content: `
          <h4>مواصفات المواد:</h4>
          <ul>
            <li>العبوات البلاستيكية: {{plasticSpecs}}</li>
            <li>الأكياس الورقية: {{paperSpecs}}</li>
            <li>جودة الطباعة: {{printQuality}} DPI</li>
            <li>نسبة العيوب المقبولة: أقل من {{defectRate}}%</li>
          </ul>

          <h4>الشهادات المطلوبة:</h4>
          <ul>
            <li>شهادة مطابقة SASO</li>
            <li>شهادة سلامة غذائية</li>
            <li>شهادة ISO للجودة</li>
          </ul>
        `,
        order: 3,
        isRequired: true,
        variables: ['plasticSpecs', 'paperSpecs', 'printQuality', 'defectRate']
      },
      {
        id: 'schedule',
        title: 'جدولة الإنتاج',
        content: `
          <h4>دورة الإنتاج الشهرية:</h4>
          <ul>
            <li>الأسبوع الأول: تجميع الطلبات وتحضير التصاميم</li>
            <li>الأسبوع الثاني: بدء الإنتاج والطباعة</li>
            <li>الأسبوع الثالث: فحص الجودة والتعبئة</li>
            <li>الأسبوع الرابع: التسليم والتوزيع</li>
          </ul>

          <h4>مواعيد مهمة:</h4>
          <ul>
            <li>استلام الطلب: اليوم {{orderDay}} من كل شهر</li>
            <li>بدء الإنتاج: اليوم {{startDay}} من كل شهر</li>
            <li>التسليم النهائي: اليوم {{deliveryDay}} من كل شهر</li>
          </ul>
        `,
        order: 4,
        isRequired: true,
        variables: ['orderDay', 'startDay', 'deliveryDay']
      },
      {
        id: 'financial',
        title: 'الأحكام المالية',
        content: `
          <h4>قيمة العقد:</h4>
          <ul>
            <li>القيمة الشهرية: {{monthlyValue}} ريال سعودي</li>
            <li>القيمة السنوية: {{annualValue}} ريال سعودي</li>
            <li>طريقة الدفع: {{paymentMethod}}</li>
          </ul>

          <h4>الضمانات:</h4>
          <ul>
            <li>خطاب ضمان حسن التنفيذ: {{performanceGuarantee}}%</li>
            <li>ضمان الجودة: {{qualityGuarantee}} شهر</li>
            <li>غرامة تأخير: {{delayPenalty}}% يومياً</li>
          </ul>
        `,
        order: 5,
        isRequired: true,
        variables: ['monthlyValue', 'annualValue', 'paymentMethod', 'performanceGuarantee', 'qualityGuarantee', 'delayPenalty']
      }
    ],

    footer: `
      <div class="contract-footer">
        <h4>أحكام عامة:</h4>
        <p>مدة العقد: {{contractDuration}} من تاريخ التوقيع</p>
        <p>القانون الحاكم: الأنظمة السعودية</p>
        
        <div style="display: flex; justify-content: space-between; margin-top: 40px;">
          <div>
            <h4>الطرف الأول</h4>
            <p>لاند سبايس</p>
            <p>التوقيع: _________</p>
          </div>
          <div>
            <h4>الطرف الثاني</h4>
            <p>{{supplierName}}</p>
            <p>التوقيع: _________</p>
          </div>
        </div>
      </div>
    `
  },

  defaultTerms: [
    {
      title: 'ضمان الجودة',
      content: 'يضمن المورد جودة المنتجات ومطابقتها للمواصفات',
      type: 'clause',
      isRequired: true,
      order: 1
    },
    {
      title: 'التأخير في التسليم',
      content: 'غرامة تأخير 2% عن كل يوم تأخير',
      type: 'penalty',
      isRequired: true,
      order: 2
    }
  ],

  defaultFinancials: {
    currency: 'SAR',
    paymentTerms: {
      method: 'monthly',
      dueDate: 30,
      penaltyRate: 2,
    },
    guaranteeType: 'bank_guarantee'
  },

  defaultDeliverables: [
    {
      title: 'علب الكاتشب',
      description: 'إنتاج وطباعة علب الكاتشب حسب التصميم المعتمد',
      category: 'printing',
      timeline: {
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    }
  ],

  createdDate: new Date(),
  lastModified: new Date(),
  createdBy: 'system',
  usageCount: 0,
  tags: ['طباعة', 'إنتاج', 'تعبئة', 'مطاعم']
}
