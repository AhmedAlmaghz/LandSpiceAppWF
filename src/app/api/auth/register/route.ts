import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const registerSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  firstName: z.string().min(2).max(100),
  lastName: z.string().min(2).max(100),
  phone: z.string().optional(),
  password: z.string().min(8),
  accountType: z.enum(['restaurant', 'marketer']),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // التحقق من صحة البيانات
    const validatedData = registerSchema.parse(body)
    
    // التحقق من عدم وجود المستخدم مسبقاً
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: validatedData.username },
          { email: validatedData.email }
        ]
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { 
          message: existingUser.username === validatedData.username 
            ? 'اسم المستخدم موجود بالفعل' 
            : 'البريد الإلكتروني مستخدم بالفعل'
        },
        { status: 400 }
      )
    }

    // الحصول على معرف الدور
    const role = await prisma.role.findUnique({
      where: { name: validatedData.accountType }
    })

    if (!role) {
      return NextResponse.json(
        { message: 'نوع الحساب غير صحيح' },
        { status: 400 }
      )
    }

    // تشفير كلمة المرور
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12')
    const hashedPassword = await bcrypt.hash(validatedData.password, saltRounds)

    // إنشاء المستخدم
    const user = await prisma.user.create({
      data: {
        username: validatedData.username,
        email: validatedData.email,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        phone: validatedData.phone || null,
        password: hashedPassword,
        roleId: role.id,
        status: 'inactive', // يحتاج موافقة الإدارة
        isVerified: false,
      },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        status: true,
        role: {
          select: {
            name: true,
            displayName: true
          }
        }
      }
    })

    // إنشاء سجل إضافي حسب نوع الحساب
    if (validatedData.accountType === 'restaurant') {
      await prisma.restaurant.create({
        data: {
          userId: user.id,
          name: `${user.firstName} ${user.lastName}`, // اسم مؤقت
          status: 'pending'
        }
      })
    }

    return NextResponse.json(
      {
        message: 'تم إنشاء الحساب بنجاح. سيتم مراجعته من قبل الإدارة.',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          role: user.role.displayName,
          status: user.status
        }
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('خطأ في التسجيل:', error)

    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(err => err.message).join(', ')
      return NextResponse.json(
        { message: `خطأ في البيانات: ${errorMessages}` },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'حدث خطأ أثناء إنشاء الحساب. حاول مرة أخرى.' },
      { status: 500 }
    )
  }
}
