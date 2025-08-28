import { NextRequest, NextResponse } from 'next/server';
import prisma from '@lib/prisma';
import { auth } from '@lib/auth';

interface Params {
  id: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const link = await prisma.topBar.findUnique({
      where: { id: parseInt(id) }
    });

    if (!link) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }

    return NextResponse.json(link);
  } catch (error) {
    console.error('Get admin topbar link error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const existingLink = await prisma.topBar.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingLink) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }

    const { title, url, icon, isActive, order } = await request.json();

    if (!title || !url) {
      return NextResponse.json(
        { error: 'Title and URL are required' },
        { status: 400 }
      );
    }

    const link = await prisma.topBar.update({
      where: { id: parseInt(id) },
      data: {
        title,
        url,
        icon: icon || null,
        isActive: isActive ?? true,
        order: order || 0,
      },
    });

    return NextResponse.json(link);
  } catch (error) {
    console.error('Update admin topbar link error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const link = await prisma.topBar.findUnique({
      where: { id: parseInt(id) }
    });

    if (!link) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }

    await prisma.topBar.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ message: 'Link deleted successfully' });
  } catch (error) {
    console.error('Delete admin topbar link error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}