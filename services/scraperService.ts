import Parser from 'rss-parser';

// "Dicionário" personalizado para o TypeScript
type CustomFeedItem = Parser.Item & {
  'content:encoded'?: string;
  'media:content'?: {
    '$': {
      url: string;
    }
  };
};

interface ArticleDetails {
    title: string;
    url: string;
    imageUrl?: string;
}

function extractArticleDetails(item: CustomFeedItem): ArticleDetails {
    const title = item.title || 'Título não encontrado';
    const url = item.link || '';
    let imageUrl: string | undefined;

    if (item.enclosure?.url && item.enclosure.type?.startsWith('image/')) {
        imageUrl = item.enclosure.url;
    }

    if (!imageUrl && item['media:content']?.$?.url) {
        imageUrl = item['media:content'].$.url;
    }
    
    if (!imageUrl) {
        const contentHtml = item['content:encoded'] || item.content || '';
        const match = contentHtml.match(/<img[^>]+src="([^">]+)"/);
        if (match && match[1]) {
            imageUrl = match[1].replace(/(\r\n|\n|\r)/gm, "").trim();
        }
    }

    return { title, url, imageUrl };
}

export async function fetchNewArticle(feedUrl: string, postedUrls:string[]): Promise<ArticleDetails | null> {
    if (!feedUrl) {
        throw new Error("A URL do Feed RSS é obrigatória.");
    }
    
    const parser = new Parser<any, CustomFeedItem>({
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
