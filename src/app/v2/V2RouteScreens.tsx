import { lazy,Suspense,type ComponentType } from 'react';

type ScreenName='AssignmentsScreen'|'DepartmentsScreen'|'MilestonesScreen'|'MyWorkScreen'|'PeopleScreen'|'SessionsScreen'|'TimeEntriesScreen'|'WorkReportsScreen'|'WorkSessionScreen';
const screen=(name:ScreenName)=>lazy(()=>import('./V2FunctionalScreens').then(module=>({default:module[name] as ComponentType})));
const Assignments=screen('AssignmentsScreen');const Departments=screen('DepartmentsScreen');const Milestones=screen('MilestonesScreen');
const MyWork=screen('MyWorkScreen');const People=screen('PeopleScreen');const Sessions=screen('SessionsScreen');
const TimeEntries=screen('TimeEntriesScreen');const Reports=screen('WorkReportsScreen');const WorkSession=screen('WorkSessionScreen');
const fallback=<div className="p-6">Loading authoritative workspace…</div>;
export const V2AssignmentsScreen=()=> <Suspense fallback={fallback}><Assignments/></Suspense>;
export const V2DepartmentsScreen=()=> <Suspense fallback={fallback}><Departments/></Suspense>;
export const V2MilestonesScreen=()=> <Suspense fallback={fallback}><Milestones/></Suspense>;
export const V2MyWorkScreen=()=> <Suspense fallback={fallback}><MyWork/></Suspense>;
export const V2PeopleScreen=()=> <Suspense fallback={fallback}><People/></Suspense>;
export const V2SessionsScreen=()=> <Suspense fallback={fallback}><Sessions/></Suspense>;
export const V2TimeEntriesScreen=()=> <Suspense fallback={fallback}><TimeEntries/></Suspense>;
export const V2WorkReportsScreen=()=> <Suspense fallback={fallback}><Reports/></Suspense>;
export const V2WorkSessionScreen=()=> <Suspense fallback={fallback}><WorkSession/></Suspense>;
