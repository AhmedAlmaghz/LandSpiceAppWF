import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// مخطط التحقق من البيانات
const contractSchema = z.object({
  restaurantId: z.string(),
  bankId: z.string(),
  contractNumber: z.string().max(50).optional(),
  startDate: z.string().transform((str) => new Date(str)),
  endDate: z.string().transform((str) => new Date(str)),
  monthlyAmount: z.number().positive(),
  status: z.enum(['draft', 'active', 'expired', 'terminated']).default('draft')
})

const updateContractSchema = contractSchema.partial().extend({
  id: z.string()
})

// GET - جلب جميع العقود مع التصفية
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const restaurantId = searchParams.get('restaurantId') || ''
    const bankId = searchParams.get('bankId') || ''
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const skip = (page - 1) * limit

    // بناء شروط البحث حسب الدور
    const where: any = {}

    // تحديد العقود المسموح بعرضها حسب الدور
    if (session.user.role === 'restaurant') {
      const restaurant = await prisma.restaurant.findUnique({
        where: { userId: session.user.id }
      })
      if (!restaurant) {
        return NextResponse.json({ error: 'المطعم غير موجود' }, { status: 404 })
      }
      where.restaurantId = restaurant.id
    } else if (session.user.role === 'bank') {
      const bank = await prisma.bank.findUnique({
        where: { userId: session.user.id }
      })
      if (!bank) {
        return NextResponse.json({ error: 'البنك غير موجود' }, { status: 404 })
      }
      where.bankId = bank.id
    } else if (!['admin', 'landspice_employee'].includes(session.user.role)) {
      return NextResponse.json({ error: 'ليس لديك صلاحية' }, { status: 403 })
    }

    if (search) {
      where.OR = [
        { contractNumber: { contains: search, mode: 'insensitive' } },
        { restaurant: { name: { contains: search, mode: 'insensitive' } } },
        { bank: { name: { contains: search, mode: 'insensitive' } } }
      ]
    }

    if (status) {
      where.status = status
    }

    if (restaurantId && ['admin', 'landspice_employee'].includes(session.user.role)) {
      where.restaurantId = restaurantId
    }

    if (bankId && ['admin', 'landspice_employee'].includes(session.user.role)) {
      where.bankId = bankId
    }

    // جلب العقود مع العلاقات
    const [contracts, totalCount] = await Promise.all([
      prisma.contract.findMany({
        where,
        include: {
          restaurant: {
            select: {
              id: true,
              name: true,
              businessName: true,
              status: true,
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                  phone: true
                }
              }
            }
          },
          bank: {
            select: {
              id: true,
              name: true,
              branch: true,
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                  phone: true
                }
              }
            }
          },
          guarantees: {
            select: {
              id: true,
              amount: true,
              status: true,
              type: true
            }
          },
          installments: {
            select: {
              id: true,
              amount: true,
              dueDate: true,
              status: true
            },
            orderBy: {
              dueDate: 'asc'
            }
          },
          _count: {
            select: {
              guarantees: true,
              installments: true
            }
          }
        },
        orderBy: {
          [sortBy]: sortOrder
        },
        skip,
        take: limit
      }),
      prisma.contract.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: {
        contracts,
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit)
        }
      }
    })

  } catch (error) {
    console.error('خطأ في جلب العقود:', error)
    return NextResponse.json(
      { error: 'حدث خطأ داخلي في الخادم' },
      { status: 500 }
    )
  }
}

