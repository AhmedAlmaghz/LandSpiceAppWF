import { z } from "zod"

// التحقق من بيانات المستخدم العامة
export const userBaseSchema = z.object({
  username: z
    .string()
    .min(3, "اسم المستخدم يجب أن يكون 3 أحرف على الأقل")
    .max(50, "اسم المستخدم يجب ألا يزيد عن 50 حرف")
    .regex(/^[a-zA-Z0-9_]+$/, "اسم المستخدم يجب أن يحتوي على أحرف وأرقام فقط"),
  
  email: z
    .string()
    .email("البريد الإلكتروني غير صحيح")
    .optional()
    .or(z.literal("")),
  
  phone: z
    .string()
    .regex(/^(\+966|966|0)?5[0-9]{8}$/, "رقم الهاتف السعودي غير صحيح")
    .optional()
    .or(z.literal("")),
  
  firstName: z
    .string()
    .min(2, "الاسم الأول يجب أن يكون حرفين على الأقل")
    .max(100, "الاسم الأول يجب ألا يزيد عن 100 حرف")
    .optional()
    .or(z.literal("")),
  
  lastName: z
    .string()
    .min(2, "اسم العائلة يجب أن يكون حرفين على الأقل")
    .max(100, "اسم العائلة يجب ألا يزيد عن 100 حرف")
    .optional()
    .or(z.literal("")),
})

// تسجيل الدخول
export const signInSchema = z.object({
  username: z.string().min(1, "اسم المستخدم مطلوب"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
})

// إنشاء مستخدم جديد
export const createUserSchema = userBaseSchema.extend({
  password: z
    .string()
    .min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "كلمة المرور يجب أن تحتوي على حرف كبير وصغير ورقم"),
  
  confirmPassword: z.string(),
  roleId: z.number().int().positive("يجب اختيار دور صحيح"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "كلمة المرور وتأكيدها غير متطابقتان",
  path: ["confirmPassword"],
})

// تحديث المستخدم
export const updateUserSchema = userBaseSchema.extend({
  password: z
    .string()
    .min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "كلمة المرور يجب أن تحتوي على حرف كبير وصغير ورقم")
    .optional()
    .or(z.literal("")),
  
  status: z.enum(["active", "inactive", "suspended"]).optional(),
})

// بيانات المطعم
export const restaurantSchema = z.object({
  name: z
    .string()
    .min(2, "اسم المطعم يجب أن يكون حرفين على الأقل")
    .max(150, "اسم المطعم يجب ألا يزيد عن 150 حرف"),
  
  businessName: z
    .string()
    .max(200, "الاسم التجاري يجب ألا يزيد عن 200 حرف")
    .optional()
    .or(z.literal("")),
  
  commercialRegNo: z
    .string()
    .regex(/^[0-9]{10}$/, "رقم السجل التجاري يجب أن يكون 10 أرقام")
    .optional()
    .or(z.literal("")),
  
  taxNumber: z
    .string()
    .regex(/^[0-9]{15}$/, "الرقم الضريبي يجب أن يكون 15 رقم")
    .optional()
    .or(z.literal("")),
  
  address: z
    .string()
    .max(500, "العنوان يجب ألا يزيد عن 500 حرف")
    .optional()
    .or(z.literal("")),
  
  city: z
    .string()
    .max(100, "المدينة يجب ألا تزيد عن 100 حرف")
    .optional()
    .or(z.literal("")),
  
  district: z
    .string()
    .max(100, "الحي يجب ألا يزيد عن 100 حرف")
    .optional()
    .or(z.literal("")),
  
  postalCode: z
    .string()
    .regex(/^[0-9]{5}$/, "الرمز البريدي يجب أن يكون 5 أرقام")
    .optional()
    .or(z.literal("")),
  
  phone: z
    .string()
    .regex(/^(\+966|966|0)?5[0-9]{8}$/, "رقم الهاتف السعودي غير صحيح")
    .optional()
    .or(z.literal("")),
  
  email: z
    .string()
    .email("البريد الإلكتروني غير صحيح")
    .optional()
    .or(z.literal("")),
  
  website: z
    .string()
    .url("رابط الموقع غير صحيح")
    .optional()
    .or(z.literal("")),
  
  monthlyQuota: z
    .number()
    .int()
    .positive("الحصة الشهرية يجب أن تكون رقم موجب")
    .default(18000),
  
  marketerId: z.string().optional(),
})

