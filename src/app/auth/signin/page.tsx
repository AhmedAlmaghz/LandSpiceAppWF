'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card'

const signInSchema = z.object({
  username: z.string().min(1, 'اسم المستخدم مطلوب'),
  password: z.string().min(1, 'كلمة المرور مطلوبة'),
})

type SignInForm = z.infer<typeof signInSchema>

export default function SignInPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'
  const error = searchParams.get('error')

  const [isLoading, setIsLoading] = useState(false)
  const [authError, setAuthError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
  })

  const onSubmit = async (data: SignInForm) => {
    try {
      setIsLoading(true)
      setAuthError('')

      const result = await signIn('credentials', {
        username: data.username,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        setAuthError('اسم المستخدم أو كلمة المرور غير صحيحة')
      } else if (result?.ok) {
        // الحصول على معلومات المستخدم لتوجيهه للوحة المناسبة
        const session = await getSession()
        if (session?.user?.roleName) {
          const roleRoutes: Record<string, string> = {
            admin: '/admin/dashboard',
            restaurant: '/restaurant/dashboard',
            bank: '/bank/dashboard',
            supplier: '/supplier/dashboard',
            marketer: '/marketer/dashboard',
            landspace_staff: '/staff/dashboard',
          }
          
          const targetUrl = roleRoutes[session.user.roleName] || callbackUrl
          router.push(targetUrl)
        } else {
          router.push(callbackUrl)
        }
      }
    } catch (error) {
      console.error('خطأ في تسجيل الدخول:', error)
      setAuthError('حدث خطأ أثناء تسجيل الدخول. حاول مرة أخرى.')
    } finally {
      setIsLoading(false)
    }
  }

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'CredentialsSignin':
        return 'اسم المستخدم أو كلمة المرور غير صحيحة'
      case 'AccountDeactivated':
        return 'حسابك غير مفعل. تواصل مع الإدارة.'
      case 'CallbackRouteError':
        return 'حدث خطأ في النظام. حاول مرة أخرى.'
      default:
        return error ? 'حدث خطأ غير متوقع' : null
    }
  }

  const errorMessage = getErrorMessage(error) || authError

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-red-600 rounded-2xl flex items-center justify-center mb-6">
            <span className="text-white font-bold text-2xl">LS</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">تسجيل الدخول</h2>
          <p className="mt-2 text-gray-600">
            أدخل بيانات حسابك للوصول إلى نظام لاند سبايس
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="alert-error">
            <svg className="w-5 h-5 ml-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {errorMessage}
          </div>
        )}

        {/* Sign In Form */}
        <Card className="shadow-moderate">
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardHeader className="text-center">
              <CardTitle>تسجيل الدخول</CardTitle>
              <CardDescription>
                مرحباً بك مرة أخرى في نظام إدارة لاند سبايس
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <Input
                label="اسم المستخدم"
                type="text"
                autoComplete="username"
                required
                error={errors.username?.message}
                {...register('username')}
              />

              <Input
                label="كلمة المرور"
                type="password"
                autoComplete="current-password"
                required
                error={errors.password?.message}
                {...register('password')}
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="mr-2 block text-sm text-gray-900">
                    تذكرني
                  </label>
                </div>

                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-red-600 hover:text-red-500"
                >
                  نسيت كلمة المرور؟
                </Link>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                isLoading={isLoading}
              >
                {isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
              </Button>

              <div className="text-center text-sm text-gray-600">
                ليس لديك حساب؟{' '}
                <Link
                  href="/auth/signup"
                  className="font-medium text-red-600 hover:text-red-500"
                >
                  إنشاء حساب جديد
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>

        {/* Demo Accounts */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800 text-sm">حسابات تجريبية (للاختبار)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-blue-700">
            <div><strong>مدير النظام:</strong> admin / Admin@123456</div>
            <div><strong>مطعم:</strong> albaik_rest / Restaurant@123456</div>
            <div><strong>بنك:</strong> alqasemi_bank / Bank@123456</div>
            <div><strong>مورد:</strong> print_supplier / Supplier@123456</div>
          </CardContent>
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
