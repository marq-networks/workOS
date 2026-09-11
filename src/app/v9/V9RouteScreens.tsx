import { lazy, Suspense } from 'react';

const MyWork = lazy(() => import('./V9MyWork').then(module => ({ default: module.V9MyWork })));

export function V9MyWorkScreen() {
  return <Suspense fallback={<main className="v9-work"><div className="v9-work-loading"><span/><p>Aligning your authorized execution field</p><small>WORK OS / MY WORK</small></div></main>}><MyWork/></Suspense>;
}
