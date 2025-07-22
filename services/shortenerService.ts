
import type { ShrinkmeResponse } from '../types';

/**
 * Gera um alias aleatório de 5 caracteres para a URL.
 * A API shrinkme.io exige um alias.
 */
const generateAlias = (): string => {
  return Math.random().toString(36).substring(2, 7);
};

export async function shortenUrl(longUrl: string): Promise<string> {
  const apiKey = process.env.SHORTENER_API_KEY;

  if (!longUrl || !apiKey) {
    throw new Error("URL longa e variável de ambiente SHORTENER_API_KEY são necessárias.");
  }

  // A API shrinkme.io exige um parâmetro 'alias'.
  const alias = generateAlias();
  const apiUrl = `https://shrinkme.io/api?api=${apiKey}&url=${encodeURIComponent(longUrl)}&alias=${alias}`;

  try {
    const response = await fetch(apiUrl); // Usa fetch diretamente
    
    // O status 401 é comum quando a API key é inválida
    if (response.status === 401) {
        throw new Error("Erro do encurtador: API Key inválida ou não autorizada.");
    }

    const data: ShrinkmeResponse = await response.json();
    
    if (data.status === 'success') {
      return data.shortenedUrl;
    } else if (data.status === 'error' && data.message) {
      // Trata erros específicos da API shrinkme.io
      if (data.message.includes("shortened url already exists")) {
          console.warn("Alias do encurtador já existe, tentando novamente...");
          // Tenta novamente com um novo alias recursivamente.
          return shortenUrl(longUrl);
      }
      throw new Error(`Erro do encurtador: ${data.message}`);
    } else {
       console.error("Resposta inesperada da API do encurtador:", data);
       throw new Error("Formato de resposta inválido da API do encurtador.");
    }

  } catch (error) {
    console.error("Erro ao encurtar URL:", error);
    if (error instanceof Error) {
        throw error;
    }
    throw new Error("Falha desconhecida na requisição ao encurtador.");
  }
}
