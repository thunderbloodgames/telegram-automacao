import { generatePostContent } from '../services/geminiService.js';
import { shortenUrl } from '../services/shortenerService.js';
import { postMessage, postPhoto } from '../services/telegramService.js';
import { fetchNewArticle } from '../services/scraperService.js';
import { getPostedUrls, addPostedUrl } from '../services/storageService.js';
import type { NextRequest } from 'next/server'; // Importação adicionada para o 'request'

// Configura a função para rodar no Vercel Edge Runtime, que é mais rápido e tem APIs web padrão.
export const runtime = 'edge';

export async function GET(request: NextRequest) {
    // --- ALTERAÇÃO TEMPORÁRIA: INÍCIO ---
    // O "guarda de segurança" foi temporariamente desativado para podermos fazer o teste do "Modo Detetive".
    // Depois do teste, vamos reativar este código.
    //
    // const authHeader = request.headers.get('authorization');
    // if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //     return new Response('Unauthorized', { status: 401 });
    // }
    // --- ALTERAÇÃO TEMPORÁRIA: FIM ---
    
    console.log("Iniciando novo ciclo de automação...");

    const { RSS_FEED_URL, API_KEY, TELEGRAM_TOKEN, TELEGRAM_CHANNEL_ID, SHORTENER_API_KEY } = process.env;

    if (!RSS_FEED_URL || !API_KEY || !TELEGRAM_TOKEN || !TELEGRAM_CHANNEL_ID || !SHORTENER_API_KEY) {
        const errorMessage = "ERRO: Automação parada. Todas as variáveis de ambiente são obrigatórias no projeto Vercel.";
        console.error(errorMessage);
        return new Response(JSON.stringify({ success: false, message: errorMessage }), { status: 500 });
    }

    try {
        // 1. Fetch Article
        console.log("Buscando novo artigo do feed RSS...");
        const postedUrls = await getPostedUrls();
        const newArticle = await fetchNewArticle(RSS_FEED_URL, postedUrls);

        if (!newArticle) {
            const message = "Nenhum artigo novo encontrado. Aguardando próximo ciclo.";
            console.log(message);
            return new Response(JSON.stringify({ success: true, message }), { status: 200 });
        }
        console.log(`Artigo encontrado: "${newArticle.title}"`);

        // 2. Generate Content
        console.log("Gerando conteúdo do post com IA...");
        const content = await generatePostContent(newArticle.title);
        
        // 3. Shorten URL
        console.log("Encurtando URL do artigo...");
        const shortUrl = await shortenUrl(newArticle.url);
        const finalPost = content.replace(/\[LINK\]/g, `<a href="${shortUrl}">CLIQUE AQUI</a>`);

        // 4. Post to Telegram
        console.log("Publicando no Telegram...");
        if (newArticle.imageUrl) {
            await postPhoto(newArticle.imageUrl, finalPost);
            console.log("✅ Sucesso! Post com imagem publicado no Telegram.");
        } else {
            await postMessage(finalPost);
            console.log("✅ Sucesso! Post de texto publicado no Telegram.");
        }
        
        await addPostedUrl(newArticle.url);
        
        return new Response(JSON.stringify({ success: true, message: `Postado com sucesso: ${newArticle.title}` }), { status: 200 });

    } catch (e: any) {
        const errorMessage = `❌ ERRO no ciclo de automação: ${e.message}`;
        console.error(errorMessage, e);
        return new Response(JSON.stringify({ success: false, message: errorMessage }), { status: 500 });
    }
}