// بيانات البنك
export const bankSchema = z.object({
  name: z
    .string()
    .min(2, "اسم البنك يجب أن يكون حرفين على الأقل")
    .max(150, "اسم البنك يجب ألا يزيد عن 150 حرف"),
  
  branch: z
    .string()
    .max(100, "اسم الفرع يجب ألا يزيد عن 100 حرف")
    .optional()
    .or(z.literal("")),
  
  swiftCode: z
    .string()
    .regex(/^[A-Z]{4}[A-Z0-9]{2}([A-Z0-9]{3})?$/, "رمز Swift غير صحيح")
    .optional()
    .or(z.literal("")),
  
  address: z
    .string()
    .max(500, "العنوان يجب ألا يزيد عن 500 حرف")
    .optional()
    .or(z.literal("")),
  
  phone: z
    .string()
    .regex(/^(\+966|966|0)?[1-9][0-9]{6,8}$/, "رقم الهاتف غير صحيح")
    .optional()
    .or(z.literal("")),
  
  email: z
    .string()
    .email("البريد الإلكتروني غير صحيح")
    .optional()
    .or(z.literal("")),
})

// بيانات المورد
export const supplierSchema = z.object({
  name: z
    .string()
    .min(2, "اسم المورد يجب أن يكون حرفين على الأقل")
    .max(150, "اسم المورد يجب ألا يزيد عن 150 حرف"),
  
  specialization: z
    .string()
    .max(100, "التخصص يجب ألا يزيد عن 100 حرف")
    .optional()
    .or(z.literal("")),
  
  address: z
    .string()
    .max(500, "العنوان يجب ألا يزيد عن 500 حرف")
    .optional()
    .or(z.literal("")),
  
  phone: z
    .string()
    .regex(/^(\+966|966|0)?[1-9][0-9]{6,8}$/, "رقم الهاتف غير صحيح")
    .optional()
    .or(z.literal("")),
  
  email: z
    .string()
    .email("البريد الإلكتروني غير صحيح")
    .optional()
    .or(z.literal("")),
})

// العقود
export const contractSchema = z.object({
  restaurantId: z.string().min(1, "يجب اختيار مطعم"),
  bankId: z.string().min(1, "يجب اختيار بنك"),
  
  contractNumber: z
    .string()
    .max(50, "رقم العقد يجب ألا يزيد عن 50 حرف")
    .optional()
    .or(z.literal("")),
  
  startDate: z.date({ required_error: "تاريخ البداية مطلوب" }),
  endDate: z.date({ required_error: "تاريخ النهاية مطلوب" }),
  
  monthlyAmount: z
    .number()
    .positive("المبلغ الشهري يجب أن يكون موجب")
    .multipleOf(0.01, "المبلغ يجب أن يكون بصيغة صحيحة"),
}).refine((data) => data.endDate > data.startDate, {
  message: "تاريخ النهاية يجب أن يكون بعد تاريخ البداية",
  path: ["endDate"],
})

// الضمانات البنكية
export const guaranteeSchema = z.object({
  contractId: z.string().min(1, "يجب اختيار عقد"),
  
  amount: z
    .number()
    .positive("مبلغ الضمانة يجب أن يكون موجب")
    .multipleOf(0.01, "المبلغ يجب أن يكون بصيغة صحيحة"),
  
  currency: z.enum(["SAR", "USD", "EUR"]).default("SAR"),
  
  type: z.enum(["bank_guarantee", "cash_deposit", "letter_of_credit"]),
  
  referenceNo: z
    .string()
    .max(100, "الرقم المرجعي يجب ألا يزيد عن 100 حرف")
    .optional()
    .or(z.literal("")),
  
  validFrom: z.date().optional(),
  validTo: z.date().optional(),
  
  notes: z
    .string()
    .max(1000, "الملاحظات يجب ألا تزيد عن 1000 حرف")
    .optional()
    .or(z.literal("")),
}).refine((data) => {
  if (data.validFrom && data.validTo) {
    return data.validTo > data.validFrom
  }
  return true
}, {
  message: "تاريخ انتهاء الضمانة يجب أن يكون بعد تاريخ البداية",
  path: ["validTo"],
})

