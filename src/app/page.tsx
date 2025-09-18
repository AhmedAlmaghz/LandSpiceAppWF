import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">LS</span>
                </div>
                <h1 className="mr-3 text-xl font-bold text-gray-900">لاند سبايس</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 space-x-reverse">
              <Link 
                href="/auth/signin" 
                className="btn-secondary px-4 py-2"
              >
                تسجيل الدخول
              </Link>
              <Link 
                href="/auth/signup" 
                className="btn-primary px-4 py-2"
              >
                إنشاء حساب
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-red-600 rounded-2xl mb-6">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            نظام إدارة 
            <span className="text-red-600"> لاند سبايس</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            نظام متكامل لإدارة تصنيع وتوزيع عبوات الشطة والكاتشب المخصصة للمطاعم
            مع إدارة العقود والضمانات البنكية وسير العمل المتقدم
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link 
              href="/auth/signup" 
              className="btn-primary px-8 py-3 text-lg w-full sm:w-auto"
            >
              ابدأ الآن مجاناً
            </Link>
            <Link 
              href="#features" 
              className="btn-secondary px-8 py-3 text-lg w-full sm:w-auto"
            >
              تعرف على المزيد
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">المزايا الرئيسية</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              حلول شاملة لإدارة عمليات التصنيع والتوزيع والعقود
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="card hover-lift">
              <div className="card-header">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="card-title">إدارة المستخدمين</h3>
                <p className="card-description">
                  نظام أدوار وصلاحيات متقدم للمطاعم والبنوك والموردين
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="card hover-lift">
              <div className="card-header">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="card-title">إدارة العقود</h3>
                <p className="card-description">
                  تتبع العقود والضمانات البنكية مع التجديد التلقائي
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="card hover-lift">
              <div className="card-header">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="card-title">سير عمل ذكي</h3>
                <p className="card-description">
                  محرك سير عمل متقدم لإدارة العمليات خطوة بخطوة
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="card hover-lift">
              <div className="card-header">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v14a2 2 0 002 2h8a2 2 0 002-2V6a2 2 0 00-2-2" />
                  </svg>
                </div>
                <h3 className="card-title">إدارة المخزون</h3>
                <p className="card-description">
                  تتبع المخزون والتنبيهات الذكية عند النقص
                </p>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="card hover-lift">
              <div className="card-header">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="card-title">النظام المالي</h3>
                <p className="card-description">
                  فوترة تلقائية وإدارة المدفوعات والأقساط البنكية
                </p>
              </div>
            </div>

            {/* Feature 6 */}
            <div className="card hover-lift">
              <div className="card-header">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="card-title">التقارير والإحصائيات</h3>
                <p className="card-description">
                  لوحات معلومات شاملة وتقارير تفصيلية للأداء
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 bg-red-600 rounded-2xl p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">هل أنت جاهز للبدء؟</h2>
          <p className="text-red-100 mb-6 max-w-2xl mx-auto">
            انضم إلى شركاء النجاح وابدأ رحلتك مع نظام لاند سبايس المتطور
          </p>
          <Link 
            href="/auth/signup" 
            className="bg-white text-red-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-medium inline-flex items-center transition-colors"
          >
            ابدأ الآن
            <svg className="mr-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">LS</span>
              </div>
              <h3 className="mr-3 text-xl font-bold">لاند سبايس</h3>
            </div>
            <p className="text-gray-400 mb-4">
              نظام متكامل لإدارة عمليات التصنيع والتوزيع
            </p>
            <p className="text-gray-500 text-sm">
              2025 لاند سبايس. جميع الحقوق محفوظة.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
