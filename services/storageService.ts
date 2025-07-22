
import { kv } from "@vercel/kv";

const POSTED_URLS_KEY = 'posted_urls_set';

/**
 * Recupera a lista de URLs já postadas do Vercel KV.
 * @returns Um array de strings com as URLs.
 */
export async function getPostedUrls(): Promise<string[]> {
    try {
        // smembers retorna todos os membros de um set.
        const storedUrls = await kv.smembers(POSTED_URLS_KEY);
        return storedUrls;
    } catch (error) {
        console.error("Erro ao ler URLs do Vercel KV:", error);
        // Em caso de erro, retorna um array vazio para evitar que a automação pare.
        return [];
    }
}

/**
 * Adiciona uma nova URL ao set de URLs postadas no Vercel KV.
 * @param url A URL para adicionar.
 */
export async function addPostedUrl(url: string): Promise<void> {
    if (!url) return;
    try {
        // sadd adiciona o membro ao set. Se já existir, não faz nada.
        await kv.sadd(POSTED_URLS_KEY, url);
    } catch (error) {
        console.error("Erro ao salvar URL no Vercel KV:", error);
    }
}

/**
 * Limpa o histórico de URLs postadas do Vercel KV.
 */
export async function clearPostedUrls(): Promise<void> {
    try {
        await kv.del(POSTED_URLS_KEY);
    } catch (error) {
        console.error("Erro ao limpar histórico de posts do Vercel KV:", error);
        throw new Error("Falha ao se comunicar com o banco de dados para limpar o histórico.");
    }
}
