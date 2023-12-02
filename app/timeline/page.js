'use client';

import dynamic from 'next/dynamic';

const Timeline = dynamic(() => import('./timeline'), { 
  ssr: false, // Disable server-side rendering for this page
});

export default function TimelinePage() {
	return <Timeline />;
}
