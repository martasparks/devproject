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
      // Admin format: return all links with all fields
      const links = await prisma.topBar.findMany({
        orderBy: [
          { order: 'asc' },
          { createdAt: 'desc' }
        ]
      });
      return NextResponse.json(links);
    } else {
      // Public format: return only active links with limited fields
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
    }
  } catch (error) {
    console.error('Error fetching topbar links:', error);
    return NextResponse.json(
      isAdmin ? { error: 'Internal server error' } : { links: [] },
      isAdmin ? { status: 500 } : { status: 200 }
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