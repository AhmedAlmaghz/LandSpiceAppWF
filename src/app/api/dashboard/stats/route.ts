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

    // التحقق من الصلاحيات
    const userRole = session.user.role
    if (!['admin', 'landspice_employee'].includes(userRole)) {
      return NextResponse.json({ error: 'ليس لديك صلاحية' }, { status: 403 })
    }

    // جلب الإحصائيات حسب الدور
    let stats = {}

    if (userRole === 'admin') {
      // إحصائيات المدير الشاملة
      const [
        totalUsers,
        activeUsers,
        pendingUsers,
        totalRestaurants,
        activeRestaurants,
        totalContracts,
        activeContracts,
        totalRevenue,
        pendingOrders,
        lowStockAlerts
      ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { status: 'active' } }),
        prisma.user.count({ where: { status: 'pending' } }),
        prisma.restaurant.count(),
        prisma.restaurant.count({ where: { status: 'active' } }),
        prisma.contract.count(),
        prisma.contract.count({ where: { status: 'active' } }),
        prisma.invoice.aggregate({
          _sum: { totalAmount: true },
          where: {
            status: 'paid',
            createdAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            }
          }
        }),
        prisma.printOrder.count({ where: { status: 'pending' } }),
        prisma.inventory.count({ where: { currentStock: { lte: prisma.inventory.fields.minStock } } })
      ])

      stats = {
        totalUsers,
        activeUsers,
        pendingUsers,
        totalRestaurants,
        activeRestaurants,
        totalContracts,
        activeContracts,
        monthlyRevenue: totalRevenue._sum.totalAmount || 0,
        pendingOrders,
        lowStockAlerts,
        userGrowth: await calculateUserGrowth(),
        revenueGrowth: await calculateRevenueGrowth(),
        restaurantGrowth: await calculateRestaurantGrowth()
      }
    } else if (userRole === 'restaurant') {
      // إحصائيات المطعم
      const restaurant = await prisma.restaurant.findUnique({
        where: { userId: session.user.id }
      })

      if (!restaurant) {
        return NextResponse.json({ error: 'المطعم غير موجود' }, { status: 404 })
      }

      const [
        totalOrders,
        pendingOrders,
        completedOrders,
        totalInvoices,
        paidInvoices,
        currentInventory,
        designs
      ] = await Promise.all([
        prisma.printOrderDetail.count({ where: { restaurantId: restaurant.id } }),
        prisma.printOrderDetail.count({ 
          where: { 
            restaurantId: restaurant.id,
            printOrder: { status: 'pending' }
          } 
        }),
        prisma.printOrderDetail.count({ 
          where: { 
            restaurantId: restaurant.id,
            printOrder: { status: 'completed' }
          } 
        }),
        prisma.invoice.count({ where: { restaurantId: restaurant.id } }),
        prisma.invoice.count({ 
          where: { 
            restaurantId: restaurant.id,
            status: 'paid'
          } 
        }),
        prisma.inventory.findUnique({ where: { restaurantId: restaurant.id } }),
        prisma.design.count({ where: { restaurantId: restaurant.id } })
      ])

      stats = {
        totalOrders,
        pendingOrders,
        completedOrders,
        totalInvoices,
        paidInvoices,
        unpaidInvoices: totalInvoices - paidInvoices,
        currentStock: currentInventory?.currentStock || 0,
        minStock: currentInventory?.minStock || 0,
        totalDesigns: designs,
        monthlyQuota: restaurant.monthlyQuota
      }
    } else if (userRole === 'bank') {
      // إحصائيات البنك
      const bank = await prisma.bank.findUnique({
        where: { userId: session.user.id }
      })

      if (!bank) {
        return NextResponse.json({ error: 'البنك غير موجود' }, { status: 404 })
      }

      const [
        totalContracts,
        activeContracts,
        totalGuarantees,
        pendingGuarantees,
        approvedGuarantees,
        totalInstallments,
        paidInstallments,
        totalPrintOrders,
        pendingPrintOrders
      ] = await Promise.all([
        prisma.contract.count({ where: { bankId: bank.id } }),
        prisma.contract.count({ 
          where: { 
            bankId: bank.id,
            status: 'active'
          } 
        }),
        prisma.guarantee.count({
          where: { contract: { bankId: bank.id } }
        }),
        prisma.guarantee.count({
          where: { 
            contract: { bankId: bank.id },
            status: 'pending'
          }
        }),
        prisma.guarantee.count({
          where: { 
            contract: { bankId: bank.id },
            status: 'approved'
          }
        }),
        prisma.installment.count({
          where: { contract: { bankId: bank.id } }
        }),
        prisma.installment.count({
          where: { 
            contract: { bankId: bank.id },
            status: 'paid'
          }
        }),
        prisma.printOrder.count({ where: { bankId: bank.id } }),
        prisma.printOrder.count({ 
          where: { 
            bankId: bank.id,
            status: 'pending'
          } 
        })
      ])

      stats = {
        totalContracts,
        activeContracts,
        totalGuarantees,
        pendingGuarantees,
        approvedGuarantees,
        totalInstallments,
        paidInstallments,
        overdueInstallments: totalInstallments - paidInstallments,
        totalPrintOrders,
        pendingPrintOrders
      }
    } else if (userRole === 'supplier') {
      // إحصائيات المورد
      const supplier = await prisma.supplier.findUnique({
        where: { userId: session.user.id }
      })

      if (!supplier) {
        return NextResponse.json({ error: 'المورد غير موجود' }, { status: 404 })
      }

      const [
        totalOrders,
        pendingOrders,
        inProductionOrders,
        completedOrders,
        totalBatches,
        activeBatches,
        completedBatches
      ] = await Promise.all([
        prisma.printOrder.count({ where: { supplierId: supplier.id } }),
        prisma.printOrder.count({ 
          where: { 
            supplierId: supplier.id,
            status: 'pending'
          } 
        }),
        prisma.printOrder.count({ 
          where: { 
            supplierId: supplier.id,
            status: 'in_production'
          } 
        }),
        prisma.printOrder.count({ 
          where: { 
            supplierId: supplier.id,
            status: 'completed'
          } 
        }),
        prisma.productionBatch.count({ 
          where: {
            printOrder: { supplierId: supplier.id }
          }
        }),
        prisma.productionBatch.count({ 
          where: {
            printOrder: { supplierId: supplier.id },
            status: 'in_progress'
          }
        }),
        prisma.productionBatch.count({ 
          where: {
            printOrder: { supplierId: supplier.id },
            status: 'completed'
          }
        })
      ])

      stats = {
        totalOrders,
        pendingOrders,
        inProductionOrders,
        completedOrders,
        totalBatches,
        activeBatches,
        completedBatches,
        rating: supplier.rating,
        totalOrdersCompleted: supplier.totalOrders
      }
    } else if (userRole === 'marketer') {
      // إحصائيات المسوق
      const [
        totalRestaurants,
        activeRestaurants,
        totalCommissions,
        monthlyCommissions
      ] = await Promise.all([
        prisma.restaurant.count({ where: { marketerId: session.user.id } }),
        prisma.restaurant.count({ 
          where: { 
            marketerId: session.user.id,
            status: 'active'
          } 
        }),
        prisma.commission.aggregate({
          _sum: { amount: true },
          where: { marketerId: session.user.id }
        }),
        prisma.commission.aggregate({
          _sum: { amount: true },
          where: {
            marketerId: session.user.id,
            createdAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            }
          }
        })
      ])

      stats = {
        totalRestaurants,
        activeRestaurants,
        totalCommissions: totalCommissions._sum.amount || 0,
        monthlyCommissions: monthlyCommissions._sum.amount || 0
      }
    }

    return NextResponse.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('خطأ في جلب الإحصائيات:', error)
    return NextResponse.json(
      { error: 'حدث خطأ داخلي في الخادم' },
      { status: 500 }
    )
  }
}

