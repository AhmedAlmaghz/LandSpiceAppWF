import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - جلب تفاصيل مستخدم واحد
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const userId = params.id

    // جلب تفاصيل المستخدم مع جميع العلاقات
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          select: {
            id: true,
            name: true,
            displayName: true,
            description: true
          }
        },
        restaurant: {
          select: {
            id: true,
            name: true,
            businessName: true,
            status: true,
            monthlyQuota: true,
            city: true,
            phone: true,
            email: true,
            createdAt: true,
            inventory: {
              select: {
                currentStock: true,
                minStock: true,
                maxStock: true
              }
            },
            contracts: {
              select: {
                id: true,
                status: true,
                monthlyAmount: true,
                startDate: true,
                endDate: true
              }
            },
            _count: {
              select: {
                designs: true,
                invoices: true,
                productionBatches: true
              }
            }
          }
        },
        bank: {
          select: {
            id: true,
            name: true,
            branch: true,
            swiftCode: true,
            phone: true,
            email: true,
            createdAt: true,
            _count: {
              select: {
                contracts: true,
                printOrders: true
              }
            }
          }
        },
        supplier: {
          select: {
            id: true,
            name: true,
            specialization: true,
            rating: true,
            totalOrders: true,
            phone: true,
            email: true,
            createdAt: true,
            _count: {
              select: {
                printOrders: true
              }
            }
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'المستخدم غير موجود' },
        { status: 404 }
      )
    }

    // جلب إحصائيات المستخدم
    const stats = await getUserStats(userId, user.role.name)

    // جلب النشاطات الأخيرة
    const activities = await getUserActivities(userId, user.role.name)

    // إزالة كلمة المرور من النتيجة
    const { password, ...safeUser } = user

    return NextResponse.json({
      success: true,
      data: {
        user: safeUser,
        stats,
        activities
      }
    })

  } catch (error) {
    console.error('خطأ في جلب تفاصيل المستخدم:', error)
    return NextResponse.json(
      { error: 'حدث خطأ داخلي في الخادم' },
      { status: 500 }
    )
  }
}

// دالة مساعدة لجلب إحصائيات المستخدم
async function getUserStats(userId: string, userRole: string) {
  const stats: any = {
    loginCount: 0,
    lastActivityDays: 0,
    relatedEntities: 0
  }

  try {
    // حساب عدد مرات الدخول (تقدير من WorkflowLog)
    const loginCount = await prisma.workflowLog.count({
      where: {
        userId,
        action: { contains: 'login' }
      }
    })
    stats.loginCount = loginCount

    // حساب أيام النشاط الأخير
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { lastLoginAt: true }
    })

    if (user?.lastLoginAt) {
      const daysDiff = Math.floor(
        (new Date().getTime() - user.lastLoginAt.getTime()) / (1000 * 60 * 60 * 24)
      )
      stats.lastActivityDays = daysDiff
    }

    // إحصائيات حسب نوع المستخدم
    switch (userRole) {
      case 'restaurant':
        const restaurant = await prisma.restaurant.findUnique({
          where: { userId },
          include: {
            _count: {
              select: {
                contracts: true,
                designs: true,
                invoices: true
              }
            }
          }
        })
        
        if (restaurant) {
          stats.relatedEntities = 1
          stats.activeContracts = restaurant._count.contracts
          stats.totalDesigns = restaurant._count.designs
          stats.totalInvoices = restaurant._count.invoices
        }
        break

      case 'bank':
        const bank = await prisma.bank.findUnique({
          where: { userId },
          include: {
            _count: {
              select: {
                contracts: true,
                printOrders: true
              }
            }
          }
        })
        
        if (bank) {
          stats.relatedEntities = 1
          stats.totalContracts = bank._count.contracts
          stats.totalPrintOrders = bank._count.printOrders
        }
        break

      case 'supplier':
        const supplier = await prisma.supplier.findUnique({
          where: { userId },
          include: {
            _count: {
              select: {
                printOrders: true
              }
            }
          }
        })
        
        if (supplier) {
          stats.relatedEntities = 1
          stats.totalOrders = supplier.totalOrders
          stats.averageRating = supplier.rating
        }
        break

      case 'marketer':
        const restaurantCount = await prisma.restaurant.count({
          where: { marketerId: userId }
        })
        stats.relatedEntities = restaurantCount
        stats.marketedRestaurants = restaurantCount
        break
    }

  } catch (error) {
    console.error('خطأ في جلب إحصائيات المستخدم:', error)
  }

  return stats
}

// دالة مساعدة لجلب النشاطات الأخيرة
async function getUserActivities(userId: string, userRole: string) {
  const activities: any[] = []

  try {
    // جلب سجل العمليات من WorkflowLog
    const workflowLogs = await prisma.workflowLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        workflowInstance: {
          select: {
            processName: true,
            currentStep: true
          }
        }
      }
    })

    workflowLogs.forEach(log => {
      let type: 'success' | 'warning' | 'info' | 'error' = 'info'
      
      if (log.action.includes('approved') || log.action.includes('completed')) {
        type = 'success'
      } else if (log.action.includes('rejected') || log.action.includes('failed')) {
        type = 'error'
      } else if (log.action.includes('pending') || log.action.includes('review')) {
        type = 'warning'
      }

      activities.push({
        id: log.id,
        type,
        title: log.action,
        description: log.notes || `${log.workflowInstance?.processName} - ${log.workflowInstance?.currentStep}`,
        timestamp: log.createdAt
      })
    })

    // إضافة أنشطة خاصة بنوع المستخدم
    switch (userRole) {
      case 'restaurant':
        // إضافة نشاطات التصاميم والطلبات
        const recentDesigns = await prisma.design.findMany({
          where: { 
            restaurant: { userId }
          },
          orderBy: { updatedAt: 'desc' },
          take: 5
        })

        recentDesigns.forEach(design => {
          activities.push({
            id: `design-${design.id}`,
            type: design.status === 'approved' ? 'success' : 
                  design.status === 'rejected' ? 'error' : 'info',
            title: 'تحديث تصميم',
            description: design.title || 'تصميم بدون عنوان',
            timestamp: design.updatedAt
          })
        })
        break

      case 'bank':
        // إضافة نشاطات الضمانات والعقود
        const recentGuarantees = await prisma.guarantee.findMany({
          where: {
            contract: {
              bank: { userId }
            }
          },
          orderBy: { updatedAt: 'desc' },
          take: 5,
          include: {
            contract: {
              include: {
                restaurant: {
                  select: { name: true }
                }
              }
            }
          }
        })

        recentGuarantees.forEach(guarantee => {
          activities.push({
            id: `guarantee-${guarantee.id}`,
            type: guarantee.status === 'approved' ? 'success' : 
                  guarantee.status === 'rejected' ? 'error' : 'warning',
            title: 'ضمانة بنكية',
            description: `ضمانة ${guarantee.contract.restaurant.name}`,
            timestamp: guarantee.updatedAt
          })
        })
        break
    }

    // ترتيب النشاطات حسب التاريخ
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  } catch (error) {
    console.error('خطأ في جلب نشاطات المستخدم:', error)
  }

  return activities.slice(0, 15) // أحدث 15 نشاط
}