// التصاميم
export const designSchema = z.object({
  restaurantId: z.string().min(1, "يجب اختيار مطعم"),
  
  title: z
    .string()
    .max(200, "عنوان التصميم يجب ألا يزيد عن 200 حرف")
    .optional()
    .or(z.literal("")),
  
  description: z
    .string()
    .max(1000, "وصف التصميم يجب ألا يزيد عن 1000 حرف")
    .optional()
    .or(z.literal("")),
  
  designType: z.enum(["packaging", "logo", "label"]).default("packaging"),
  
  notes: z
    .string()
    .max(1000, "الملاحظات يجب ألا تزيد عن 1000 حرف")
    .optional()
    .or(z.literal("")),
  
  designerNotes: z
    .string()
    .max(1000, "ملاحظات المصمم يجب ألا تزيد عن 1000 حرف")
    .optional()
    .or(z.literal("")),
})

// أوامر الطباعة
export const printOrderSchema = z.object({
  bankId: z.string().min(1, "يجب اختيار بنك"),
  supplierId: z.string().optional(),
  
  orderNumber: z
    .string()
    .max(50, "رقم الأمر يجب ألا يزيد عن 50 حرف")
    .optional()
    .or(z.literal("")),
  
  totalAmount: z
    .number()
    .positive("إجمالي المبلغ يجب أن يكون موجب")
    .multipleOf(0.01, "المبلغ يجب أن يكون بصيغة صحيحة"),
  
  currency: z.enum(["SAR", "USD", "EUR"]).default("SAR"),
  
  expectedDate: z.date().optional(),
  deliveryDate: z.date().optional(),
  
  notes: z
    .string()
    .max(1000, "الملاحظات يجب ألا تزيد عن 1000 حرف")
    .optional()
    .or(z.literal("")),
})

// تفاصيل أوامر الطباعة
export const printOrderDetailSchema = z.object({
  printOrderId: z.string().min(1, "يجب اختيار أمر طباعة"),
  restaurantId: z.string().min(1, "يجب اختيار مطعم"),
  designId: z.string().min(1, "يجب اختيار تصميم"),
  
  ketchupQty: z
    .number()
    .int()
    .min(0, "كمية الكاتشب يجب أن تكون صفر أو أكثر")
    .default(0),
  
  chiliQty: z
    .number()
    .int()
    .min(0, "كمية الشطة يجب أن تكون صفر أو أكثر")
    .default(0),
  
  unitPrice: z
    .number()
    .positive("سعر الوحدة يجب أن يكون موجب")
    .multipleOf(0.0001, "السعر يجب أن يكون بصيغة صحيحة"),
}).refine((data) => data.ketchupQty > 0 || data.chiliQty > 0, {
  message: "يجب أن تكون هناك كمية من الكاتشب أو الشطة على الأقل",
  path: ["ketchupQty"],
})

// الفواتير
export const invoiceSchema = z.object({
  restaurantId: z.string().min(1, "يجب اختيار مطعم"),
  
  invoiceNumber: z
    .string()
    .max(50, "رقم الفاتورة يجب ألا يزيد عن 50 حرف")
    .optional()
    .or(z.literal("")),
  
  amount: z
    .number()
    .positive("مبلغ الفاتورة يجب أن يكون موجب")
    .multipleOf(0.01, "المبلغ يجب أن يكون بصيغة صحيحة"),
  
  currency: z.enum(["SAR", "USD", "EUR"]).default("SAR"),
  
  periodFrom: z.date({ required_error: "تاريخ بداية الفترة مطلوب" }),
  periodTo: z.date({ required_error: "تاريخ نهاية الفترة مطلوب" }),
  
  ketchupQty: z
    .number()
    .int()
    .min(0, "كمية الكاتشب يجب أن تكون صفر أو أكثر"),
  
  chiliQty: z
    .number()
    .int()
    .min(0, "كمية الشطة يجب أن تكون صفر أو أكثر"),
  
  unitPrice: z
    .number()
    .positive("سعر الوحدة يجب أن يكون موجب")
    .multipleOf(0.0001, "السعر يجب أن يكون بصيغة صحيحة"),
  
  dueDate: z.date({ required_error: "تاريخ الاستحقاق مطلوب" }),
}).refine((data) => data.periodTo > data.periodFrom, {
  message: "تاريخ نهاية الفترة يجب أن يكون بعد تاريخ البداية",
  path: ["periodTo"],
}).refine((data) => data.ketchupQty > 0 || data.chiliQty > 0, {
  message: "يجب أن تكون هناك كمية من الكاتشب أو الشطة على الأقل",
  path: ["ketchupQty"],
})

