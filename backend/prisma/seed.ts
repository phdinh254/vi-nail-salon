import { PrismaClient, UserRole, AppointmentStatus, CreatedVia, PaymentMethod } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await argon2.hash('change-me-123');

  const admin = await prisma.user.upsert({
    where: { phone: '0900112233' },
    update: {},
    create: {
      phone: '0900112233',
      name: 'Hồng Vân',
      passwordHash,
      role: UserRole.ADMIN,
    },
  });

  const staffUserLan = await prisma.user.upsert({
    where: { phone: '0911111111' },
    update: {},
    create: {
      phone: '0911111111',
      name: 'Nguyễn Thị Lan',
      passwordHash,
      role: UserRole.STAFF,
    },
  });

  const staffUserBich = await prisma.user.upsert({
    where: { phone: '0955001122' },
    update: {},
    create: {
      phone: '0955001122',
      name: 'Lê Ngọc Bích',
      passwordHash,
      role: UserRole.STAFF,
    },
  });

  const customer = await prisma.user.upsert({
    where: { phone: '0909111222' },
    update: {},
    create: {
      phone: '0909111222',
      name: 'Thảo My',
      passwordHash,
      role: UserRole.CUSTOMER,
    },
  });

  const serviceData = [
    {
      slug: 'manicure-co-ban',
      name: 'Manicure Cơ Bản',
      category: 'MANICURE' as const,
      shortDescription: 'Cắt tỉa, dũa dáng và làm sạch da quy đầu móng tay.',
      description: 'Ngâm tay, cắt tỉa khóe, dũa dáng móng theo yêu cầu, đẩy da và thoa dưỡng ẩm.',
      priceFrom: 120000,
      priceTo: null,
      isFixedPrice: true,
      durationMinutes: 45,
      isFeatured: false,
    },
    {
      slug: 'manicure-spa-duong-am',
      name: 'Manicure Spa Dưỡng Ẩm',
      category: 'MANICURE' as const,
      shortDescription: 'Manicure cơ bản kết hợp tẩy da chết và đắp mặt nạ tay.',
      description: 'Ngâm tay thảo dược, tẩy tế bào chết, đắp mặt nạ dưỡng, massage tay thư giãn.',
      priceFrom: 180000,
      priceTo: null,
      isFixedPrice: true,
      durationMinutes: 60,
      isFeatured: true,
    },
    {
      slug: 'pedicure-spa-thu-gian',
      name: 'Pedicure Spa Thư Giãn',
      category: 'PEDICURE' as const,
      shortDescription: 'Ngâm chân thảo dược, tẩy da chết và massage chân.',
      description: 'Ngâm chân thảo dược ấm, tẩy tế bào chết toàn chân, đắp mặt nạ và massage 15 phút.',
      priceFrom: 220000,
      priceTo: null,
      isFixedPrice: true,
      durationMinutes: 70,
      isFeatured: false,
    },
    {
      slug: 'son-gel-tay',
      name: 'Sơn Gel Tay',
      category: 'GEL_POLISH' as const,
      shortDescription: 'Sơn gel bền màu, bóng đẹp đến 3 tuần.',
      description: 'Sơn gel màu theo lựa chọn, hong khô bằng đèn UV/LED, giữ màu bền đẹp 2-3 tuần.',
      priceFrom: 200000,
      priceTo: 250000,
      isFixedPrice: false,
      durationMinutes: 45,
      isFeatured: false,
    },
    {
      slug: 'bot-acrylic-nguyen-bo',
      name: 'Bột Acrylic Nguyên Bộ',
      category: 'ACRYLIC' as const,
      shortDescription: 'Đắp bột tạo dáng móng chắc khỏe, dài theo ý muốn.',
      description: 'Đắp bột acrylic toàn bộ 10 ngón, tạo dáng theo yêu cầu, sơn màu hoặc để trắng sứ.',
      priceFrom: 350000,
      priceTo: 450000,
      isFixedPrice: false,
      durationMinutes: 90,
      isFeatured: true,
    },
    {
      slug: 'noi-gel-toan-bo',
      name: 'Nối Gel Toàn Bộ',
      category: 'GEL_EXTENSION' as const,
      shortDescription: 'Nối dài móng bằng gel, tự nhiên và nhẹ hơn bột.',
      description: 'Nối dài 10 ngón bằng gel, tạo dáng thon tự nhiên, hoàn thiện với sơn gel màu.',
      priceFrom: 400000,
      priceTo: 550000,
      isFixedPrice: false,
      durationMinutes: 100,
      isFeatured: true,
    },
    {
      slug: 'dinh-da-ve-3d',
      name: 'Đính Đá & Vẽ 3D',
      category: 'NAIL_ART' as const,
      shortDescription: 'Họa tiết nổi, đính đá cao cấp cho dịp đặc biệt.',
      description: 'Đính đá, vẽ họa tiết 3D nổi theo mẫu tham khảo hoặc theo yêu cầu riêng.',
      priceFrom: 50000,
      priceTo: 150000,
      isFixedPrice: false,
      durationMinutes: 30,
      isFeatured: true,
    },
    {
      slug: 'thao-gel-bot',
      name: 'Tháo Gel / Bột',
      category: 'REMOVAL' as const,
      shortDescription: 'Tháo lớp gel hoặc bột cũ an toàn cho móng thật.',
      description: 'Tháo lớp gel hoặc bột cũ, dũa làm sạch bề mặt và dưỡng phục hồi móng.',
      priceFrom: 80000,
      priceTo: null,
      isFixedPrice: true,
      durationMinutes: 20,
      isFeatured: false,
    },
  ];

  const services = [];
  for (const data of serviceData) {
    const service = await prisma.service.upsert({
      where: { slug: data.slug },
      update: {},
      create: data,
    });
    services.push(service);
  }

  const staffLan = await prisma.staffProfile.upsert({
    where: { userId: staffUserLan.id },
    update: {},
    create: {
      userId: staffUserLan.id,
      role: 'Kỹ thuật viên trưởng',
      bio: '8 năm kinh nghiệm, chuyên sâu về nối gel và tạo dáng móng tự nhiên.',
      yearsExperience: 8,
      specialties: ['Nối Gel', 'Tạo dáng móng'],
      isActive: true,
      services: {
        create: [
          { serviceId: services.find((s) => s.slug === 'noi-gel-toan-bo')!.id },
          { serviceId: services.find((s) => s.slug === 'bot-acrylic-nguyen-bo')!.id },
        ],
      },
      shifts: {
        create: [
          { day: 'Thứ Hai - Thứ Sáu', time: '09:00 - 18:00' },
          { day: 'Thứ Bảy', time: '09:00 - 20:00' },
        ],
      },
    },
  });

  const staffBich = await prisma.staffProfile.upsert({
    where: { userId: staffUserBich.id },
    update: {},
    create: {
      userId: staffUserBich.id,
      role: 'Kỹ thuật viên',
      bio: '3 năm kinh nghiệm về manicure, pedicure và sơn gel.',
      yearsExperience: 3,
      specialties: ['Manicure', 'Sơn Gel'],
      isActive: true,
      services: {
        create: [
          { serviceId: services.find((s) => s.slug === 'manicure-co-ban')!.id },
          { serviceId: services.find((s) => s.slug === 'manicure-spa-duong-am')!.id },
          { serviceId: services.find((s) => s.slug === 'son-gel-tay')!.id },
        ],
      },
      shifts: {
        create: [{ day: 'Thứ Hai - Thứ Sáu', time: '11:00 - 20:00' }],
      },
    },
  });

  const nailDesign = await prisma.nailDesign.upsert({
    where: { id: 'seed-nd-nude-toi-gian' },
    update: {},
    create: {
      id: 'seed-nd-nude-toi-gian',
      name: 'Nude Tối Giản',
      style: 'MINIMALIST',
      colors: ['NUDE'],
      serviceId: services.find((s) => s.slug === 'son-gel-tay')!.id,
      description: 'Tông nude nhẹ nhàng, phù hợp môi trường công sở.',
      isNew: false,
    },
  });

  await prisma.promotion.upsert({
    where: { id: 'seed-promo-khach-moi' },
    update: {},
    create: {
      id: 'seed-promo-khach-moi',
      title: 'Ưu đãi khách hàng mới',
      description: 'Giảm 15% cho lượt đặt lịch đầu tiên khi trải nghiệm dịch vụ tại Vi Nail.',
      discountLabel: '-15%',
      validFrom: new Date('2026-07-01'),
      validTo: new Date('2026-08-31'),
      conditions: [
        'Áp dụng cho khách đặt lịch lần đầu tiên',
        'Không áp dụng cùng lúc với ưu đãi khác',
      ],
      isActive: true,
    },
  });

  const gelPolish = services.find((s) => s.slug === 'son-gel-tay')!;
  const existingAppointment = await prisma.appointment.findUnique({ where: { code: 'VN-1001' } });
  if (!existingAppointment) {
    const startAt = new Date('2026-07-15T10:00:00+07:00');
    const endAt = new Date(startAt.getTime() + gelPolish.durationMinutes * 60 * 1000);
    const appointment = await prisma.appointment.create({
      data: {
        code: 'VN-1001',
        status: AppointmentStatus.CONFIRMED,
        startAt,
        endAt,
        staffId: staffBich.id,
        customerId: customer.id,
        customerName: customer.name,
        customerPhone: customer.phone,
        nailDesignId: nailDesign.id,
        totalPrice: gelPolish.priceFrom,
        totalDurationMinutes: gelPolish.durationMinutes,
        createdVia: CreatedVia.CUSTOMER,
        services: {
          create: [
            {
              serviceId: gelPolish.id,
              serviceName: gelPolish.name,
              durationMinutes: gelPolish.durationMinutes,
              price: gelPolish.priceFrom,
            },
          ],
        },
        timeline: {
          create: [
            { status: AppointmentStatus.PENDING_CONFIRMATION, at: new Date('2026-07-13T09:00:00+07:00') },
            { status: AppointmentStatus.CONFIRMED, at: new Date('2026-07-13T09:10:00+07:00') },
          ],
        },
      },
    });

    await prisma.notification.create({
      data: {
        userId: customer.id,
        title: 'Lịch hẹn đã được xác nhận',
        description: `Lịch hẹn ${appointment.code} lúc 10:00 ngày 15/07/2026 đã được xác nhận.`,
        type: 'APPOINTMENT',
      },
    });
  }

  const completedAppointment = await prisma.appointment.findUnique({ where: { code: 'VN-1007' } });
  if (!completedAppointment) {
    const startAt = new Date('2026-07-05T10:00:00+07:00');
    const endAt = new Date(startAt.getTime() + gelPolish.durationMinutes * 60 * 1000);
    const appointment = await prisma.appointment.create({
      data: {
        code: 'VN-1007',
        status: AppointmentStatus.COMPLETED,
        startAt,
        endAt,
        staffId: staffBich.id,
        customerId: customer.id,
        customerName: customer.name,
        customerPhone: customer.phone,
        totalPrice: gelPolish.priceFrom,
        totalDurationMinutes: gelPolish.durationMinutes,
        createdVia: CreatedVia.CUSTOMER,
        services: {
          create: [
            {
              serviceId: gelPolish.id,
              serviceName: gelPolish.name,
              durationMinutes: gelPolish.durationMinutes,
              price: gelPolish.priceFrom,
            },
          ],
        },
        timeline: {
          create: [
            { status: AppointmentStatus.CONFIRMED, at: new Date('2026-07-03T10:00:00+07:00') },
            { status: AppointmentStatus.CHECKED_IN, at: new Date('2026-07-05T09:55:00+07:00') },
            { status: AppointmentStatus.IN_SERVICE, at: new Date('2026-07-05T10:00:00+07:00') },
            { status: AppointmentStatus.COMPLETED, at: new Date('2026-07-05T10:45:00+07:00') },
          ],
        },
      },
    });

    await prisma.payment.create({
      data: {
        appointmentId: appointment.id,
        amount: gelPolish.priceFrom,
        method: PaymentMethod.E_WALLET,
      },
    });

    await prisma.review.create({
      data: {
        appointmentId: appointment.id,
        customerId: customer.id,
        customerName: customer.name,
        rating: 5,
        content: 'Đặt lịch online rất nhanh, đến nơi không phải chờ lâu. Màu gel lên rất chuẩn.',
        serviceName: gelPolish.name,
        isVerified: true,
      },
    });
  }

  console.log('Seed hoàn tất.');
  console.log(`Admin: ${admin.phone} / mật khẩu: change-me-123`);
  console.log(`Staff: ${staffUserLan.phone}, ${staffUserBich.phone} / mật khẩu: change-me-123`);
  console.log(`Customer: ${customer.phone} / mật khẩu: change-me-123`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
