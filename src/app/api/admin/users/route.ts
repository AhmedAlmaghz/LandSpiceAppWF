import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

// مخطط التحقق من البيانات
const userSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  phone: z.string().optional(),
  firstName: z.string().min(2).max(100).optional(),
  lastName: z.string().min(2).max(100).optional(),
  roleId: z.number().int().positive(),
  status: z.enum(['active', 'inactive', 'suspended']).default('active')
})

const updateUserSchema = userSchema.partial().omit({ password: true }).extend({
  id: z.string(),
  newPassword: z.string().min(6).optional()
})

// GET - جلب جميع المستخدمين مع التصفية والترتيب
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || ''
    const status = searchParams.get('status') || ''
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const skip = (page - 1) * limit

    // بناء شروط البحث
    const where: any = {}
    
    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (role) {
      where.role = { name: role }
    }

    if (status) {
      where.status = status
    }

    // جلب المستخدمين مع العلاقات
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          role: {
            select: {
              id: true,
              name: true,
              displayName: true
            }
          },
          restaurant: {
            select: {
              id: true,
              name: true,
              status: true
            }
          },
          bank: {
            select: {
              id: true,
              name: true
            }
          },
          supplier: {
            select: {
              id: true,
              name: true,
              rating: true
            }
          }
        },
        orderBy: {
          [sortBy]: sortOrder
        },
        skip,
        take: limit
      }),
      prisma.user.count({ where })
    ])

    // حذف كلمات المرور من النتائج
    const safeUsers = users.map(user => {
      const { password, ...safeUser } = user
      return safeUser
    })

    return NextResponse.json({
      success: true,
      data: {
        users: safeUsers,
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit)
        }
      }
    })

  } catch (error) {
    console.error('خطأ في جلب المستخدمين:', error)
    return NextResponse.json(
      { error: 'حدث خطأ داخلي في الخادم' },
      { status: 500 }
    )
  }
}

// POST - إضافة مستخدم جديد
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = userSchema.parse(body)

    // التحقق من عدم وجود اسم المستخدم أو البريد الإلكتروني
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: validatedData.username },
          ...(validatedData.email ? [{ email: validatedData.email }] : [])
        ]
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'اسم المستخدم أو البريد الإلكتروني موجود بالفعل' },
        { status: 400 }
      )
    }

    // التحقق من وجود الدور
    const role = await prisma.role.findUnique({
      where: { id: validatedData.roleId }
    })

    if (!role) {
      return NextResponse.json(
        { error: 'الدور المحدد غير موجود' },
        { status: 400 }
      )
    }

    // تشفير كلمة المرور
    const hashedPassword = validatedData.password 
      ? await bcrypt.hash(validatedData.password, 12)
      : await bcrypt.hash('123456', 12) // كلمة مرور افتراضية

    // إنشاء المستخدم
    const newUser = await prisma.user.create({
      data: {
        ...validatedData,
        password: hashedPassword
      },
      include: {
        role: {
          select: {
            id: true,
            name: true,
            displayName: true
          }
        }
      }
    })

    // إنشاء الكيان المرتبط حسب نوع الدور
    if (role.name === 'restaurant') {
      await prisma.restaurant.create({
        data: {
          userId: newUser.id,
          name: `${validatedData.firstName || ''} ${validatedData.lastName || ''}`.trim() || validatedData.username,
          status: 'pending'
        }
      })
    } else if (role.name === 'bank') {
      await prisma.bank.create({
        data: {
          userId: newUser.id,
          name: `${validatedData.firstName || ''} ${validatedData.lastName || ''}`.trim() || validatedData.username
        }
      })
    } else if (role.name === 'supplier') {
      await prisma.supplier.create({
        data: {
          userId: newUser.id,
          name: `${validatedData.firstName || ''} ${validatedData.lastName || ''}`.trim() || validatedData.username
        }
      })
    }

    // إزالة كلمة المرور من النتيجة
    const { password, ...safeUser } = newUser

    return NextResponse.json({
      success: true,
      message: 'تم إنشاء المستخدم بنجاح',
      data: safeUser
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'بيانات غير صحيحة', details: error.errors },
        { status: 400 }
      )
    }

    console.error('خطأ في إنشاء المستخدم:', error)
    return NextResponse.json(
      { error: 'حدث خطأ داخلي في الخادم' },
      { status: 500 }
    )
  }
}

// PUT - تحديث مستخدم
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = updateUserSchema.parse(body)

    // التحقق من وجود المستخدم
    const existingUser = await prisma.user.findUnique({
      where: { id: validatedData.id }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'المستخدم غير موجود' },
        { status: 404 }
      )
    }

    // التحقق من عدم تضارب اسم المستخدم أو البريد الإلكتروني
    if (validatedData.username || validatedData.email) {
      const conflictUser = await prisma.user.findFirst({
        where: {
          AND: [
            { id: { not: validatedData.id } },
            {
              OR: [
                ...(validatedData.username ? [{ username: validatedData.username }] : []),
                ...(validatedData.email ? [{ email: validatedData.email }] : [])
              ]
            }
          ]
        }
      })

      if (conflictUser) {
        return NextResponse.json(
          { error: 'اسم المستخدم أو البريد الإلكتروني موجود بالفعل' },
          { status: 400 }
        )
      }
    }

    // تحضير البيانات للتحديث
    const updateData: any = { ...validatedData }
    delete updateData.id
    delete updateData.newPassword

    // تشفير كلمة المرور الجديدة إذا تم توفيرها
    if (validatedData.newPassword) {
      updateData.password = await bcrypt.hash(validatedData.newPassword, 12)
    }

    // تحديث المستخدم
    const updatedUser = await prisma.user.update({
      where: { id: validatedData.id },
      data: updateData,
      include: {
        role: {
          select: {
            id: true,
            name: true,
            displayName: true
          }
        }
      }
    })

    // إزالة كلمة المرور من النتيجة
    const { password, ...safeUser } = updatedUser

    return NextResponse.json({
      success: true,
      message: 'تم تحديث المستخدم بنجاح',
      data: safeUser
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'بيانات غير صحيحة', details: error.errors },
        { status: 400 }
      )
    }

    console.error('خطأ في تحديث المستخدم:', error)
    return NextResponse.json(
      { error: 'حدث خطأ داخلي في الخادم' },
      { status: 500 }
    )
  }
}

// DELETE - حذف مستخدم
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('id')

    if (!userId) {
      return NextResponse.json(
        { error: 'معرف المستخدم مطلوب' },
        { status: 400 }
      )
    }

    // التحقق من وجود المستخدم
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

    // منع حذف المدير الحالي لنفسه
    if (user.id === session.user.id) {
      return NextResponse.json(
        { error: 'لا يمكنك حذف حسابك الشخصي' },
        { status: 400 }
      )
    }

    // حذف المستخدم (سيتم حذف الكيانات المرتبطة تلقائياً بسبب onDelete: Cascade)
    await prisma.user.delete({
      where: { id: userId }
    })

    return NextResponse.json({
      success: true,
      message: 'تم حذف المستخدم بنجاح'
    })

  } catch (error) {
    console.error('خطأ في حذف المستخدم:', error)
    return NextResponse.json(
      { error: 'حدث خطأ داخلي في الخادم' },
      { status: 500 }
    )
  }
}
