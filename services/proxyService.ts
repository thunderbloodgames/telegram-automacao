// Lista de serviços de proxy, alguns podem necessitar de configuração especial como headers.
interface Proxy {
    buildUrl: (targetUrl: string) => string;
    headers?: Record<string, string>;
}

// Lista atualizada de proxies para melhorar a confiabilidade.
const PROXIES: Proxy[] = [
    {
        // cors.eu.org - um proxy simples e direto
        buildUrl: (targetUrl: string) => `https://cors.eu.org/${targetUrl}`
    },
    {
        // corsproxy.io - um proxy robusto
        buildUrl: (targetUrl: string) => `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`
    },
    {
        // api.codetabs.com - outra alternativa
        buildUrl: (targetUrl: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`
    },
    {
        // allorigins.win - comumente funciona, bom para ter como fallback
        buildUrl: (targetUrl:string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`
    }
];

/**
 * Tenta buscar uma URL usando uma série de proxies CORS, com fallback para o próximo em caso de falha.
 * @param url A URL de destino para buscar.
 * @returns Uma promessa que resolve com o objeto Response bem-sucedido.
 * @throws Um erro se todos os proxies falharem.
 */
export async function fetchWithFallbacks(url: string): Promise<Response> {
    let lastError: any = null;

    for (const proxy of PROXIES) {
        const proxyUrl = proxy.buildUrl(url);
        const proxyHost = new URL(proxyUrl).hostname;
        try {
            console.log(`Tentando proxy: ${proxyHost}...`);
            // Adiciona um timeout para evitar requisições muito longas
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 segundos de timeout

            const response = await fetch(proxyUrl, {
                signal: controller.signal,
                headers: proxy.headers
            });
            clearTimeout(timeoutId);

            if (response.ok) {
                console.log(`Sucesso com o proxy: ${proxyHost}`);
                return response; // Sucesso!
            }
            
            lastError = new Error(`Proxy ${proxyHost} retornou status: ${response.status}`);
            console.warn(lastError.message);

        } catch (error) {
            lastError = error;
            if (error instanceof Error && error.name === 'AbortError') {
                const abortMessage = `Proxy ${proxyHost} excedeu o tempo limite.`;
                console.warn(abortMessage);
                lastError = new Error(abortMessage);
            } else {
                console.warn(`Falha ao usar o proxy ${proxyHost}:`, error);
            }
        }
    }

    // Se chegou aqui, todos os proxies falharam.
    console.error("Todos os proxies CORS falharam.", lastError);
    if (lastError instanceof TypeError && lastError.message.includes('Failed to fetch')) {
        throw new Error('Falha na requisição de rede. Verifique sua conexão ou se há bloqueio por ad-blocker/firewall. Todos os serviços de proxy testados falharam.');
    }
    
    throw new Error(`Não foi possível buscar o conteúdo após tentar ${PROXIES.length} proxies. Último erro: ${lastError?.message || 'Erro desconhecido'}`);
}
