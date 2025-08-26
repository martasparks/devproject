import { NextResponse } from 'next/server';
import prisma from '@lib/prisma';

export async function POST(request: Request) {
  try {
    const { locale, namespace, key, value } = await request.json();

    // Validate required fields
    if (!locale || !namespace || !key || !value) {
      return NextResponse.json(
        { message: 'Visi lauki ir obligāti' },
        { status: 400 }
      );
    }

    // Create translation
    const translation = await prisma.translation.create({
      data: {
        locale,
        namespace,
        key,
        value,
      },
    });

    return NextResponse.json(translation);
  } catch (error: any) {
    console.error('Error creating translation:', error);
    
    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json(
        { message: 'Tulkojums ar šo kombināciju (valoda, namespace, atslēga) jau eksistē' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: 'Kļūda izveidojot tulkojumu' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const translations = await prisma.translation.findMany({
      orderBy: [
        { locale: 'asc' },
        { namespace: 'asc' },
        { key: 'asc' }
      ]
    });

    return NextResponse.json(translations);
  } catch (error) {
    console.error('Error fetching translations:', error);
    return NextResponse.json(
      { message: 'Kļūda iegūstot tulkojumus' },
      { status: 500 }
    );
  }
}