import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 بدء إعداد البيانات الأولية...')

  // إنشاء الأدوار الأساسية
  console.log('👥 إنشاء الأدوار...')
  
  const roles = [
    {
      name: 'admin',
      displayName: 'مدير النظام',
      description: 'صلاحيات كاملة لإدارة النظام',
      permissions: {
        users: ['create', 'read', 'update', 'delete'],
        restaurants: ['create', 'read', 'update', 'delete'],
        contracts: ['create', 'read', 'update', 'delete'],
        invoices: ['create', 'read', 'update', 'delete'],
        reports: ['read', 'export'],
        system: ['manage', 'backup', 'restore']
      }
    },
    {
      name: 'restaurant',
      displayName: 'مطعم',
      description: 'صلاحيات المطعم لإدارة حسابه',
      permissions: {
        profile: ['read', 'update'],
        designs: ['create', 'read', 'update'],
        contracts: ['read'],
        invoices: ['read', 'pay'],
        inventory: ['read'],
        orders: ['read']
      }
    },
    {
      name: 'bank',
      displayName: 'بنك',
      description: 'صلاحيات البنك لإدارة الضمانات والتمويل',
      permissions: {
        guarantees: ['create', 'read', 'update', 'approve', 'reject'],
        contracts: ['read'],
        installments: ['create', 'read', 'update'],
        print_orders: ['create', 'read', 'update'],
        reports: ['read', 'export']
      }
    },
    {
      name: 'supplier',
      displayName: 'مورد',
      description: 'صلاحيات المورد لإدارة أوامر الطباعة',
      permissions: {
        print_orders: ['read', 'update', 'complete'],
        profile: ['read', 'update'],
        reports: ['read']
      }
    },
    {
      name: 'marketer',
      displayName: 'مسوق',
      description: 'صلاحيات المسوق لإدارة العملاء',
      permissions: {
        restaurants: ['create', 'read', 'update'],
        contracts: ['read'],
        reports: ['read']
      }
    },
    {
      name: 'landspace_staff',
      displayName: 'موظف لاند سبايس',
      description: 'صلاحيات الموظف حسب القسم',
      permissions: {
        restaurants: ['read', 'update'],
        designs: ['create', 'read', 'update', 'approve'],
        production: ['create', 'read', 'update'],
        inventory: ['read', 'update'],
        invoices: ['create', 'read', 'update'],
        reports: ['read']
      }
    }
  ]

  for (const roleData of roles) {
    await prisma.role.upsert({
      where: { name: roleData.name },
      update: {
        displayName: roleData.displayName,
        description: roleData.description,
        permissions: roleData.permissions as any
      },
      create: roleData as any
    })
  }

  // إنشاء المستخدم المدير الأساسي
  console.log('👤 إنشاء المدير الأساسي...')
  
  const adminRole = await prisma.role.findUnique({
    where: { name: 'admin' }
  })

  if (adminRole) {
    const hashedPassword = await bcrypt.hash('Admin@123456', 12)
    
    await prisma.user.upsert({
      where: { username: 'admin' },
      update: {
        password: hashedPassword,
        email: 'admin@landspace.com'
      },
      create: {
        username: 'admin',
        email: 'admin@landspace.com',
        password: hashedPassword,
        firstName: 'مدير',
        lastName: 'النظام',
        roleId: adminRole.id,
        status: 'active',
        isVerified: true
      }
    })
  }

  // إنشاء بيانات تجريبية للتطوير
  if (process.env.NODE_ENV === 'development') {
    console.log('🧪 إنشاء بيانات تجريبية...')
    
    // إنشاء بنك تجريبي
    const bankRole = await prisma.role.findUnique({
      where: { name: 'bank' }
    })

    if (bankRole) {
      const bankPassword = await bcrypt.hash('Bank@123456', 12)
      
      const bankUser = await prisma.user.upsert({
        where: { username: 'alqasemi_bank' },
        update: {},
        create: {
          username: 'alqasemi_bank',
          email: 'bank@alqasemi.com',
          password: bankPassword,
          firstName: 'بنك',
          lastName: 'القاسمي',
          roleId: bankRole.id,
          status: 'active',
          isVerified: true
        }
      })

      await prisma.bank.upsert({
        where: { userId: bankUser.id },
        update: {},
        create: {
          userId: bankUser.id,
          name: 'بنك القاسمي الإسلامي',
          branch: 'الفرع الرئيسي',
          address: 'الرياض، المملكة العربية السعودية',
          phone: '+966112345678',
          email: 'info@alqasemi.com'
        }
      })
    }

    // إنشاء مورد تجريبي
    const supplierRole = await prisma.role.findUnique({
      where: { name: 'supplier' }
    })

    if (supplierRole) {
      const supplierPassword = await bcrypt.hash('Supplier@123456', 12)
      
      const supplierUser = await prisma.user.upsert({
        where: { username: 'print_supplier' },
        update: {},
        create: {
          username: 'print_supplier',
          email: 'orders@printsupplier.com',
          password: supplierPassword,
          firstName: 'مؤسسة',
          lastName: 'الطباعة المتقدمة',
          roleId: supplierRole.id,
          status: 'active',
          isVerified: true
        }
      })

      await prisma.supplier.upsert({
        where: { userId: supplierUser.id },
        update: {},
        create: {
          userId: supplierUser.id,
          name: 'مؤسسة الطباعة المتقدمة',
          specialization: 'طباعة العبوات والتغليف',
          address: 'جدة، المملكة العربية السعودية',
          phone: '+966126789012',
          email: 'orders@printsupplier.com',
          rating: 4.8
        }
      })
    }

    // إنشاء مسوق تجريبي
    const marketerRole = await prisma.role.findUnique({
      where: { name: 'marketer' }
    })

    if (marketerRole) {
      const marketerPassword = await bcrypt.hash('Marketer@123456', 12)
      
      await prisma.user.upsert({
        where: { username: 'ahmed_marketer' },
        update: {},
        create: {
          username: 'ahmed_marketer',
          email: 'ahmed@landspace.com',
          password: marketerPassword,
          firstName: 'أحمد',
          lastName: 'المسوق',
          roleId: marketerRole.id,
          status: 'active',
          isVerified: true
        }
      })
    }

    // إنشاء مطعم تجريبي
    const restaurantRole = await prisma.role.findUnique({
      where: { name: 'restaurant' }
    })

    if (restaurantRole) {
      const restaurantPassword = await bcrypt.hash('Restaurant@123456', 12)
      
      const restaurantUser = await prisma.user.upsert({
        where: { username: 'albaik_rest' },
        update: {},
        create: {
          username: 'albaik_rest',
          email: 'manager@albaik.com',
          password: restaurantPassword,
          firstName: 'مطعم',
          lastName: 'البيك',
          roleId: restaurantRole.id,
          status: 'active',
          isVerified: true
        }
      })

      const marketer = await prisma.user.findUnique({
        where: { username: 'ahmed_marketer' }
      })

      await prisma.restaurant.upsert({
        where: { userId: restaurantUser.id },
        update: {},
        create: {
          userId: restaurantUser.id,
          name: 'مطعم البيك',
          businessName: 'شركة البيك للوجبات السريعة',
          commercialRegNo: '1234567890',
          taxNumber: '123456789012345',
          address: 'طريق الملك فهد، الرياض',
          city: 'الرياض',
          district: 'العليا',
          postalCode: '12345',
          phone: '+966501234567',
          email: 'info@albaik.com',
          website: 'https://albaik.com',
          monthlyQuota: 18000,
          marketerId: marketer?.id,
          status: 'active'
        }
      })

      // إنشاء مخزون للمطعم
      const restaurant = await prisma.restaurant.findUnique({
        where: { userId: restaurantUser.id }
      })

      if (restaurant) {
        await prisma.inventory.upsert({
          where: { restaurantId: restaurant.id },
          update: {},
          create: {
            restaurantId: restaurant.id,
            ketchupRemaining: 5000,
            chiliRemaining: 4800,
            ketchupConsumed: 4000,
            chiliConsumed: 4200,
            lastDelivery: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
            nextDelivery: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
            lowStockAlert: false
          }
        })
      }
    }
  }

  // إنشاء العمليات الأساسية للـ Workflow
  console.log('⚙️ إنشاء عمليات سير العمل...')
  
  const processes = [
    {
      name: 'تصميم عبوات المطعم',
      entity: 'design',
      description: 'عملية تصميم وموافقة شعار وعبوات المطعم'
    },
    {
      name: 'إنشاء عقد جديد',
      entity: 'contract',
      description: 'عملية إنشاء وتوقيع عقد مع مطعم جديد'
    },
    {
      name: 'طلب طباعة جماعي',
      entity: 'print_order',
      description: 'عملية تجميع وطباعة عبوات لعدة مطاعم'
    },
    {
      name: 'إصدار فاتورة شهرية',
      entity: 'invoice',
      description: 'عملية إصدار ودفع الفواتير الشهرية'
    }
  ]

  for (const processData of processes) {
    await prisma.process.upsert({
      where: { name: processData.name },
      update: processData,
      create: processData
    })
  }

  console.log('✅ تم إكمال إعداد البيانات الأولية بنجاح!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ خطأ في إعداد البيانات:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
