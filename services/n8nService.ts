
import { N8NResponse } from '../types';

export const PRODUCTION_URL = 'https://n8n.ftp-co.com/webhook/d1b5485e-7b95-4d31-9438-32b6552128f6';
export const TEST_URL = 'https://n8n.ftp-co.com/webhook-test/d1b5485e-7b95-4d31-9438-32b6552128f6';

/**
 * Modern CORS Proxies
 * These are used as fallbacks when direct browser requests are blocked by CORS policies.
 */
const PROXY_STRATEGIES = [
  {
    name: 'CorsProxy.io',
    getUrl: (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
    method: 'POST'
  },
  {
    name: 'AllOrigins (GET Fallback)',
    getUrl: (url: string) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
    method: 'GET'
  },
  {
    name: 'Codetabs',
    getUrl: (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
    method: 'POST'
  }
];

export const sendMessageToN8N = async (
  message: string, 
  isTestMode: boolean = false
): Promise<string> => {
  const baseUrl = isTestMode ? TEST_URL : PRODUCTION_URL;
  
  const payload = {
    chatInput: message,
    message: message,
    timestamp: new Date().toISOString(),
  };

  // 1. Try Direct POST (Best Case)
  try {
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const data = await response.json();
      return parseN8NData(data);
    }
  } catch (e) {
    console.warn("Direct connection blocked by CORS or Network. Trying proxies...");
  }

  // 2. Cycle through proxy strategies
  for (const strategy of PROXY_STRATEGIES) {
    try {
      console.log(`Attempting strategy: ${strategy.name}`);
      const proxyUrl = strategy.getUrl(baseUrl);
      
      const fetchOptions: RequestInit = {
        method: strategy.method,
        headers: strategy.method === 'POST' ? { 'Content-Type': 'application/json' } : {},
      };

      if (strategy.method === 'POST') {
        fetchOptions.body = JSON.stringify(payload);
      } else {
        // For GET, we append data to URL if possible, or just send the ping
        const getUrlWithData = `${proxyUrl}&chatInput=${encodeURIComponent(message)}`;
        const res = await fetch(getUrlWithData, fetchOptions);
        if (res.ok) {
          const data = await res.json();
          return parseN8NData(data);
        }
        continue;
      }

      const response = await fetch(proxyUrl, fetchOptions);

      if (response.ok) {
        const data = await response.json();
        return parseN8NData(data);
      }
    } catch (err) {
      console.error(`Strategy ${strategy.name} failed:`, err);
    }
  }

  throw new Error('ALL_STRATEGIES_FAILED');
};

/**
 * Robustly parses n8n responses which might be:
 * 1. Direct JSON from n8n: { output: "..." }
 * 2. Wrapped JSON from AllOrigins: { contents: '{"output": "..."}' }
 * 3. Array of objects: [{ output: "..." }]
 */
const parseN8NData = (data: any): string => {
  // Handle AllOrigins wrapping
  if (data && typeof data.contents === 'string') {
    try {
      const parsedContents = JSON.parse(data.contents);
      return extractText(parsedContents);
    } catch {
      return data.contents; // Fallback to raw text
    }
  }

  return extractText(data);
};

const extractText = (obj: any): string => {
  const item = Array.isArray(obj) ? obj[0] : obj;
  if (!item) return "پاسخ خالی از سرور دریافت شد.";

  return (
    item.output || 
    item.message || 
    item.response || 
    item.text || 
    item.reply || 
    (typeof item === 'string' ? item : JSON.stringify(item))
  );
};

export const pingServer = async (url: string): Promise<boolean> => {
  try {
    // Try a simple HEAD or GET request to see if the domain is reachable
    const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
    return res.ok;
  } catch {
    return false;
  }
};
