import { NextResponse } from 'next/server';
import prisma from '@lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { locale, namespace, key, value } = await request.json();

    // Validate required fields
    if (!locale || !namespace || !key || !value) {
      return NextResponse.json(
        { message: 'Visi lauki ir obligāti' },
        { status: 400 }
      );
    }

    // Update translation
    const translation = await prisma.translation.update({
      where: { id: parseInt(id) },
      data: {
        locale,
        namespace,
        key,
        value,
      },
    });

    return NextResponse.json(translation);
  } catch (error: any) {
    console.error('Error updating translation:', error);
    
    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json(
        { message: 'Tulkojums ar šo kombināciju (valoda, namespace, atslēga) jau eksistē' },
        { status: 409 }
      );
    }

    // Handle record not found
    if (error.code === 'P2025') {
      return NextResponse.json(
        { message: 'Tulkojums nav atrasts' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Kļūda atjauninot tulkojumu' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Delete translation
    await prisma.translation.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: 'Tulkojums veiksmīgi dzēsts' });
  } catch (error: any) {
    console.error('Error deleting translation:', error);
    
    // Handle record not found
    if (error.code === 'P2025') {
      return NextResponse.json(
        { message: 'Tulkojums nav atrasts' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Kļūda dzēšot tulkojumu' },
      { status: 500 }
    );
  }
}