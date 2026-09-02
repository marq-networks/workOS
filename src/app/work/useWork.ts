import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useOrganization } from '../contexts/OrganizationContext';
import type { ProjectInput, TaskInput, WorkAssignee, WorkFailure, WorkProject, WorkRepository, WorkTask } from './types';

// Keep route-registry/static rendering safe: the configured browser client is loaded only when
// an authenticated Work query actually runs, never while route modules are inspected in CI.
const productionRepository: WorkRepository = {
  listProjects: async (...args) => (await import('./supabaseWorkRepository')).supabaseWorkRepository.listProjects(...args),
  listTasks: async (...args) => (await import('./supabaseWorkRepository')).supabaseWorkRepository.listTasks(...args),
  listAssignableMembers: async (...args) => (await import('./supabaseWorkRepository')).supabaseWorkRepository.listAssignableMembers(...args),
  createProject: async (...args) => (await import('./supabaseWorkRepository')).supabaseWorkRepository.createProject(...args),
  createTask: async (...args) => (await import('./supabaseWorkRepository')).supabaseWorkRepository.createTask(...args),
  updateProject: async (...args) => (await import('./supabaseWorkRepository')).supabaseWorkRepository.updateProject(...args),
  updateTask: async (...args) => (await import('./supabaseWorkRepository')).supabaseWorkRepository.updateTask(...args),
};

export function useWork(repository: WorkRepository = productionRepository) {
  const { user } = useAuth(); const { activeMembership, activeRole } = useOrganization();
  const [projects,setProjects]=useState<WorkProject[]>([]); const [tasks,setTasks]=useState<WorkTask[]>([]);
  const [assignees,setAssignees]=useState<WorkAssignee[]>([]);
  const [loading,setLoading]=useState(true); const [error,setError]=useState<WorkFailure|null>(null); const generation=useRef(0);
  const scope=useMemo(()=>activeMembership ? {organizationId:activeMembership.organizationId,tenantId:activeMembership.tenantId,membershipId:activeMembership.id}:null,[activeMembership]);
  const reload=useCallback(async()=>{ const request=++generation.current; setProjects([]); setTasks([]); setAssignees([]); setError(null); if(!scope){setLoading(false);return;} setLoading(true); try { const [nextProjects,nextTasks,nextAssignees]=await Promise.all([repository.listProjects(scope),repository.listTasks(scope),activeRole==='org_admin'?repository.listAssignableMembers(scope):Promise.resolve([])]); if(request===generation.current){setProjects(nextProjects);setTasks(nextTasks);setAssignees(nextAssignees);} } catch(e){if(request===generation.current)setError(e as WorkFailure);} finally {if(request===generation.current)setLoading(false);} },[repository,scope,activeRole]);
  useEffect(()=>{void reload(); const request=generation.current; return()=>{if(generation.current===request)generation.current=request+1;};},[reload]);
  const createProject=async(input:ProjectInput)=>{if(!scope||!user)throw new Error('Work scope unavailable');const saved=await repository.createProject(scope,user.id,input);setProjects(v=>[saved,...v]);return saved;};
  const createTask=async(input:TaskInput)=>{if(!scope||!user)throw new Error('Work scope unavailable');const saved=await repository.createTask(scope,user.id,input);setTasks(v=>[saved,...v]);return saved;};
  const updateProject=async(current:WorkProject,patch:Parameters<WorkRepository['updateProject']>[1])=>{const saved=await repository.updateProject(current,patch);setProjects(v=>v.map(x=>x.id===saved.id?saved:x));return saved;};
  const updateTask=async(current:WorkTask,patch:Parameters<WorkRepository['updateTask']>[1])=>{const saved=await repository.updateTask(current,patch);setTasks(v=>v.map(x=>x.id===saved.id?saved:x));return saved;};
  return {projects,tasks,assignees,loading,error,reload,createProject,createTask,updateProject,updateTask,isAdmin:activeRole==='org_admin'};
}
