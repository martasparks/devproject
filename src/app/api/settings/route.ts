import { NextResponse } from 'next/server';
import prisma from '@lib/prisma';

export async function GET() {
  try {
    const settings = await prisma.settings.findMany({
      select: {
        key: true,
        value: true,
        imageUrl: true,
      },
    });

    // Convert to key-value object for easier use
    const settingsObj = settings.reduce((acc, setting) => {
      acc[setting.key] = {
        value: setting.value,
        imageUrl: setting.imageUrl,
      };
      return acc;
    }, {} as Record<string, { value: string; imageUrl: string | null }>);

    return NextResponse.json({ settings: settingsObj });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}