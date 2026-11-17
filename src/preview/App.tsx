import { lazy, Suspense } from 'react';

const ChatGPTPage = lazy(() => import('./ChatGPTPage'));
const LibraryApp = lazy(() => import('./LibraryApp'));

export default function App() {
  const Page = /^\/chatgpt\/?$/.test(window.location.pathname) ? ChatGPTPage : LibraryApp;
  return <Suspense fallback={<main className="p-8" role="status">Opening Motion Lib…</main>}><Page /></Suspense>;
}
