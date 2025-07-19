// app/api/parse/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

delete process.env.GOOGLE_GENAI_USE_VERTEXAI;

const genAI = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY!,
});

export async function POST(req: NextRequest) {
    try {
        const { text } = await req.json();

        if (!text) {
            return NextResponse.json({ error: 'Text input is required' }, { status: 400 });
        }

        // プロンプトをより厳密に。今日の日付もコンテキストとして与える
        const prompt = `
次のテキストを "event" または "todo" に分類し、JSONオブジェクトのみを返してください。
JSON以外の、いかなる説明文やマークダウン(\`\`\`)も絶対に含めないでください。
今日の日付は2025年7月19日です。これを基準に「明日」などを解釈してください。

入力例: 「火曜日13時に歯医者」
出力例: {"type":"event","title":"歯医者","date":"2025-07-22","time":"13:00"}

入力: ${text}
`;

        const request = {
            model: 'gemini-2.5-flash',
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
        };

        const result = await genAI.models.generateContent(request);

        // 修正点: resultから直接 .text を取得します
        const rawText = result?.text;

        if (!rawText) {
            console.error("モデルからのレスポンスにテキストが含まれていませんでした。", result);
            return NextResponse.json({ error: 'モデルから有効なテキスト応答を取得できませんでした。' }, { status: 500 });
        }

        console.log("モデルからの生レスポンス:", rawText);

        const match = rawText.match(/\{[\s\S]*\}/);

        if (!match) {
            console.error("レスポンスからJSONオブジェクトが見つかりませんでした。");
            return NextResponse.json({ error: 'レスポンスから有効なJSON形式を抽出できませんでした。' }, { status: 500 });
        }

        const jsonText = match[0];
        const parsed = JSON.parse(jsonText);

        return NextResponse.json(parsed);

    } catch (err: any) {
        console.error("解析中にエラーが発生しました:", err);
        return NextResponse.json({ error: '解析に失敗しました', message: err.message }, { status: 500 });
    }
}