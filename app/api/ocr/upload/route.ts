import { NextRequest, NextResponse } from 'next/server';
import vision from '@google-cloud/vision';
import { writeFile, readFile } from 'fs/promises';
import path from 'path';
import os from 'os';

export async function POST(req: NextRequest) {
    try {
        // Load credentials from file
        const credentialsPath = path.join(process.cwd(), '.gcp', 'vision-key.json');
        const credentialsData = await readFile(credentialsPath, 'utf-8');
        const credentials = JSON.parse(credentialsData);
        const client = new vision.ImageAnnotatorClient({ credentials });

        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'ファイルがありません' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const tempPath = path.join(os.tmpdir(), file.name);
        await writeFile(tempPath, buffer);

        const [result] = await client.textDetection(tempPath);
        const detections = result.textAnnotations || [];
        const fullText = detections[0]?.description || '';

        return NextResponse.json({ text: fullText });
    } catch (err) {
        console.error('Vision API error:', err);
        return NextResponse.json({ error: 'OCR失敗', detail: String(err) }, { status: 500 });
    }
}
