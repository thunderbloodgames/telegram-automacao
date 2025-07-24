import Parser from 'rss-parser';

// A interface continua a mesma, pois nosso objetivo final não mudou.
interface ArticleDetails {
    title: string;
    url: string;
    imageUrl?: string;
}

/**
 * REESCRITO: Extrai detalhes do artigo de um item processado pelo rss-parser.
 * A lógica inteligente para encontrar a imagem foi preservada e adaptada.
 * @param item O objeto 'item' fornecido pela biblioteca rss-parser.
 * @returns Um objeto com detalhes do artigo.
 */
function extractArticleDetails(item: Parser.Item): ArticleDetails {
    const title = item.title || 'Título não encontrado';
    const url = item.link || '';
    let imageUrl: string | undefined;

    // 1. Procura no campo 'enclosure', que o rss-parser já processa para nós.
    if (item.enclosure?.url && item.enclosure.type?.startsWith('image/')) {
        imageUrl = item.enclosure.url;
    }

    // 2. Procura por campos de mídia, como <media:content>
    // Acessamos com colchetes caso o nome contenha ':'
    if (!imageUrl && item['media:content']?.$?.url) {
        imageUrl = item['media:content'].$.url;
    }
    
    // 3. Como último recurso, procura por uma tag <img> dentro do conteúdo HTML.
    if (!imageUrl) {
        // O campo 'content' do rss-parser geralmente tem o HTML completo.
        const contentHtml = item.content || '';
        const match = contentHtml.match(/<img[^>]+src="([^">]+)"/);
        if (match && match[1]) {
            // Remove possíveis quebras de linha e espaços extras da URL da imagem
            imageUrl = match[1].replace(/(\r\n|\n|\r)/gm, "").trim();
        }
    }

    return { title, url, imageUrl };
}


/**
 * REESCRITO: Busca um novo artigo usando a biblioteca rss-parser.
 * A lógica de verificar URLs já postadas foi mantida.
 * @param feedUrl A URL do feed RSS.
 * @param postedUrls Uma lista de URLs que já foram postadas.
 * @returns Um objeto ArticleDetails para um novo artigo, ou null se nenhum for encontrado.
 */
export async function fetchNewArticle(feedUrl: string, postedUrls:string[]): Promise<ArticleDetails | null> {
    if (!feedUrl) {
        throw new Error("A URL do Feed RSS é obrigatória.");
    }
    
    // 1. Criamos uma instância do nosso novo parser.
    const parser = new Parser({
        // Adicionamos cabeçalhos personalizados aqui, como o User-Agent.
        requestOptions: {
            headers: {
                'User-Agent': 'TelegramContentBot/1.0'
            }
        }
    });

    try {
        // 2. O parser busca e processa o feed. Isso substitui 'fetch' e 'DOMParser'.
        const feed = await parser.parseURL(feedUrl);

        if (!feed.items || feed.items.length === 0) {
            console.log("Nenhum artigo encontrado no feed RSS.");
            return null;
        }

        // --- MODO DETETIVE: INÍCIO (A PARTE NOVA É ESTA) ---
        // Vamos imprimir o primeiro artigo completo do feed para inspecionar sua estrutura.
        // Isso nos mostrará todos os "cômodos" disponíveis.
        console.log("--- ESTRUTURA DO ARTIGO (MODO DETETIVE) ---");
        console.log(JSON.stringify(feed.items[0], null, 2));
        console.log("---------------------------------------------");
        // --- MODO DETETIVE: FIM ---

        // 3. Mapeia todos os artigos usando nossa função adaptada.
        const articles: ArticleDetails[] = feed.items
            .map(extractArticleDetails)
            .filter(article => article.url); // Garante que artigos sem URL sejam descartados.

        // 4. A lógica para encontrar um artigo que ainda não foi postado continua a mesma.
        const newArticle = articles.find(article => !postedUrls.includes(article.url));
    
        if (!newArticle) {
            console.log("Nenhum artigo novo para postar.");
            return null;
        }

        console.log(`Novo artigo encontrado: ${newArticle.title}`);
        return newArticle;

    } catch (error) {
        // A biblioteca rss-parser vai gerar um erro se o feed for inválido ou inacessível.
        console.error("Erro ao processar o feed RSS:", error);
        throw new Error("Não foi possível processar o feed RSS. Verifique a URL e o formato do feed.");
    }
}
