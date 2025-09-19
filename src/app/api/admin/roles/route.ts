import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// مخطط التحقق من البيانات
const roleSchema = z.object({
  name: z.string().min(2).max(50),
  displayName: z.string().min(2).max(100),
  description: z.string().optional(),
  permissions: z.record(z.array(z.string())).optional()
})

const updateRoleSchema = roleSchema.partial().extend({
  id: z.number().int().positive()
})

// GET - جلب جميع الأدوار
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const includeUsers = searchParams.get('includeUsers') === 'true'

    const roles = await prisma.role.findMany({
      include: {
        users: includeUsers ? {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            status: true
          }
        } : undefined,
        _count: {
          select: {
            users: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json({
      success: true,
      data: roles
    })

  } catch (error) {
    console.error('خطأ في جلب الأدوار:', error)
    return NextResponse.json(
      { error: 'حدث خطأ داخلي في الخادم' },
      { status: 500 }
    )
  }
}

// POST - إضافة دور جديد
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = roleSchema.parse(body)

    // التحقق من عدم وجود اسم الدور
    const existingRole = await prisma.role.findUnique({
      where: { name: validatedData.name }
    })

    if (existingRole) {
      return NextResponse.json(
        { error: 'اسم الدور موجود بالفعل' },
        { status: 400 }
      )
    }

    // إنشاء الدور الجديد
    const newRole = await prisma.role.create({
      data: validatedData,
      include: {
        _count: {
          select: {
            users: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'تم إنشاء الدور بنجاح',
      data: newRole
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'بيانات غير صحيحة', details: error.errors },
        { status: 400 }
      )
    }

    console.error('خطأ في إنشاء الدور:', error)
    return NextResponse.json(
      { error: 'حدث خطأ داخلي في الخادم' },
      { status: 500 }
    )
  }
}

// PUT - تحديث دور
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = updateRoleSchema.parse(body)

    // التحقق من وجود الدور
    const existingRole = await prisma.role.findUnique({
      where: { id: validatedData.id }
    })

    if (!existingRole) {
      return NextResponse.json(
        { error: 'الدور غير موجود' },
        { status: 404 }
      )
    }

    // منع تعديل الأدوار الأساسية
    const systemRoles = ['admin', 'restaurant', 'bank', 'supplier', 'marketer', 'landspice_employee']
    if (systemRoles.includes(existingRole.name)) {
      return NextResponse.json(
        { error: 'لا يمكن تعديل الأدوار الأساسية للنظام' },
        { status: 400 }
      )
    }

    // التحقق من عدم تضارب اسم الدور
    if (validatedData.name && validatedData.name !== existingRole.name) {
      const conflictRole = await prisma.role.findUnique({
        where: { name: validatedData.name }
      })

      if (conflictRole) {
        return NextResponse.json(
          { error: 'اسم الدور موجود بالفعل' },
          { status: 400 }
        )
      }
    }

    // تحضير البيانات للتحديث
    const updateData: any = { ...validatedData }
    delete updateData.id

    // تحديث الدور
    const updatedRole = await prisma.role.update({
      where: { id: validatedData.id },
      data: updateData,
      include: {
        _count: {
          select: {
            users: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'تم تحديث الدور بنجاح',
      data: updatedRole
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'بيانات غير صحيحة', details: error.errors },
        { status: 400 }
      )
    }

    console.error('خطأ في تحديث الدور:', error)
    return NextResponse.json(
      { error: 'حدث خطأ داخلي في الخادم' },
      { status: 500 }
    )
  }
}

// DELETE - حذف دور
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const roleId = parseInt(searchParams.get('id') || '0')

    if (!roleId) {
      return NextResponse.json(
        { error: 'معرف الدور مطلوب' },
        { status: 400 }
      )
    }

    // التحقق من وجود الدور
    const role = await prisma.role.findUnique({
      where: { id: roleId },
      include: {
        users: true
      }
    })

    if (!role) {
      return NextResponse.json(
        { error: 'الدور غير موجود' },
        { status: 404 }
      )
    }

    // منع حذف الأدوار الأساسية
    const systemRoles = ['admin', 'restaurant', 'bank', 'supplier', 'marketer', 'landspice_employee']
    if (systemRoles.includes(role.name)) {
      return NextResponse.json(
        { error: 'لا يمكن حذف الأدوار الأساسية للنظام' },
        { status: 400 }
      )
    }

    // التحقق من وجود مستخدمين مرتبطين بالدور
    if (role.users.length > 0) {
      return NextResponse.json(
        { error: 'لا يمكن حذف الدور، يوجد مستخدمون مرتبطون به' },
        { status: 400 }
      )
    }

    // حذف الدور
    await prisma.role.delete({
      where: { id: roleId }
    })

    return NextResponse.json({
      success: true,
      message: 'تم حذف الدور بنجاح'
    })

  } catch (error) {
    console.error('خطأ في حذف الدور:', error)
    return NextResponse.json(
      { error: 'حدث خطأ داخلي في الخادم' },
      { status: 500 }
    )
  }
}
