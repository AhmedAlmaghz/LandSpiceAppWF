import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// مخطط التحقق من البيانات
const restaurantSchema = z.object({
  name: z.string().min(2).max(150),
  businessName: z.string().max(200).optional(),
  commercialRegNo: z.string().max(50).optional(),
  taxNumber: z.string().max(50).optional(),
  address: z.string().optional(),
  city: z.string().max(100).optional(),
  district: z.string().max(100).optional(),
  postalCode: z.string().max(10).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  monthlyQuota: z.number().int().positive().default(18000),
  status: z.enum(['pending', 'active', 'suspended', 'terminated']).default('pending'),
  marketerId: z.string().optional()
})

const updateRestaurantSchema = restaurantSchema.partial().extend({
  id: z.string()
})

// GET - جلب جميع المطاعم مع التصفية
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !['admin', 'landspice_employee', 'marketer'].includes(session.user.role)) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const city = searchParams.get('city') || ''
    const marketerId = searchParams.get('marketerId') || ''
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const skip = (page - 1) * limit

    // بناء شروط البحث
    const where: any = {}
    
    // إذا كان المستخدم مسوق، يرى فقط مطاعمه
    if (session.user.role === 'marketer') {
      where.marketerId = session.user.id
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { businessName: { contains: search, mode: 'insensitive' } },
        { commercialRegNo: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (status) {
      where.status = status
    }

    if (city) {
      where.city = city
    }

    if (marketerId && session.user.role === 'admin') {
      where.marketerId = marketerId
    }

    // جلب المطاعم مع العلاقات
    const [restaurants, totalCount] = await Promise.all([
      prisma.restaurant.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              firstName: true,
              lastName: true,
              phone: true,
              status: true,
              lastLoginAt: true
            }
          },
          marketer: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true
            }
          },
          contracts: {
            select: {
              id: true,
              status: true,
              startDate: true,
              endDate: true,
              monthlyAmount: true
            }
          },
          inventory: {
            select: {
              id: true,
              currentStock: true,
              minStock: true,
              lastUpdated: true
            }
          },
          _count: {
            select: {
              designs: true,
              invoices: true,
              productionBatches: true
            }
          }
        },
        orderBy: {
          [sortBy]: sortOrder
        },
        skip,
        take: limit
      }),
      prisma.restaurant.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: {
        restaurants,
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit)
        }
      }
    })

  } catch (error) {
    console.error('خطأ في جلب المطاعم:', error)
    return NextResponse.json(
      { error: 'حدث خطأ داخلي في الخادم' },
      { status: 500 }
    )
  }
}

// POST - إضافة مطعم جديد
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !['admin', 'landspice_employee'].includes(session.user.role)) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const body = await req.json()
    const { userId, ...restaurantData } = body
    
    if (!userId) {
      return NextResponse.json(
        { error: 'معرف المستخدم مطلوب' },
        { status: 400 }
      )
    }

    const validatedData = restaurantSchema.parse(restaurantData)

    // التحقق من وجود المستخدم وأنه من نوع restaurant
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'المستخدم غير موجود' },
        { status: 404 }
      )
    }

    if (user.role.name !== 'restaurant') {
      return NextResponse.json(
        { error: 'المستخدم ليس من نوع مطعم' },
        { status: 400 }
      )
    }

    // التحقق من عدم وجود مطعم مربوط بالمستخدم
    const existingRestaurant = await prisma.restaurant.findUnique({
      where: { userId }
    })

    if (existingRestaurant) {
      return NextResponse.json(
        { error: 'المستخدم مربوط بمطعم بالفعل' },
        { status: 400 }
      )
    }

    // إنشاء المطعم
    const newRestaurant = await prisma.restaurant.create({
      data: {
        userId,
        ...validatedData
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            firstName: true,
            lastName: true
          }
        },
        marketer: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true
          }
        }
      }
    })

    // إنشاء المخزون الأولي
    await prisma.inventory.create({
      data: {
        restaurantId: newRestaurant.id,
        currentStock: 0,
        minStock: 1000,
        maxStock: validatedData.monthlyQuota * 2
      }
    })

    return NextResponse.json({
      success: true,
      message: 'تم إنشاء المطعم بنجاح',
      data: newRestaurant
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'بيانات غير صحيحة', details: error.errors },
        { status: 400 }
      )
    }

    console.error('خطأ في إنشاء المطعم:', error)
    return NextResponse.json(
      { error: 'حدث خطأ داخلي في الخادم' },
      { status: 500 }
    )
  }
}

// PUT - تحديث مطعم
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !['admin', 'landspice_employee', 'restaurant'].includes(session.user.role)) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = updateRestaurantSchema.parse(body)

    // التحقق من وجود المطعم
    const existingRestaurant = await prisma.restaurant.findUnique({
      where: { id: validatedData.id },
      include: { user: true }
    })

    if (!existingRestaurant) {
      return NextResponse.json(
        { error: 'المطعم غير موجود' },
        { status: 404 }
      )
    }

    // التحقق من الصلاحيات - المطعم يحدث بياناته فقط
    if (session.user.role === 'restaurant' && existingRestaurant.userId !== session.user.id) {
      return NextResponse.json({ error: 'ليس لديك صلاحية' }, { status: 403 })
    }

    // تحضير البيانات للتحديث
    const updateData: any = { ...validatedData }
    delete updateData.id

    // المطعم لا يستطيع تغيير الحالة والمسوق
    if (session.user.role === 'restaurant') {
      delete updateData.status
      delete updateData.marketerId
      delete updateData.monthlyQuota
    }

    // تحديث المطعم
    const updatedRestaurant = await prisma.restaurant.update({
      where: { id: validatedData.id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            firstName: true,
            lastName: true
          }
        },
        marketer: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'تم تحديث المطعم بنجاح',
      data: updatedRestaurant
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'بيانات غير صحيحة', details: error.errors },
        { status: 400 }
      )
    }

    console.error('خطأ في تحديث المطعم:', error)
    return NextResponse.json(
      { error: 'حدث خطأ داخلي في الخادم' },
      { status: 500 }
    )
  }
}

// DELETE - حذف مطعم
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const restaurantId = searchParams.get('id')

    if (!restaurantId) {
      return NextResponse.json(
        { error: 'معرف المطعم مطلوب' },
        { status: 400 }
      )
    }

    // التحقق من وجود المطعم
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      include: {
        contracts: true,
        invoices: true
      }
    })

    if (!restaurant) {
      return NextResponse.json(
        { error: 'المطعم غير موجود' },
        { status: 404 }
      )
    }

    // التحقق من وجود عقود أو فواتير نشطة
    const hasActiveContracts = restaurant.contracts.some(contract => contract.status === 'active')
    const hasUnpaidInvoices = restaurant.invoices.some(invoice => invoice.status !== 'paid')

    if (hasActiveContracts || hasUnpaidInvoices) {
      return NextResponse.json(
        { error: 'لا يمكن حذف المطعم، يوجد عقود نشطة أو فواتير غير مدفوعة' },
        { status: 400 }
      )
    }

    // حذف المطعم (سيتم حذف الكيانات المرتبطة تلقائياً)
    await prisma.restaurant.delete({
      where: { id: restaurantId }
    })

    return NextResponse.json({
      success: true,
      message: 'تم حذف المطعم بنجاح'
    })

  } catch (error) {
    console.error('خطأ في حذف المطعم:', error)
    return NextResponse.json(
      { error: 'حدث خطأ داخلي في الخادم' },
      { status: 500 }
    )
  }
}
