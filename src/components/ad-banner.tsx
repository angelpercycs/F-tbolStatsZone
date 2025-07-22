import Image from 'next/image';

export function AdBanner() {
  return (
    <div className="my-6 flex justify-center items-center w-full h-auto bg-muted/30 rounded-lg overflow-hidden p-2">
      <a href="#" target="_blank" rel="noopener sponsored" className="w-full h-full flex items-center justify-center">
        <Image
          src="https://placehold.co/728x90.png"
          alt="Publicidad"
          width={728}
          height={90}
          className="object-contain w-full h-auto"
          data-ai-hint="advertisement banner"
        />
      </a>
    </div>
  );
}
