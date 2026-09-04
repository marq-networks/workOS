import type { OrganizationScope } from './types';

export type OfflineState='queued'|'replaying'|'applied'|'conflict'|'rejected';
export interface OfflineOperation { id:string;idempotencyKey:string;scope:OrganizationScope;entityType:string;entityId?:string;operation:string;payload:Record<string,unknown>;baseRevision?:number;createdAt:string;state:OfflineState;failureCode?:string }
export interface OfflineStore { list():Promise<OfflineOperation[]>;put(operation:OfflineOperation):Promise<void>;remove(id:string):Promise<void> }
export interface ReplayAuthority { revalidate(scope:OrganizationScope):Promise<boolean>;replay(operation:OfflineOperation):Promise<{status:'applied'|'conflict'|'rejected';failureCode?:string}> }

export function createOfflineOperation(scope:OrganizationScope,input:Pick<OfflineOperation,'entityType'|'entityId'|'operation'|'payload'|'baseRevision'>,id=crypto.randomUUID()):OfflineOperation{
 return{id,idempotencyKey:crypto.randomUUID(),scope,...input,createdAt:new Date().toISOString(),state:'queued'};
}
export async function replayOfflineQueue(store:OfflineStore,authority:ReplayAuthority):Promise<OfflineOperation[]>{
 const reconciled:OfflineOperation[]=[];
 for(const current of await store.list()){
  if(current.state==='applied'||current.state==='rejected')continue;
  if(!await authority.revalidate(current.scope)){const rejected={...current,state:'rejected' as const,failureCode:'authorization_revoked'};await store.put(rejected);reconciled.push(rejected);continue;}
  const replaying={...current,state:'replaying' as const};await store.put(replaying);
  const result=await authority.replay(replaying);const next={...replaying,state:result.status,failureCode:result.failureCode};await store.put(next);reconciled.push(next);
 }
 return reconciled;
}

export class IndexedDbOfflineStore implements OfflineStore{
 private open():Promise<IDBDatabase>{return new Promise((resolve,reject)=>{const request=indexedDB.open('workos-authorized-offline',1);request.onupgradeneeded=()=>request.result.createObjectStore('mutations',{keyPath:'id'});request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});}
 async list(){const db=await this.open();return new Promise<OfflineOperation[]>((resolve,reject)=>{const request=db.transaction('mutations').objectStore('mutations').getAll();request.onsuccess=()=>resolve(request.result as OfflineOperation[]);request.onerror=()=>reject(request.error);});}
 async put(operation:OfflineOperation){const db=await this.open();await new Promise<void>((resolve,reject)=>{const request=db.transaction('mutations','readwrite').objectStore('mutations').put(operation);request.onsuccess=()=>resolve();request.onerror=()=>reject(request.error);});}
 async remove(id:string){const db=await this.open();await new Promise<void>((resolve,reject)=>{const request=db.transaction('mutations','readwrite').objectStore('mutations').delete(id);request.onsuccess=()=>resolve();request.onerror=()=>reject(request.error);});}
}
