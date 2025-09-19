import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    // التحقق من المصادقة
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const userRole = session.user.role

    // بناء النشاطات حسب الدور
    let activities: any[] = []

    if (['admin', 'landspice_employee'].includes(userRole)) {
      // نشاطات شاملة للمدير وموظفي لاند سبايس
      const [recentUsers, recentRestaurants, recentContracts, recentInvoices] = await Promise.all([
        // المستخدمون الجدد
        prisma.user.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            role: { select: { displayName: true } }
          }
        }),
        
        // المطاعم الجديدة
        prisma.restaurant.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            user: { 
              select: { firstName: true, lastName: true, username: true } 
            }
          }
        }),
        
        // العقود الجديدة
        prisma.contract.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            restaurant: { 
              select: { name: true } 
            },
            bank: { 
              select: { name: true } 
            }
          }
        }),
        
        // الفواتير المدفوعة مؤخراً
        prisma.invoice.findMany({
          take: 5,
          where: { status: 'paid' },
          orderBy: { updatedAt: 'desc' },
          include: {
            restaurant: { 
              select: { name: true } 
            }
          }
        })
      ])

      // تحويل البيانات لنشاطات
      recentUsers.forEach(user => {
        activities.push({
          id: `user-${user.id}`,
          type: 'success',
          title: 'تسجيل مستخدم جديد',
          description: `${user.firstName || user.username} انضم كـ ${user.role.displayName}`,
          timestamp: user.createdAt,
          user: {
            name: user.firstName || user.username,
            role: user.role.displayName
          }
        })
      })

      recentRestaurants.forEach(restaurant => {
        activities.push({
          id: `restaurant-${restaurant.id}`,
          type: 'success',
          title: 'تسجيل مطعم جديد',
          description: `${restaurant.name} تم تسجيله في النظام`,
          timestamp: restaurant.createdAt,
          user: {
            name: restaurant.user.firstName || restaurant.user.username,
            role: 'مطعم'
          }
        })
      })

      recentContracts.forEach(contract => {
        activities.push({
          id: `contract-${contract.id}`,
          type: 'info',
          title: 'عقد جديد',
          description: `تم إنشاء عقد بين ${contract.restaurant.name} و ${contract.bank.name}`,
          timestamp: contract.createdAt
        })
      })

      recentInvoices.forEach(invoice => {
        activities.push({
          id: `invoice-${invoice.id}`,
          type: 'success',
          title: 'دفع فاتورة',
          description: `${invoice.restaurant.name} قام بدفع فاتورة بقيمة ${invoice.totalAmount} ريال`,
          timestamp: invoice.updatedAt,
          user: {
            name: invoice.restaurant.name,
            role: 'مطعم'
          }
        })
      })

    } else if (userRole === 'restaurant') {
      // نشاطات خاصة بالمطعم
      const restaurant = await prisma.restaurant.findUnique({
        where: { userId: session.user.id }
      })

      if (restaurant) {
        const [recentDesigns, recentInvoices, recentOrders] = await Promise.all([
          prisma.design.findMany({
            where: { restaurantId: restaurant.id },
            take: 5,
            orderBy: { updatedAt: 'desc' }
          }),
          
          prisma.invoice.findMany({
            where: { restaurantId: restaurant.id },
            take: 5,
            orderBy: { updatedAt: 'desc' }
          }),
          
          prisma.printOrderDetail.findMany({
            where: { restaurantId: restaurant.id },
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
              printOrder: { select: { status: true } }
            }
          })
        ])

        recentDesigns.forEach(design => {
          const statusMap: any = {
            'submitted': { type: 'info', title: 'تم رفع تصميم' },
            'approved': { type: 'success', title: 'تم قبول التصميم' },
            'rejected': { type: 'warning', title: 'تم رفض التصميم' },
            'under_review': { type: 'info', title: 'التصميم قيد المراجعة' }
          }
          
          const statusInfo = statusMap[design.status] || { type: 'info', title: 'تحديث تصميم' }
          
          activities.push({
            id: `design-${design.id}`,
            type: statusInfo.type,
            title: statusInfo.title,
            description: design.title || 'تصميم بدون عنوان',
            timestamp: design.updatedAt
          })
        })

        recentInvoices.forEach(invoice => {
          const statusMap: any = {
            'paid': { type: 'success', title: 'تم دفع فاتورة' },
            'pending': { type: 'warning', title: 'فاتورة جديدة' },
            'overdue': { type: 'error', title: 'فاتورة متأخرة' }
          }
          
          const statusInfo = statusMap[invoice.status] || { type: 'info', title: 'تحديث فاتورة' }
          
          activities.push({
            id: `invoice-${invoice.id}`,
            type: statusInfo.type,
            title: statusInfo.title,
            description: `فاتورة بقيمة ${invoice.totalAmount} ريال`,
            timestamp: invoice.updatedAt
          })
        })
      }

    } else if (userRole === 'bank') {
      // نشاطات خاصة بالبنك
      const bank = await prisma.bank.findUnique({
        where: { userId: session.user.id }
      })

      if (bank) {
        const [recentGuarantees, recentInstallments] = await Promise.all([
          prisma.guarantee.findMany({
            where: { contract: { bankId: bank.id } },
            take: 5,
            orderBy: { updatedAt: 'desc' },
            include: {
              contract: {
                include: {
                  restaurant: { select: { name: true } }
                }
              }
            }
          }),
          
          prisma.installment.findMany({
            where: { contract: { bankId: bank.id } },
            take: 5,
            orderBy: { updatedAt: 'desc' },
            include: {
              contract: {
                include: {
                  restaurant: { select: { name: true } }
                }
              }
            }
          })
        ])

        recentGuarantees.forEach(guarantee => {
          const statusMap: any = {
            'approved': { type: 'success', title: 'تم قبول ضمانة' },
            'rejected': { type: 'error', title: 'تم رفض ضمانة' },
            'pending': { type: 'warning', title: 'ضمانة جديدة' }
          }
          
          const statusInfo = statusMap[guarantee.status] || { type: 'info', title: 'تحديث ضمانة' }
          
          activities.push({
            id: `guarantee-${guarantee.id}`,
            type: statusInfo.type,
            title: statusInfo.title,
            description: `ضمانة ${guarantee.contract.restaurant.name} بقيمة ${guarantee.amount}`,
            timestamp: guarantee.updatedAt
          })
        })

        recentInstallments.forEach(installment => {
          const statusMap: any = {
            'paid': { type: 'success', title: 'تم دفع قسط' },
            'overdue': { type: 'error', title: 'قسط متأخر' },
            'pending': { type: 'warning', title: 'قسط مستحق' }
          }
          
          const statusInfo = statusMap[installment.status] || { type: 'info', title: 'تحديث قسط' }
          
          activities.push({
            id: `installment-${installment.id}`,
            type: statusInfo.type,
            title: statusInfo.title,
            description: `قسط ${installment.contract.restaurant.name} بقيمة ${installment.amount}`,
            timestamp: installment.updatedAt
          })
        })
      }
    }

    // ترتيب النشاطات حسب التاريخ وأخذ العدد المطلوب
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    activities = activities.slice(0, limit)

    return NextResponse.json({
      success: true,
      data: activities
    })

  } catch (error) {
    console.error('خطأ في جلب النشاطات:', error)
    return NextResponse.json(
      { error: 'حدث خطأ داخلي في الخادم' },
      { status: 500 }
    )
  }
}
