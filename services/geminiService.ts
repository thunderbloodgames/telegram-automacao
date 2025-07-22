
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generatePostContent(topic: string): Promise<string> {
  if (!topic) {
    throw new Error("O tópico não pode estar vazio.");
  }
  
  try {
    const prompt = `
      Você é um especialista em marketing digital e SEO, criando posts para um canal do Telegram.
      Sua tarefa é criar um texto curto e impactante para acompanhar um link, com base no tópico: "${topic}".

      O texto deve seguir estritamente este formato, incluindo as linhas em branco:
      1.  Um título MUITO chamativo e direto em LETRAS MAIÚSCULAS, usando emojis para impacto visual. Deve ter no máximo 15 palavras.
      2.  Uma linha em branco.
      3.  Uma chamada para ação (CTA) clara como "👇 Baixe o curso completo ".
      4.  Uma linha em branco.
      5.  O placeholder "[LINK]".
      6.  Uma linha em branco.
      7.  De 3 a 5 hashtags relevantes e em alta, relacionadas ao tópico.

      Exemplo de Post baseado no tópico "Melhores investimentos para 2025":
"💥 MELHORES INVESTIMENTOS PARA 2025: O GUIA DEFINITIVO! 💥

👇 Baixe o curso completo 

[LINK]

#Investimentos #Acoes #FIIs #Bitcoin #RendaFixa"

      Sua resposta deve conter APENAS o texto do post, seguindo o formato à risca. Não adicione nenhuma explicação ou formatação extra.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    
    // Ensure the response text doesn't have leading/trailing markdown backticks or "markdown" label
    let text = response.text.trim();
    if (text.startsWith('```')) {
        text = text.substring(text.indexOf('\n') + 1, text.lastIndexOf('```')).trim();
    }
    
    return text;
  } catch (error) {
    console.error("Erro ao gerar conteúdo com Gemini:", error);
    throw new Error("Não foi possível gerar o conteúdo. Verifique o tópico e tente novamente.");
  }
}