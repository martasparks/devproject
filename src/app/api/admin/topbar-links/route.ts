import { NextRequest, NextResponse } from 'next/server';
import prisma from '@lib/prisma';
import { auth } from '@lib/auth';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const links = await prisma.topBar.findMany({
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json(links);
  } catch (error) {
    console.error('Get admin topbar links error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
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

    const { title, url, icon, isActive, order } = await request.json();

    if (!title || !url) {
      return NextResponse.json(
        { error: 'Title and URL are required' },
        { status: 400 }
      );
    }

    const link = await prisma.topBar.create({
      data: {
        title,
        url,
        icon: icon || null,
        isActive: isActive ?? true,
        order: order || 0,
      },
    });

    return NextResponse.json(link, { status: 201 });
  } catch (error) {
    console.error('Create admin topbar link error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}