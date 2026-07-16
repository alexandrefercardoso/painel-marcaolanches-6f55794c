// @ts-ignore - qz-tray has no type definitions
import qz from 'qz-tray';
import { supabase } from '@/integrations/supabase/client';
import { QZ_CERTIFICATE } from './qz-certificate';

let isConnecting = false;

// Assinatura SHA-512 via edge function (chave privada fica no backend).
qz.security.setCertificatePromise(function (resolve: (value?: unknown) => void) {
  resolve(QZ_CERTIFICATE);
});

qz.security.setSignatureAlgorithm('SHA512');

qz.security.setSignaturePromise(function (toSign: string) {
  return async function (
    resolve: (value: string) => void,
    reject: (reason?: unknown) => void
  ) {
    try {
      const { data, error } = await supabase.functions.invoke('qz-sign', {
        body: { request: toSign },
      });
      if (error) throw error;
      if (!data?.signature) throw new Error('Assinatura QZ não retornada');
      resolve(data.signature);
    } catch (err) {
      console.error('[QZTray] Erro ao assinar:', err);
      reject(err);
    }
  };
});

export async function ensureQZConnected(): Promise<boolean> {
  if (qz.websocket.isActive()) return true;

  if (isConnecting) {
    await new Promise((r) => setTimeout(r, 500));
    return qz.websocket.isActive();
  }

  isConnecting = true;
  try {
    await qz.websocket.connect();
    return true;
  } catch (err) {
    console.error('[QZTray] Falha ao conectar ao QZ Tray:', err);
    return false;
  } finally {
    isConnecting = false;
  }
}

export function isQZConnected(): boolean {
  try {
    return qz.websocket.isActive();
  } catch {
    return false;
  }
}

interface QZPrintParams {
  printerName: string;
  htmlContent: string;
  copies?: number;
}

export async function printViaQZ({ printerName, htmlContent, copies = 1 }: QZPrintParams): Promise<void> {
  const connected = await ensureQZConnected();
  if (!connected) {
    throw new Error(
      'Não foi possível conectar ao QZ Tray. Verifique se o app está aberto no computador da impressora.'
    );
  }

  const config = qz.configs.create(printerName, { copies });

  const data = [
    {
      type: 'pixel',
      format: 'html',
      flavor: 'plain',
      data: htmlContent,
    },
  ];

  await qz.print(config, data);
}

export async function listQZPrinters(): Promise<string[]> {
  const connected = await ensureQZConnected();
  if (!connected) return [];
  return await qz.printers.find();
}