// POST - إضافة عقد جديد
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !['admin', 'landspice_employee', 'bank'].includes(session.user.role)) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = contractSchema.parse(body)

    // التحقق من وجود المطعم والبنك
    const [restaurant, bank] = await Promise.all([
      prisma.restaurant.findUnique({
        where: { id: validatedData.restaurantId }
      }),
      prisma.bank.findUnique({
        where: { id: validatedData.bankId }
      })
    ])

    if (!restaurant) {
      return NextResponse.json(
        { error: 'المطعم غير موجود' },
        { status: 404 }
      )
    }

    if (!bank) {
      return NextResponse.json(
        { error: 'البنك غير موجود' },
        { status: 404 }
      )
    }

    // التحقق من صلاحية البنك إذا كان المستخدم بنك
    if (session.user.role === 'bank') {
      const userBank = await prisma.bank.findUnique({
        where: { userId: session.user.id }
      })
      if (!userBank || userBank.id !== validatedData.bankId) {
        return NextResponse.json({ error: 'ليس لديك صلاحية' }, { status: 403 })
      }
    }

    // التحقق من التواريخ
    if (validatedData.endDate <= validatedData.startDate) {
      return NextResponse.json(
        { error: 'تاريخ الانتهاء يجب أن يكون بعد تاريخ البداية' },
        { status: 400 }
      )
    }

    // التحقق من عدم وجود عقد نشط للمطعم مع نفس البنك
    const existingContract = await prisma.contract.findFirst({
      where: {
        restaurantId: validatedData.restaurantId,
        bankId: validatedData.bankId,
        status: 'active'
      }
    })

    if (existingContract) {
      return NextResponse.json(
        { error: 'يوجد عقد نشط بالفعل بين المطعم والبنك' },
        { status: 400 }
      )
    }

    // إنشاء رقم العقد التلقائي إذا لم يتم توفيره
    if (!validatedData.contractNumber) {
      const count = await prisma.contract.count()
      validatedData.contractNumber = `CON-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`
    }

    // إنشاء العقد
    const newContract = await prisma.contract.create({
      data: validatedData,
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            businessName: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        },
        bank: {
          select: {
            id: true,
            name: true,
            branch: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'تم إنشاء العقد بنجاح',
      data: newContract
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'بيانات غير صحيحة', details: error.errors },
        { status: 400 }
      )
    }

    console.error('خطأ في إنشاء العقد:', error)
    return NextResponse.json(
      { error: 'حدث خطأ داخلي في الخادم' },
      { status: 500 }
    )
  }
}

// PUT - تحديث عقد
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !['admin', 'landspice_employee', 'bank'].includes(session.user.role)) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = updateContractSchema.parse(body)

    // التحقق من وجود العقد
    const existingContract = await prisma.contract.findUnique({
      where: { id: validatedData.id },
      include: {
        bank: true
      }
    })

    if (!existingContract) {
      return NextResponse.json(
        { error: 'العقد غير موجود' },
        { status: 404 }
      )
    }

    // التحقق من صلاحية البنك
    if (session.user.role === 'bank') {
      const userBank = await prisma.bank.findUnique({
        where: { userId: session.user.id }
      })
      if (!userBank || userBank.id !== existingContract.bankId) {
        return NextResponse.json({ error: 'ليس لديك صلاحية' }, { status: 403 })
      }
    }

    // تحضير البيانات للتحديث
    const updateData: any = { ...validatedData }
    delete updateData.id

    // التحقق من التواريخ إذا تم تحديثها
    if (updateData.endDate && updateData.startDate) {
      if (new Date(updateData.endDate) <= new Date(updateData.startDate)) {
        return NextResponse.json(
          { error: 'تاريخ الانتهاء يجب أن يكون بعد تاريخ البداية' },
          { status: 400 }
        )
      }
    }

    // تحديث العقد
    const updatedContract = await prisma.contract.update({
      where: { id: validatedData.id },
      data: updateData,
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            businessName: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        },
        bank: {
          select: {
            id: true,
            name: true,
            branch: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'تم تحديث العقد بنجاح',
      data: updatedContract
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'بيانات غير صحيحة', details: error.errors },
        { status: 400 }
      )
    }

    console.error('خطأ في تحديث العقد:', error)
    return NextResponse.json(
      { error: 'حدث خطأ داخلي في الخادم' },
      { status: 500 }
    )
  }
}

// DELETE - حذف عقد
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const contractId = searchParams.get('id')

    if (!contractId) {
      return NextResponse.json(
        { error: 'معرف العقد مطلوب' },
        { status: 400 }
      )
    }

    // التحقق من وجود العقد
    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        guarantees: true,
        installments: true
      }
    })

    if (!contract) {
      return NextResponse.json(
        { error: 'العقد غير موجود' },
        { status: 404 }
      )
    }

    // التحقق من وجود ضمانات أو أقساط نشطة
    const hasActiveGuarantees = contract.guarantees.some(g => ['pending', 'approved'].includes(g.status))
    const hasUnpaidInstallments = contract.installments.some(i => i.status !== 'paid')

    if (hasActiveGuarantees || hasUnpaidInstallments) {
      return NextResponse.json(
        { error: 'لا يمكن حذف العقد، يوجد ضمانات نشطة أو أقساط غير مدفوعة' },
        { status: 400 }
      )
    }

    // حذف العقد
    await prisma.contract.delete({
      where: { id: contractId }
    })

    return NextResponse.json({
      success: true,
      message: 'تم حذف العقد بنجاح'
    })

  } catch (error) {
    console.error('خطأ في حذف العقد:', error)
    return NextResponse.json(
      { error: 'حدث خطأ داخلي في الخادم' },
      { status: 500 }
    )
  }
}
