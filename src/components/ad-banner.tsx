
"use client";

import { useEffect } from 'react';

export function AdBanner() {

  useEffect(() => {
    try {
      // @ts-ignore
      (adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error("AdSense error:", e);
    }
  }, []);

  return (
    <div className="my-6 flex justify-center items-center w-full h-[90px] bg-muted/30 rounded-lg overflow-hidden">
      <ins 
        className="adsbygoogle"
        style={{ display: 'block', width: '100%', height: '90px' }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" // <-- REEMPLAZA ESTO con tu ID de editor
        data-ad-slot="YYYYYYYYYY" // <-- REEMPLAZA ESTO con tu ID de bloque de anuncios
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
}
