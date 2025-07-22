
async function sendTelegramRequest(method: 'sendMessage' | 'sendPhoto', payload: object): Promise<void> {
    const token = process.env.TELEGRAM_TOKEN;
    const chatId = process.env.TELEGRAM_CHANNEL_ID;

    if (!token || !chatId) {
        throw new Error("Variáveis de ambiente TELEGRAM_TOKEN e TELEGRAM_CHANNEL_ID são obrigatórias.");
    }
    
    const apiUrl = `https://api.telegram.org/bot${token}/${method}`;

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, ...payload }),
        });

        const data = await response.json();

        if (!data.ok) {
            if (data.description && data.description.includes('chat not found')) {
                throw new Error(`Erro da API do Telegram: Chat não encontrado. Verifique o ID do Canal (${chatId}).`);
            }
            if (data.description && data.description.includes('Wrong file identifier')) {
                throw new Error(`Erro da API do Telegram: A URL da imagem é inválida ou inacessível pelo Telegram.`);
            }
             if (data.description && data.description.includes('caption is too long')) {
                 throw new Error(`Erro da API do Telegram: O texto do post é muito longo para uma legenda (máx. 1024 caracteres).`);
            }
            throw new Error(`Erro da API do Telegram: ${data.description || 'Erro desconhecido'}`);
        }
    } catch (error) {
        console.error(`Erro ao chamar a API do Telegram (${method}):`, error);
        if (error instanceof Error && error.message.startsWith('Erro da API do Telegram')) {
            throw error;
        }
        throw new Error(`Falha ao comunicar com o Telegram. Verifique as configurações e a rede.`);
    }
}


export async function postMessage(text: string): Promise<void> {
  if (!text) {
    throw new Error("O texto da mensagem é obrigatório.");
  }
  await sendTelegramRequest('sendMessage', {
      text: text,
      parse_mode: 'HTML',
  });
}

export async function postPhoto(photoUrl: string, caption: string): Promise<void> {
    if (!photoUrl) {
        throw new Error("A URL da foto é obrigatória.");
    }
    await sendTelegramRequest('sendPhoto', {
        photo: photoUrl,
        caption: caption,
        parse_mode: 'HTML',
    });
}
