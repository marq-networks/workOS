import { lazy, Suspense } from 'react';
const WorkProductionScreen=lazy(()=>import('../../../work/WorkProductionScreen').then(module=>({default:module.WorkProductionScreen})));
export function WorkProjectsOS(){return <Suspense fallback={<div className="p-6">Loading Work…</div>}><WorkProductionScreen view="projects"/></Suspense>;}
