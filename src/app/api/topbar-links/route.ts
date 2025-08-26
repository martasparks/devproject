import { NextResponse } from 'next/server';
import prisma from '@lib/prisma';

export async function GET() {
  try {
    const links = await prisma.topBar.findMany({
      where: { isActive: true },
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ],
      select: {
        id: true,
        title: true,
        url: true,
        icon: true,
        isActive: true,
        order: true
      }
    });

    return NextResponse.json({ links });
  } catch (error) {
    console.error('Error fetching topbar links:', error);
    return NextResponse.json({ links: [] });
  }
}