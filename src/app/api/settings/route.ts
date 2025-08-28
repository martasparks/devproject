import { NextRequest, NextResponse } from 'next/server';
import prisma from '@lib/prisma';
import { auth } from '@lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const url = new URL(request.url);
    const isAdmin = url.searchParams.get('admin') === 'true';
    
    // Admin access check for admin requests
    if (isAdmin && (!session?.user || session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (isAdmin) {
      // Admin format: return full array with all fields
      const settings = await prisma.settings.findMany({
        orderBy: { key: 'asc' }
      });
      return NextResponse.json(settings);
    } else {
      // Public format: return key-value object for easier use
      const settings = await prisma.settings.findMany({
        select: {
          key: true,
          value: true,
          imageUrl: true,
        },
      });

      const settingsObj = settings.reduce((acc, setting) => {
        acc[setting.key] = {
          value: setting.value,
          imageUrl: setting.imageUrl,
        };
        return acc;
      }, {} as Record<string, { value: string; imageUrl: string | null }>);

      return NextResponse.json({ settings: settingsObj });
    }
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { key, value, imageUrl, imageKey } = await request.json();

    if (!key) {
      return NextResponse.json(
        { error: 'Key is required' },
        { status: 400 }
      );
    }

    const setting = await prisma.settings.upsert({
      where: { key },
      update: { 
        value: value || '',
        imageUrl: imageUrl || null,
        imageKey: imageKey || null,
      },
      create: { 
        key, 
        value: value || '',
        imageUrl: imageUrl || null,
        imageKey: imageKey || null,
      },
    });

    return NextResponse.json(setting);
  } catch (error) {
    console.error('Upsert setting error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}