// دوال مساعدة لحساب النمو
async function calculateUserGrowth() {
  const now = new Date()
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [lastMonthUsers, currentMonthUsers] = await Promise.all([
    prisma.user.count({
      where: {
        createdAt: {
          gte: lastMonth,
          lt: currentMonth
        }
      }
    }),
    prisma.user.count({
      where: {
        createdAt: {
          gte: currentMonth
        }
      }
    })
  ])

  if (lastMonthUsers === 0) return 0
  return ((currentMonthUsers - lastMonthUsers) / lastMonthUsers) * 100
}

async function calculateRevenueGrowth() {
  const now = new Date()
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [lastMonthRevenue, currentMonthRevenue] = await Promise.all([
    prisma.invoice.aggregate({
      _sum: { totalAmount: true },
      where: {
        status: 'paid',
        createdAt: {
          gte: lastMonth,
          lt: currentMonth
        }
      }
    }),
    prisma.invoice.aggregate({
      _sum: { totalAmount: true },
      where: {
        status: 'paid',
        createdAt: {
          gte: currentMonth
        }
      }
    })
  ])

  const lastAmount = lastMonthRevenue._sum.totalAmount || 0
  const currentAmount = currentMonthRevenue._sum.totalAmount || 0

  if (lastAmount === 0) return 0
  return ((Number(currentAmount) - Number(lastAmount)) / Number(lastAmount)) * 100
}

async function calculateRestaurantGrowth() {
  const now = new Date()
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [lastMonthRestaurants, currentMonthRestaurants] = await Promise.all([
    prisma.restaurant.count({
      where: {
        createdAt: {
          gte: lastMonth,
          lt: currentMonth
        }
      }
    }),
    prisma.restaurant.count({
      where: {
        createdAt: {
          gte: currentMonth
        }
      }
    })
  ])

  if (lastMonthRestaurants === 0) return 0
  return ((currentMonthRestaurants - lastMonthRestaurants) / lastMonthRestaurants) * 100
}
