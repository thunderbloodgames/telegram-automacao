
interface ArticleDetails {
    title: string;
    url: string;
    imageUrl?: string;
}

/**
 * Extrai detalhes do artigo de um item de feed RSS.
 * Procura de forma inteligente pela imagem em destaque em várias tags comuns.
 * @param item O elemento XML <item>.
 * @returns Um objeto com detalhes do artigo.
 */
function extractArticleDetails(item: Element): ArticleDetails {
    const title = item.querySelector('title')?.textContent?.trim() || 'Título não encontrado';
    const url = item.querySelector('link')?.textContent?.trim() || '';

    let imageUrl: string | undefined;

    // 1. Procura em <media:content> (mais comum para imagens)
    // A barra invertida é necessária para escapar o ':' no seletor
    const mediaContent = item.querySelector('media\\:content, content');
    if (mediaContent?.getAttribute('url') && mediaContent.getAttribute('medium') === 'image') {
        imageUrl = mediaContent.getAttribute('url')!;
    }

    // 2. Procura em <enclosure> (outra tag comum para mídia)
    if (!imageUrl) {
        const enclosure = item.querySelector('enclosure');
        if (enclosure?.getAttribute('url') && enclosure.getAttribute('type')?.startsWith('image/')) {
            imageUrl = enclosure.getAttribute('url')!;
        }
    }

    // 3. Procura dentro de <description> ou <content:encoded> por uma tag <img> como último recurso
    if (!imageUrl) {
        const descriptionCData = item.querySelector('description')?.textContent;
        // Para <content:encoded>
        const encodedContentCData = item.querySelector('content\\:encoded, encoded')?.textContent; 
        const combinedContent = `${descriptionCData || ''} ${encodedContentCData || ''}`;
        
        const match = combinedContent.match(/<img[^>]+src="([^">]+)"/);
        if (match && match[1]) {
            imageUrl = match[1];
        }
    }

    return { title, url, imageUrl };
}


/**
 * Busca um novo artigo que ainda não foi publicado de um feed RSS fornecido.
 * @param feedUrl A URL do feed RSS.
 * @param postedUrls Uma lista de URLs que já foram postadas.
 * @returns Um objeto ArticleDetails para um novo artigo, ou null se nenhum for encontrado.
 */
export async function fetchNewArticle(feedUrl: string, postedUrls: string[]): Promise<ArticleDetails | null> {
    if (!feedUrl) {
        throw new Error("A URL do Feed RSS é obrigatória.");
    }
    
    const response = await fetch(feedUrl, {
        headers: {
            'User-Agent': 'TelegramContentBot/1.0' // Alguns feeds exigem um User-Agent
        }
    });
    if (!response.ok) {
        throw new Error(`Falha ao buscar o feed RSS. Status: ${response.status}`);
    }
    const feedXml = await response.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(feedXml, "text/xml");

    const errorNode = doc.querySelector("parsererror");
    if (errorNode) {
        console.error("Erro ao analisar o feed RSS:", errorNode.textContent);
        throw new Error("Não foi possível processar o feed RSS. O formato pode estar inválido.");
    }

    const items = Array.from(doc.querySelectorAll("item"));

    if (items.length === 0) {
        // Não é um erro, o feed pode estar vazio legitimamente.
        console.log("Nenhum artigo encontrado no feed RSS.");
        return null;
    }

    // Mapeia todos os artigos do feed para o nosso formato
    const articles: ArticleDetails[] = items
        .map(extractArticleDetails)
        .filter(article => article.url); // Garante que artigos sem URL sejam descartados

    // Encontra o primeiro artigo da lista (o mais recente) que ainda não foi postado
    const newArticle = articles.find(article => !postedUrls.includes(article.url));
    
    if (!newArticle) {
        return null; // Nenhum artigo novo encontrado
    }

    return newArticle;
}
