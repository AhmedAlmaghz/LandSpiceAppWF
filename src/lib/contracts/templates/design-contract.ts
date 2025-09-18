// Design Service Contract Template
// قالب عقد خدمات التصميم

import { ContractTemplate } from '../types'

export const designContractTemplate: ContractTemplate = {
  id: 'template_design_001',
  name: 'عقد خدمات التصميم',
  description: 'قالب عقد شامل لخدمات التصميم الجرافيكي والهوية البصرية للمطاعم',
  category: 'design',
  type: 'service',
  language: 'ar',
  version: '1.0.0',
  isActive: true,

  structure: {
    header: `
      <div class="contract-header" style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #dc2626; font-size: 24px; margin-bottom: 10px;">عقد خدمات التصميم</h1>
        <h2 style="color: #374151; font-size: 18px;">{{contractNumber}}</h2>
        <p style="color: #6b7280; margin-top: 20px;">المملكة العربية السعودية</p>
      </div>
    `,
    
    sections: [
      {
        id: 'parties',
        title: 'أطراف العقد',
        content: `
          <h3>الطرف الأول: (مقدم الخدمة)</h3>
          <p><strong>شركة لاند سبايس للتجارة والتسويق</strong></p>
          <ul>
            <li>السجل التجاري: {{landspiceRegistrationNumber}}</li>
            <li>الرقم الضريبي: {{landspiceTaxId}}</li>
            <li>العنوان: {{landspiceAddress}}</li>
            <li>ممثل الشركة: {{landspiceRepresentative}}</li>
            <li>الهاتف: {{landspicePhone}}</li>
            <li>البريد الإلكتروني: {{landspiceEmail}}</li>
          </ul>

          <h3>الطرف الثاني: (المستفيد من الخدمة)</h3>
          <p><strong>{{restaurantName}}</strong></p>
          <ul>
            <li>الاسم القانوني: {{restaurantLegalName}}</li>
            <li>السجل التجاري: {{restaurantRegistrationNumber}}</li>
            <li>الرقم الضريبي: {{restaurantTaxId}}</li>
            <li>العنوان: {{restaurantAddress}}</li>
            <li>ممثل المطعم: {{restaurantRepresentative}}</li>
            <li>الهاتف: {{restaurantPhone}}</li>
            <li>البريد الإلكتروني: {{restaurantEmail}}</li>
          </ul>
        `,
        order: 1,
        isRequired: true,
        variables: [
          'contractNumber', 'landspiceRegistrationNumber', 'landspiceTaxId', 'landspiceAddress',
          'landspiceRepresentative', 'landspicePhone', 'landspiceEmail', 'restaurantName',
          'restaurantLegalName', 'restaurantRegistrationNumber', 'restaurantTaxId',
          'restaurantAddress', 'restaurantRepresentative', 'restaurantPhone', 'restaurantEmail'
        ]
      },
      {
        id: 'scope',
        title: 'نطاق الخدمات',
        content: `
          <p>يلتزم الطرف الأول بتقديم الخدمات التالية للطرف الثاني:</p>
          
          <h4>1. خدمات التصميم الأساسية:</h4>
          <ul>
            <li>تصميم الهوية البصرية الكاملة للمطعم</li>
            <li>تصميم الشعار (Logo) بصيغ متعددة</li>
            <li>تصميم قائمة الطعام الرئيسية</li>
            <li>تصميم اللافتات الخارجية والداخلية</li>
            <li>تصميم الزي الموحد للعاملين</li>
          </ul>

          <h4>2. المواد التسويقية:</h4>
          <ul>
            <li>تصميم البروشورات والفلايرز</li>
            <li>تصميم منشورات وسائل التواصل الاجتماعي</li>
            <li>تصميم الإعلانات الرقمية</li>
            <li>تصميم أكواب وأكياس الطعام</li>
          </ul>

          <h4>3. التسليمات:</h4>
          <ul>
            <li>جميع التصاميم بصيغ عالية الجودة (AI, EPS, PDF, PNG, JPG)</li>
            <li>دليل الهوية البصرية الشامل</li>
            <li>الملفات المجهزة للطباعة</li>
            <li>حقوق الاستخدام التجاري للتصاميم</li>
          </ul>
        `,
        order: 2,
        isRequired: true
      },
      {
        id: 'timeline',
        title: 'الجدول الزمني',
        content: `
          <h4>مراحل تنفيذ المشروع:</h4>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background-color: #f3f4f6;">
                <th style="border: 1px solid #d1d5db; padding: 12px; text-align: right;">المرحلة</th>
                <th style="border: 1px solid #d1d5db; padding: 12px; text-align: right;">الوصف</th>
                <th style="border: 1px solid #d1d5db; padding: 12px; text-align: right;">المدة</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="border: 1px solid #d1d5db; padding: 12px;">المرحلة الأولى</td>
                <td style="border: 1px solid #d1d5db; padding: 12px;">تحليل متطلبات العميل وتطوير المفهوم الأولي</td>
                <td style="border: 1px solid #d1d5db; padding: 12px;">3-5 أيام عمل</td>
              </tr>
              <tr>
                <td style="border: 1px solid #d1d5db; padding: 12px;">المرحلة الثانية</td>
                <td style="border: 1px solid #d1d5db; padding: 12px;">تصميم الهوية البصرية والشعار</td>
                <td style="border: 1px solid #d1d5db; padding: 12px;">7-10 أيام عمل</td>
              </tr>
              <tr>
                <td style="border: 1px solid #d1d5db; padding: 12px;">المرحلة الثالثة</td>
                <td style="border: 1px solid #d1d5db; padding: 12px;">تصميم المواد التسويقية والطباعية</td>
                <td style="border: 1px solid #d1d5db; padding: 12px;">5-7 أيام عمل</td>
              </tr>
              <tr>
                <td style="border: 1px solid #d1d5db; padding: 12px;">المرحلة الرابعة</td>
                <td style="border: 1px solid #d1d5db; padding: 12px;">المراجعة النهائية والتسليم</td>
                <td style="border: 1px solid #d1d5db; padding: 12px;">2-3 أيام عمل</td>
              </tr>
            </tbody>
          </table>

          <p><strong>إجمالي مدة التنفيذ:</strong> {{totalDuration}} يوم عمل من تاريخ الموافقة على المفهوم الأولي</p>
          <p><strong>تاريخ بداية المشروع:</strong> {{startDate}}</p>
          <p><strong>تاريخ التسليم المتوقع:</strong> {{expectedDeliveryDate}}</p>
        `,
        order: 3,
        isRequired: true,
        variables: ['totalDuration', 'startDate', 'expectedDeliveryDate']
      },
      {
        id: 'financial',
        title: 'الأحكام المالية',
        content: `
          <h4>قيمة العقد:</h4>
          <ul>
            <li><strong>إجمالي قيمة الخدمات:</strong> {{totalValue}} ريال سعودي (شامل ضريبة القيمة المضافة)</li>
            <li><strong>طريقة الدفع:</strong> {{paymentMethod}}</li>
            <li><strong>شروط الدفع:</strong> {{paymentTerms}}</li>
          </ul>

          <h4>جدول الدفعات:</h4>
          <ul>
            <li><strong>الدفعة الأولى:</strong> {{firstPayment}}% عند توقيع العقد</li>
            <li><strong>الدفعة الثانية:</strong> {{secondPayment}}% عند الموافقة على التصاميم الأولية</li>
            <li><strong>الدفعة الأخيرة:</strong> {{finalPayment}}% عند التسليم النهائي</li>
          </ul>

          <h4>أحكام إضافية:</h4>
          <ul>
            <li>يحق للطرف الأول تأجيل التسليم في حالة تأخر دفع أي من الدفعات المستحقة</li>
            <li>أي تعديلات إضافية خارج نطاق العمل المتفق عليه تتطلب موافقة مكتوبة وقد تستلزم رسوم إضافية</li>
            <li>الأسعار المذكورة صالحة لمدة {{priceValidityPeriod}} يوم من تاريخ العقد</li>
          </ul>
        `,
        order: 4,
        isRequired: true,
        variables: [
          'totalValue', 'paymentMethod', 'paymentTerms', 'firstPayment',
          'secondPayment', 'finalPayment', 'priceValidityPeriod'
        ]
      },
      {
        id: 'revisions',
        title: 'التعديلات والمراجعات',
        content: `
          <h4>سياسة التعديلات:</h4>
          <ul>
            <li>يحق للطرف الثاني طلب تعديلات مجانية كما يلي:</li>
            <ul>
              <li><strong>على المفهوم الأولي:</strong> {{conceptRevisions}} تعديلات مجانية</li>
              <li><strong>على التصاميم النهائية:</strong> {{designRevisions}} تعديلات مجانية</li>
              <li><strong>على المواد التسويقية:</strong> {{marketingRevisions}} تعديلات مجانية</li>
            </ul>
            <li>التعديلات الإضافية تخضع لرسوم إضافية وفقاً لحجم التعديل المطلوب</li>
            <li>يجب تقديم طلبات التعديل خلال {{revisionPeriod}} أيام من استلام التصاميم</li>
          </ul>

          <h4>ضوابط التعديلات:</h4>
          <ul>
            <li>يجب أن تكون طلبات التعديل واضحة ومحددة</li>
            <li>لا تشمل التعديلات المجانية تغيير المفهوم الأساسي للتصميم</li>
            <li>التعديلات الجوهرية تعتبر مشروع جديد وتتطلب اتفاقية منفصلة</li>
          </ul>
        `,
        order: 5,
        isRequired: true,
        variables: ['conceptRevisions', 'designRevisions', 'marketingRevisions', 'revisionPeriod']
      },
      {
        id: 'intellectual_property',
        title: 'الملكية الفكرية',
        content: `
          <h4>حقوق الطبع والنشر:</h4>
          <ul>
            <li>تنتقل حقوق الاستخدام التجاري للتصاميم النهائية إلى الطرف الثاني بعد سداد كامل قيمة العقد</li>
            <li>يحتفظ الطرف الأول بحقوق الطبع والنشر للأعمال الفنية والإبداعية</li>
            <li>يحق للطرف الأول استخدام التصاميم لأغراض الدعاية والتسويق لأعماله</li>
          </ul>

          <h4>قيود الاستخدام:</h4>
          <ul>
            <li>لا يحق للطرف الثاني نقل أو بيع حقوق التصاميم لطرف ثالث دون موافقة مكتوبة</li>
            <li>استخدام التصاميم مقتصر على النشاط التجاري المحدد في العقد</li>
            <li>أي استخدام خارج النطاق المحدد يتطلب ترخيص إضافي</li>
          </ul>

          <h4>حماية العلامة التجارية:</h4>
          <ul>
            <li>يتحمل الطرف الثاني مسؤولية تسجيل العلامة التجارية والشعار</li>
            <li>الطرف الأول غير مسؤول عن أي تشابه مع علامات تجارية أخرى</li>
            <li>يلتزم الطرف الثاني بإجراء البحث اللازم قبل الموافقة على التصاميم</li>
          </ul>
        `,
        order: 6,
        isRequired: true
      },
      {
        id: 'responsibilities',
        title: 'المسؤوليات والالتزامات',
        content: `
          <h4>التزامات الطرف الأول (لاند سبايس):</h4>
          <ul>
            <li>تقديم خدمات التصميم وفقاً للمعايير المهنية العالية</li>
            <li>الالتزام بالجدول الزمني المحدد للتسليم</li>
            <li>تقديم الدعم الفني اللازم خلال فترة المشروع</li>
            <li>ضمان جودة التصاميم وملاءمتها للاستخدام التجاري</li>
            <li>الحفاظ على سرية معلومات العميل</li>
          </ul>

          <h4>التزامات الطرف الثاني (المطعم):</h4>
          <ul>
            <li>تقديم جميع المعلومات والمواد اللازمة للتصميم</li>
            <li>سداد المستحقات المالية في المواعيد المحددة</li>
            <li>تقديم التغذية الراجعة والموافقات في الوقت المناسب</li>
            <li>احترام حقوق الملكية الفكرية للطرف الأول</li>
            <li>التعاون مع فريق التصميم لضمان تحقيق النتائج المطلوبة</li>
          </ul>

          <h4>معايير الجودة:</h4>
          <ul>
            <li>جميع التصاميم تخضع للمراجعة الداخلية قبل التسليم</li>
            <li>التصاميم تتوافق مع المعايير التقنية للطباعة والنشر الرقمي</li>
            <li>ضمان جودة لمدة {{qualityWarrantyPeriod}} شهر من تاريخ التسليم</li>
          </ul>
        `,
        order: 7,
        isRequired: true,
        variables: ['qualityWarrantyPeriod']
      },
      {
        id: 'termination',
        title: 'إنهاء العقد',
        content: `
          <h4>حالات إنهاء العقد:</h4>
          <ul>
            <li><strong>الإنهاء بالاتفاق:</strong> يحق لأي من الطرفين إنهاء العقد بموافقة الطرف الآخر</li>
            <li><strong>الإنهاء للإخلال:</strong> في حالة إخلال أي طرف بالتزاماته الأساسية</li>
            <li><strong>الإنهاء للظروف القاهرة:</strong> في حالة حدوث ظروف خارجة عن إرادة الطرفين</li>
          </ul>

          <h4>إجراءات الإنهاء:</h4>
          <ul>
            <li>يجب تقديم إشعار مكتوب بالإنهاء قبل {{terminationNotice}} يوم على الأقل</li>
            <li>تسوية جميع المستحقات المالية حتى تاريخ الإنهاء</li>
            <li>تسليم جميع الأعمال المنجزة حتى تاريخ الإنهاء</li>
          </ul>

          <h4>آثار الإنهاء:</h4>
          <ul>
            <li>في حالة الإنهاء من قبل الطرف الثاني دون مبرر، يفقد حقه في استرداد أي مبالغ مدفوعة</li>
            <li>في حالة الإنهاء من قبل الطرف الأول دون مبرر، يحق للطرف الثاني استرداد المبالغ المدفوعة</li>
            <li>الأعمال المنجزة تبقى ملكاً للطرف الذي سددها وفقاً لمراحل الدفع</li>
          </ul>
        `,
        order: 8,
        isRequired: true,
        variables: ['terminationNotice']
      }
    ],

    footer: `
      <div class="contract-footer" style="margin-top: 40px; border-top: 2px solid #dc2626; padding-top: 20px;">
        <h4>أحكام عامة:</h4>
        <ul>
          <li>يخضع هذا العقد للأنظمة المعمول بها في المملكة العربية السعودية</li>
          <li>أي نزاع ناشئ عن هذا العقد يحل بالتفاوض أولاً، وإلا فعن طريق التحكيم</li>
          <li>هذا العقد يلغي أي اتفاقيات سابقة بين الطرفين حول نفس الموضوع</li>
          <li>أي تعديل على هذا العقد يجب أن يكون مكتوباً وموقعاً من الطرفين</li>
        </ul>

        <div style="display: flex; justify-content: space-between; margin-top: 40px;">
          <div style="text-align: center;">
            <h4>الطرف الأول</h4>
            <p>شركة لاند سبايس للتجارة والتسويق</p>
            <p style="margin-top: 30px;">التوقيع: _________________</p>
            <p>الاسم: {{landspiceSignatoryName}}</p>
            <p>الصفة: {{landspiceSignatoryTitle}}</p>
            <p>التاريخ: _______________</p>
          </div>
          
          <div style="text-align: center;">
            <h4>الطرف الثاني</h4>
            <p>{{restaurantName}}</p>
            <p style="margin-top: 30px;">التوقيع: _________________</p>
            <p>الاسم: {{restaurantSignatoryName}}</p>
            <p>الصفة: {{restaurantSignatoryTitle}}</p>
            <p>التاريخ: _______________</p>
          </div>
        </div>

        <div style="text-align: center; margin-top: 30px; padding: 15px; background-color: #f9fafb; border-radius: 8px;">
          <p style="color: #6b7280; font-size: 14px;">
            هذا العقد محرر من نسختين أصليتين، بيد كل طرف نسخة للعمل بموجبها
          </p>
          <p style="color: #6b7280; font-size: 12px; margin-top: 10px;">
            تاريخ إصدار العقد: {{contractDate}} | رقم العقد: {{contractNumber}}
          </p>
        </div>
      </div>
    `
  },

  defaultTerms: [
    {
      title: 'ضمان الجودة',
      content: 'يضمن الطرف الأول جودة التصاميم المقدمة ومطابقتها للمواصفات المتفق عليها',
      type: 'clause',
      isRequired: true,
      order: 1
    },
    {
      title: 'السرية',
      content: 'يلتزم الطرف الأول بالحفاظ على سرية جميع المعلومات المتعلقة بعمل الطرف الثاني',
      type: 'clause',
      isRequired: true,
      order: 2
    },
    {
      title: 'التأخير في التسليم',
      content: 'في حالة التأخير في التسليم بدون مبرر مقبول، يحق للطرف الثاني خصم 2% من قيمة العقد عن كل أسبوع تأخير',
      type: 'penalty',
      isRequired: false,
      order: 3
    }
  ],

  defaultFinancials: {
    currency: 'SAR',
    paymentTerms: {
      method: 'milestone',
      dueDate: 30,
      penaltyRate: 1.5,
      discountRate: 2
    },
    guaranteeType: 'none'
  },

  defaultDeliverables: [
    {
      title: 'تصميم الهوية البصرية',
      description: 'تصميم الشعار والهوية البصرية الكاملة للمطعم',
      category: 'design',
      timeline: {
        endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000) // 10 days from now
      },
      specifications: {
        formats: ['AI', 'EPS', 'PDF', 'PNG', 'JPG'],
        colors: 'CMYK و RGB',
        resolution: '300 DPI للطباعة، 72 DPI للويب'
      }
    },
    {
      title: 'تصميم قائمة الطعام',
      description: 'تصميم قائمة الطعام الأساسية بتخطيط احترافي',
      category: 'design',
      timeline: {
        endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) // 15 days from now
      },
      specifications: {
        sizes: ['A4', 'A3'],
        formats: ['PDF', 'AI'],
        languages: ['العربية', 'الإنجليزية']
      }
    },
    {
      title: 'دليل الهوية البصرية',
      description: 'دليل شامل لاستخدام الهوية البصرية والشعار',
      category: 'design',
      timeline: {
        endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000) // 20 days from now
      },
      specifications: {
        format: 'PDF',
        pages: '15-25 صفحة',
        content: 'قواعد الاستخدام، الألوان، الخطوط، التطبيقات'
      }
    }
  ],

  createdDate: new Date(),
  lastModified: new Date(),
  createdBy: 'system',
  usageCount: 0,
  tags: ['تصميم', 'هوية بصرية', 'مطاعم', 'خدمات']
}