// المدفوعات
export const paymentSchema = z.object({
  invoiceId: z.string().min(1, "يجب اختيار فاتورة"),
  
  amount: z
    .number()
    .positive("مبلغ الدفعة يجب أن يكون موجب")
    .multipleOf(0.01, "المبلغ يجب أن يكون بصيغة صحيحة"),
  
  currency: z.enum(["SAR", "USD", "EUR"]).default("SAR"),
  
  method: z.enum(["cash", "transfer", "cheque", "card"]),
  
  referenceNo: z
    .string()
    .max(100, "الرقم المرجعي يجب ألا يزيد عن 100 حرف")
    .optional()
    .or(z.literal("")),
  
  notes: z
    .string()
    .max(1000, "الملاحظات يجب ألا تزيد عن 1000 حرف")
    .optional()
    .or(z.literal("")),
  
  paidAt: z.date({ required_error: "تاريخ الدفع مطلوب" }),
})

// الأقساط
export const installmentSchema = z.object({
  contractId: z.string().min(1, "يجب اختيار عقد"),
  
  amount: z
    .number()
    .positive("مبلغ القسط يجب أن يكون موجب")
    .multipleOf(0.01, "المبلغ يجب أن يكون بصيغة صحيحة"),
  
  currency: z.enum(["SAR", "USD", "EUR"]).default("SAR"),
  
  dueDate: z.date({ required_error: "تاريخ الاستحقاق مطلوب" }),
  
  notes: z
    .string()
    .max(1000, "الملاحظات يجب ألا تزيد عن 1000 حرف")
    .optional()
    .or(z.literal("")),
})

// تحديث المخزون
export const inventoryUpdateSchema = z.object({
  restaurantId: z.string().min(1, "يجب اختيار مطعم"),
  
  ketchupRemaining: z
    .number()
    .int()
    .min(0, "الكمية المتبقية يجب أن تكون صفر أو أكثر")
    .optional(),
  
  chiliRemaining: z
    .number()
    .int()
    .min(0, "الكمية المتبقية يجب أن تكون صفر أو أكثر")
    .optional(),
})

// البحث والفلترة
export const searchSchema = z.object({
  query: z.string().max(100, "نص البحث يجب ألا يزيد عن 100 حرف").optional(),
  status: z.string().optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().min(1).max(100).default(20),
})

// رفع الملفات
export const fileUploadSchema = z.object({
  fileName: z.string().min(1, "اسم الملف مطلوب"),
  fileSize: z.number().max(5242880, "حجم الملف يجب ألا يزيد عن 5 ميجابايت"), // 5MB
  fileType: z.string().regex(/^(image|application|text)\//, "نوع الملف غير مدعوم"),
})

// أنواع البيانات المستخرجة من المخططات
export type SignInInput = z.infer<typeof signInSchema>
export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type RestaurantInput = z.infer<typeof restaurantSchema>
export type BankInput = z.infer<typeof bankSchema>
export type SupplierInput = z.infer<typeof supplierSchema>
export type ContractInput = z.infer<typeof contractSchema>
export type GuaranteeInput = z.infer<typeof guaranteeSchema>
export type DesignInput = z.infer<typeof designSchema>
export type PrintOrderInput = z.infer<typeof printOrderSchema>
export type PrintOrderDetailInput = z.infer<typeof printOrderDetailSchema>
export type InvoiceInput = z.infer<typeof invoiceSchema>
export type PaymentInput = z.infer<typeof paymentSchema>
export type InstallmentInput = z.infer<typeof installmentSchema>
export type InventoryUpdateInput = z.infer<typeof inventoryUpdateSchema>
export type SearchInput = z.infer<typeof searchSchema>
export type FileUploadInput = z.infer<typeof fileUploadSchema>
