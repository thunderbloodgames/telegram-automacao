import Parser from 'rss-parser';

// A interface continua a mesma, pois nosso objetivo final não mudou.
interface ArticleDetails {
    title: string;
    url: string;
    imageUrl?: string;
}

/**
 * VERSÃO FINAL: Extrai detalhes do artigo de forma ainda mais inteligente.
 */
function extractArticleDetails(item: Parser.Item): ArticleDetails {
    const title = item.title || 'Título não encontrado';
    const url = item.link || '';
    let imageUrl: string | undefined;

    // 1. Procura no campo 'enclosure'.
    if (item.enclosure?.url && item.enclosure.type?.startsWith('image/')) {
        imageUrl = item.enclosure.url;
    }

    // 2. Procura por campos de mídia, como <media:content>.
    if (!imageUrl && item['media:content']?.$?.url) {
        imageUrl = item['media:content'].$.url;
    }
    
    // 3. Como último recurso, procura por uma tag <img> dentro do conteúdo HTML.
    if (!imageUrl) {
        // --- ESTA É A LINHA QUE CORRIGE O PROBLEMA ---
        // Agora, ele prioriza o 'content:encoded' (que tem o HTML completo) antes de usar o 'content'.
        const contentHtml = item['content:encoded'] || item.content || '';
        
        const match = contentHtml.match(/<img[^>]+src="([^">]+)"/);
        if (match && match[1]) {
            imageUrl = match[1].replace(/(\r\n|\n|\r)/gm, "").trim();
        }
    }

    return { title, url, imageUrl };
}


/**
 * VERSÃO FINAL: Código limpo e funcional.
 */
export async function fetchNewArticle(feedUrl: string, postedUrls:string[]): Promise<ArticleDetails | null> {
    if (!feedUrl) {
        throw new Error("A URL do Feed RSS é obrigatória.");
    }
    
    const parser = new Parser({
        requestOptions: {
            headers: {
                'User-Agent': 'TelegramContentBot/1.0'
            }
        }
    });

    try {
        const feed = await parser.parseURL(feedUrl);

        if (!feed.items || feed.items.length === 0) {
            console.log("Nenhum artigo encontrado no feed RSS.");
            return null;
        }

        const articles: ArticleDetails[] = feed.items
            .map(extractArticleDetails)
            .filter(article => article.url);

        const newArticle = articles.find(article => !postedUrls.includes(article.url));
    
        if (!newArticle) {
            console.log("Nenhum artigo novo para postar.");
            return null;
        }

        console.log(`Novo artigo encontrado: ${newArticle.title}`);
        return newArticle;

    } catch (error) {
        console.error("Erro ao processar o feed RSS:", error);
        throw new Error("Não foi possível processar o feed RSS. Verifique a URL e o formato do feed.");
    }
}
