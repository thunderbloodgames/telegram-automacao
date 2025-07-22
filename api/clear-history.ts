
import type { NextRequest } from 'next/server';
import { clearPostedUrls } from '../services/storageService';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
    try {
        await clearPostedUrls();
        return new Response(
            JSON.stringify({ success: true, message: 'Histórico de posts limpo com sucesso.' }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error: any) {
        console.error("Erro ao limpar o histórico:", error);
        return new Response(
            JSON.stringify({ success: false, message: error.message || 'Erro desconhecido no servidor.' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
