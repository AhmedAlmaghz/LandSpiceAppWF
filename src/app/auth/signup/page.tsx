'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card'

const signUpSchema = z.object({
  username: z
    .string()
    .min(3, 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل')
    .max(50, 'اسم المستخدم يجب ألا يزيد عن 50 حرف')
    .regex(/^[a-zA-Z0-9_]+$/, 'اسم المستخدم يجب أن يحتوي على أحرف وأرقام فقط'),
  
  email: z
    .string()
    .email('البريد الإلكتروني غير صحيح'),
  
  firstName: z
    .string()
    .min(2, 'الاسم الأول يجب أن يكون حرفين على الأقل')
    .max(100, 'الاسم الأول يجب ألا يزيد عن 100 حرف'),
  
  lastName: z
    .string()
    .min(2, 'اسم العائلة يجب أن يكون حرفين على الأقل')
    .max(100, 'اسم العائلة يجب ألا يزيد عن 100 حرف'),
  
  phone: z
    .string()
    .regex(/^(\+966|966|0)?5[0-9]{8}$/, 'رقم الهاتف السعودي غير صحيح')
    .optional()
    .or(z.literal('')),
  
  password: z
    .string()
    .min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'كلمة المرور يجب أن تحتوي على حرف كبير وصغير ورقم'),
  
  confirmPassword: z.string(),
  
  accountType: z.enum(['restaurant', 'marketer'], {
    required_error: 'يجب اختيار نوع الحساب'
  }),
  
  terms: z.boolean().refine(val => val === true, {
    message: 'يجب الموافقة على الشروط والأحكام'
  })
}).refine((data) => data.password === data.confirmPassword, {
  message: 'كلمة المرور وتأكيدها غير متطابقتان',
  path: ['confirmPassword'],
})

type SignUpForm = z.infer<typeof signUpSchema>

export default function SignUpPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
  })

  const accountType = watch('accountType')

  const onSubmit = async (data: SignUpForm) => {
    try {
      setIsLoading(true)
      setError('')

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: data.username,
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone || undefined,
          password: data.password,
          accountType: data.accountType,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'حدث خطأ أثناء إنشاء الحساب')
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/auth/signin?message=account-created')
      }, 2000)

    } catch (error: any) {
      console.error('خطأ في التسجيل:', error)
      setError(error.message || 'حدث خطأ أثناء إنشاء الحساب. حاول مرة أخرى.')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
        <Card className="max-w-md w-full">
          <CardContent className="text-center py-8">
            <div className="mx-auto h-16 w-16 bg-green-600 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">تم إنشاء الحساب بنجاح!</h2>
            <p className="text-gray-600 mb-4">
              سيتم توجيهك لصفحة تسجيل الدخول خلال لحظات...
            </p>
            <p className="text-sm text-yellow-600">
              <strong>ملاحظة:</strong> حسابك بحاجة لموافقة الإدارة قبل التفعيل
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-red-600 rounded-2xl flex items-center justify-center mb-6">
            <span className="text-white font-bold text-2xl">LS</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">إنشاء حساب جديد</h2>
          <p className="mt-2 text-gray-600">
            انضم إلى نظام إدارة لاند سبايس
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert-error">
            <svg className="w-5 h-5 ml-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {/* Sign Up Form */}
        <Card className="shadow-moderate">
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardHeader className="text-center">
              <CardTitle>إنشاء حساب جديد</CardTitle>
              <CardDescription>
                املأ البيانات أدناه لإنشاء حسابك
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Account Type */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  نوع الحساب <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="relative">
                    <input
                      type="radio"
                      value="restaurant"
                      {...register('accountType')}
                      className="sr-only peer"
                    />
                    <div className="p-3 border-2 border-gray-200 rounded-lg cursor-pointer peer-checked:border-red-500 peer-checked:bg-red-50 transition-colors">
                      <div className="text-center">
                        <div className="text-2xl mb-1">🏪</div>
                        <div className="text-sm font-medium">مطعم</div>
                      </div>
                    </div>
                  </label>
                  
                  <label className="relative">
                    <input
                      type="radio"
                      value="marketer"
                      {...register('accountType')}
                      className="sr-only peer"
                    />
                    <div className="p-3 border-2 border-gray-200 rounded-lg cursor-pointer peer-checked:border-red-500 peer-checked:bg-red-50 transition-colors">
                      <div className="text-center">
                        <div className="text-2xl mb-1">📈</div>
                        <div className="text-sm font-medium">مسوق</div>
                      </div>
                    </div>
                  </label>
                </div>
                {errors.accountType && (
                  <p className="text-sm text-red-600">{errors.accountType.message}</p>
                )}
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="الاسم الأول"
                  type="text"
                  required
                  error={errors.firstName?.message}
                  {...register('firstName')}
                />

                <Input
                  label="اسم العائلة"
                  type="text"
                  required
                  error={errors.lastName?.message}
                  {...register('lastName')}
                />
              </div>

              <Input
                label="اسم المستخدم"
                type="text"
                required
                helperText="سيتم استخدامه لتسجيل الدخول"
                error={errors.username?.message}
                {...register('username')}
              />

              <Input
                label="البريد الإلكتروني"
                type="email"
                required
                error={errors.email?.message}
                {...register('email')}
              />

              <Input
                label="رقم الهاتف"
                type="tel"
                placeholder="+966501234567"
                helperText="اختياري - يفضل إدخاله للتواصل"
                error={errors.phone?.message}
                {...register('phone')}
              />

              <Input
                label="كلمة المرور"
                type="password"
                required
                helperText="يجب أن تحتوي على 8 أحرف على الأقل، حرف كبير وصغير ورقم"
                error={errors.password?.message}
                {...register('password')}
              />

              <Input
                label="تأكيد كلمة المرور"
                type="password"
                required
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />

              {/* Terms */}
              <div className="flex items-start">
                <input
                  id="terms"
                  type="checkbox"
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded mt-1"
                  {...register('terms')}
                />
                <label htmlFor="terms" className="mr-3 text-sm text-gray-700">
                  أوافق على{' '}
                  <Link href="/terms" className="text-red-600 hover:text-red-500">
                    الشروط والأحكام
                  </Link>{' '}
                  و{' '}
                  <Link href="/privacy" className="text-red-600 hover:text-red-500">
                    سياسة الخصوصية
                  </Link>
                </label>
              </div>
              {errors.terms && (
                <p className="text-sm text-red-600">{errors.terms.message}</p>
              )}

              {/* Additional Info Based on Account Type */}
              {accountType === 'restaurant' && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>ملاحظة للمطاعم:</strong> بعد إنشاء الحساب، ستحتاج لإدخال بيانات المطعم التفصيلية وإرفاق المستندات المطلوبة.
                  </p>
                </div>
              )}

              {accountType === 'marketer' && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>ملاحظة للمسوقين:</strong> سيتم مراجعة طلبك من قبل الإدارة قبل تفعيل حسابك.
                  </p>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                isLoading={isLoading}
              >
                {isLoading ? 'جاري إنشاء الحساب...' : 'إنشاء الحساب'}
              </Button>

              <div className="text-center text-sm text-gray-600">
                لديك حساب بالفعل؟{' '}
                <Link
                  href="/auth/signin"
                  className="font-medium text-red-600 hover:text-red-500"
                >
                  تسجيل الدخول
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center justify-center"
          >
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            العودة إلى الصفحة الرئيسية
          </Link>
        </div>
      </div>
    </div>
  )
}
