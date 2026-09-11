import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useOrganization } from '../contexts/OrganizationContext';
import type { V2Failure, V2Repository } from './types';

export type V2Module='milestones'|'subtasks'|'assignments'|'dependencies'|'people'|'departments'|'skills'|'capacity'|'sessions'|'time'|'notifications';
const repository:Promise<V2Repository>=import('./supabaseV2Repository').then(m=>m.supabaseV2Repository);

export function useV2Module(module:V2Module,override?:V2Repository){
  const {user}=useAuth();const {activeMembership,activeRole}=useOrganization();
  const scope=useMemo(()=>activeMembership?{tenantId:activeMembership.tenantId,organizationId:activeMembership.organizationId,membershipId:activeMembership.id}:null,[activeMembership]);
  const [records,setRecords]=useState<unknown[]>([]);const [loading,setLoading]=useState(true);const [error,setError]=useState<V2Failure|null>(null);const generation=useRef(0);
  const reload=useCallback(async()=>{const request=++generation.current;setRecords([]);setError(null);if(!scope){setLoading(false);return;}setLoading(true);try{const r=override??await repository;const mine=activeRole!=='org_admin';const loaders={milestones:()=>r.listMilestones(scope),subtasks:()=>r.listSubtasks(scope),assignments:()=>r.listAssignments(scope,mine),dependencies:()=>r.listDependencies(scope),people:()=>r.listPeople(scope),departments:()=>r.listDepartments(scope),skills:()=>r.listSkills(scope),capacity:()=>r.listCapacity(scope),sessions:()=>r.listWorkSessions(scope,mine),time:()=>r.listTimeEntries(scope,mine),notifications:()=>r.listNotifications(scope)};const next=await loaders[module]();if(request===generation.current)setRecords(next);}catch(e){if(request===generation.current)setError(e as V2Failure);}finally{if(request===generation.current)setLoading(false);}},[activeRole,module,override,scope]);
  useEffect(()=>{void reload();return()=>{generation.current+=1;};},[reload]);
  const execute=async<T>(operation:(r:V2Repository)=>Promise<T>)=>{if(!scope||!user)throw new Error('Validated organization scope is unavailable');const saved=await operation(override??await repository);await reload();return saved;};
  return {records,loading,error,reload,execute,scope,user,isAdmin:activeRole==='org_admin'};
}
