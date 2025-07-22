
import React, { useState, useCallback, useEffect } from 'react';
import Card from './components/Card';
import TextInput from './components/TextInput';
import Button from './components/Button';
import { getSettings, saveSettings } from './services/settingsService';

// Icons
const CogIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0 0 15 0m-15 0a7.5 7.5 0 1 1 15 0m-15 0H3m18 0h-1.5m-15.036-6.364l-1.06-1.06M21.75 16.5l-1.06-1.06M4.504 20.25l1.06-1.06M18.446 3.75l1.06 1.06" /></svg>;
const PencilIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z" /></svg>;
const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>;
const AutomationIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l-4.695 4.695a2.652 2.652 0 0 1-3.75 0l-.707-.707a2.652 2.652 0 0 1 0-3.75l4.695-4.695M11.42 15.17l-8.486-8.485a2.652 2.652 0 0 1 0-3.75l.707-.707a2.652 2.652 0 0 1 3.75 0L15.17 11.42" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;

export default function App() {
  // State for settings inputs
  const [rssFeedUrl, setRssFeedUrl] = useState('');
  const [telegramToken, setTelegramToken] = useState('');
  const [channelId, setChannelId] = useState('');
  const [shortenerApiKey, setShortenerApiKey] = useState('');
  const [isConfigLocked, setIsConfigLocked] = useState(true);
  
  // UI state
  const [isClearingHistory, setIsClearingHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load settings from localStorage on initial render
  useEffect(() => {
    const settings = getSettings();
    setRssFeedUrl(settings.rssFeedUrl);
    setTelegramToken(settings.telegramToken);
    setChannelId(settings.channelId);
    setShortenerApiKey(settings.shortenerApiKey);
    if (!settings.telegramToken || !settings.channelId) {
      setIsConfigLocked(false);
    }
  }, []);

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const handleSaveConfig = () => {
    clearMessages();
    const settings = { rssFeedUrl, telegramToken, channelId, shortenerApiKey };
    saveSettings(settings);
    setIsConfigLocked(true);
    setSuccess("Configurações salvas localmente! Lembre-se de configurar as Variáveis de Ambiente no seu projeto Vercel.");
  };
  
  const handleClearHistory = async () => {
    clearMessages();
    setIsClearingHistory(true);
    setError(null);
    try {
      const response = await fetch('/api/clear-history', { method: 'POST' });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Falha ao limpar o histórico.');
      }
      setSuccess("Histórico de posts no servidor foi limpo com sucesso!");
    } catch (e: any) {
      setError(`Não foi possível limpar o histórico: ${e.message}`);
    } finally {
      setIsClearingHistory(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-slate-900 text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500">
            Gerador de Conteúdo para Telegram
          </h1>
          <p className="mt-4 text-lg text-slate-400">
            Sistema de automação 24/7 para criação e publicação de posts.
          </p>
        </header>

        {error && <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg relative mb-6" role="alert">{error}</div>}
        {success && <div className="bg-green-500/20 border border-green-500 text-green-300 px-4 py-3 rounded-lg relative mb-6" role="alert">{success}</div>}

        <main className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="md:col-span-1 space-y-8">
            <Card title="Configurações" icon={<CogIcon />}>
              <div className="space-y-4">
                <div className="bg-sky-900/40 border border-sky-700 text-sky-200 text-xs rounded-md p-3">
                    <strong>Importante:</strong> Salve os valores aqui para referência. Para a automação funcionar, você <strong className="underline">deve</strong> configurar estes mesmos valores como <strong>Environment Variables</strong> nas configurações do seu projeto na Vercel.
                </div>
                <TextInput label="URL do Feed RSS" id="rssFeedUrl" placeholder="https://exemplo.com/feed/" value={rssFeedUrl} onChange={e => setRssFeedUrl(e.target.value)} disabled={isConfigLocked} />
                <TextInput label="Token do Bot do Telegram" id="telegramToken" type="password" placeholder="Seu token secreto" value={telegramToken} onChange={e => setTelegramToken(e.target.value)} disabled={isConfigLocked} />
                <TextInput label="ID do Canal do Telegram" id="channelId" placeholder="@seucanal ou -100..." value={channelId} onChange={e => setChannelId(e.target.value)} disabled={isConfigLocked} />
                <TextInput label="API Key do Encurtador (shrinkme.io)" id="shortenerApiKey" type="password" value={shortenerApiKey} onChange={e => setShortenerApiKey(e.target.value)} disabled={isConfigLocked} />
                 {isConfigLocked ? (
                  <Button onClick={() => setIsConfigLocked(false)} icon={<PencilIcon />}>Editar</Button>
                 ) : (
                  <Button onClick={handleSaveConfig} icon={<CheckIcon />}>Salvar Referência Local</Button>
                 )}
              </div>
            </Card>
          </div>

          <div className="md:col-span-1 space-y-8">
             <Card title="Automação no Servidor" icon={<AutomationIcon />}>
                <div className="space-y-4">
                    <p className="text-sm text-slate-300">
                        Sua automação agora roda <strong className="text-sky-400">24/7</strong> nos servidores da Vercel.
                    </p>
                    <ul className="list-disc list-inside text-sm text-slate-400 space-y-2">
                        <li>Um novo post será buscado e publicado <strong className="font-semibold">diariamente</strong>, automaticamente.</li>
                        <li>Você <strong className="underline">não</strong> precisa mais manter esta aba aberta.</li>
                        <li>Para ver os logs de atividade do robô, acesse a aba "Logs" no seu projeto Vercel.</li>
                    </ul>
                     <div className="mt-4 pt-4 border-t border-slate-700/50">
                        <p className="text-sm text-slate-400 mb-2">Se um artigo foi pulado, você pode limpar o histórico para permitir que o robô o busque novamente no próximo ciclo.</p>
                        <Button
                            onClick={handleClearHistory}
                            isLoading={isClearingHistory}
                            disabled={isClearingHistory}
                        >
                            <TrashIcon />
                            <span className="ml-2">Limpar Histórico de Posts</span>
                        </Button>
                    </div>
                </div>
            </Card>
          </div>

        </main>
        <footer className="text-center mt-12 text-slate-500 text-sm">
          <p>Powered by Gemini API & Vercel. Designed for content creators.</p>
        </footer>
      </div>
    </div>
  );
}
