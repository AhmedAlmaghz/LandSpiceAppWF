'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'

const errorMessages: Record<string, { title: string; description: string; icon: string }> = {
  Configuration: {
    title: 'خطأ في الإعدادات',
    description: 'حدث خطأ في إعدادات النظام. تواصل مع الدعم التقني.',
    icon: '⚙️'
  },
  AccessDenied: {
    title: 'الوصول مرفوض',
    description: 'ليس لديك صلاحية للوصول إلى هذا المورد.',
    icon: '🚫'
  },
  Verification: {
    title: 'فشل في التحقق',
    description: 'حدث خطأ أثناء التحقق من هويتك. حاول مرة أخرى.',
    icon: '❌'
  },
  CredentialsSignin: {
    title: 'بيانات خاطئة',
    description: 'اسم المستخدم أو كلمة المرور غير صحيحة.',
    icon: '🔑'
  },
  AccountDeactivated: {
    title: 'حساب غير مفعل',
    description: 'حسابك غير مفعل حالياً. تواصل مع الإدارة لتفعيل حسابك.',
    icon: '⏸️'
  },
  SessionRequired: {
    title: 'تسجيل دخول مطلوب',
    description: 'يجب تسجيل الدخول للوصول إلى هذه الصفحة.',
    icon: '🔐'
  },
  CallbackRouteError: {
    title: 'خطأ في النظام',
    description: 'حدث خطأ أثناء معالجة طلبك. حاول مرة أخرى لاحقاً.',
    icon: '💥'
  },
  default: {
    title: 'خطأ غير متوقع',
    description: 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.',
    icon: '❓'
  }
}

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error') || 'default'
  const errorInfo = errorMessages[error] || errorMessages.default

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-red-600 rounded-2xl flex items-center justify-center mb-6">
            <span className="text-white font-bold text-2xl">LS</span>
          </div>
        </div>

        {/* Error Card */}
        <Card className="shadow-moderate">
          <CardHeader className="text-center">
            <div className="text-4xl mb-4">{errorInfo.icon}</div>
            <CardTitle className="text-red-600">{errorInfo.title}</CardTitle>
            <CardDescription className="text-gray-600">
              {errorInfo.description}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error === 'AccountDeactivated' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="mr-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      معلومات إضافية
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>
                        إذا كنت تعتقد أن هناك خطأ، يرجى التواصل مع فريق الدعم على:
                      </p>
                      <ul className="list-disc list-inside mt-2">
                        <li>البريد الإلكتروني: support@landspace.com</li>
                        <li>الهاتف: +966112345678</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {error === 'CredentialsSignin' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-800 mb-2">نصائح مفيدة:</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• تأكد من كتابة اسم المستخدم بشكل صحيح</li>
                  <li>• تأكد من أن كلمة المرور صحيحة</li>
                  <li>• تحقق من أن Caps Lock غير مفعل</li>
                  <li>• إذا نسيت كلمة المرور، استخدم خيار "نسيت كلمة المرور"</li>
                </ul>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col space-y-3">
            <Link href="/auth/signin" className="w-full">
              <Button variant="primary" size="lg" className="w-full">
                العودة لتسجيل الدخول
              </Button>
            </Link>

            {error === 'CredentialsSignin' && (
              <Link href="/auth/forgot-password" className="w-full">
                <Button variant="secondary" size="lg" className="w-full">
                  نسيت كلمة المرور؟
                </Button>
              </Link>
            )}

            <Link href="/" className="w-full">
              <Button variant="ghost" size="lg" className="w-full">
                العودة للصفحة الرئيسية
              </Button>
            </Link>
          </CardFooter>
        </Card>

        {/* Help Section */}
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="text-center py-6">
            <h3 className="text-sm font-medium text-gray-900 mb-2">تحتاج مساعدة؟</h3>
            <p className="text-sm text-gray-600 mb-4">
              فريق الدعم جاهز لمساعدتك على مدار الساعة
            </p>
            
            <div className="flex justify-center space-x-4 space-x-reverse">
              <a
                href="mailto:support@landspace.com"
                className="inline-flex items-center text-sm text-red-600 hover:text-red-500"
              >
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                إرسال بريد
              </a>
              
              <a
                href="tel:+966112345678"
                className="inline-flex items-center text-sm text-red-600 hover:text-red-500"
              >
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                اتصال
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
