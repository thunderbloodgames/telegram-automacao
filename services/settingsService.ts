
export interface AppSettings {
    telegramToken: string;
    channelId: string;
    shortenerApiKey: string;
    rssFeedUrl: string;
}

const SETTINGS_KEY = 'telegramContentGenerator_settings';

/**
 * Recupera as configurações do aplicativo do localStorage para preencher o formulário.
 */
export function getSettings(): AppSettings {
    try {
        const storedSettings = localStorage.getItem(SETTINGS_KEY);
        if (storedSettings) {
            return JSON.parse(storedSettings);
        }
    } catch (error) {
        console.error("Erro ao ler configurações do localStorage:", error);
    }
    // Retorna um objeto com valores padrão se nada for encontrado
    return {
        telegramToken: '',
        channelId: '',
        shortenerApiKey: '',
        rssFeedUrl: 'https://dinheirocursosdownload.com/feed/' // Manter como exemplo
    };
}

/**
 * Salva as configurações do aplicativo no localStorage para referência do usuário.
 */
export function saveSettings(settings: AppSettings): void {
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
        console.error("Erro ao salvar configurações no localStorage:", error);
    }
}
