import { NextResponse } from 'next/server';
import prisma from '@lib/prisma';

export async function GET() {
  try {
    const sliders = await prisma.slider.findMany({
      where: {
        isActive: true
      },
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json(sliders);
  } catch (error) {
    console.error('Error fetching active sliders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}