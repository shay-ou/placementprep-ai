import { NextRequest, NextResponse } from 'next/server';
import { extractText, getDocumentProxy } from 'unpdf';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('resume') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }
        if (file.type !== 'application/pdf') {
            return NextResponse.json({ error: 'Only PDF files are supported' }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = new Uint8Array(arrayBuffer);

        const pdf = await getDocumentProxy(buffer);
        const { text } = await extractText(pdf, { mergePages: true });

        const extractedText = text.trim();

        if (!extractedText || extractedText.length < 50) {
            return NextResponse.json(
                { error: 'Could not extract text. This might be a scanned/image-based PDF.' },
                { status: 422 }
            );
        }

        return NextResponse.json({ text: extractedText });
    } catch (err) {
        console.error('PDF parse error:', err);
        return NextResponse.json({ error: 'Failed to parse PDF' }, { status: 500 });
    }
}