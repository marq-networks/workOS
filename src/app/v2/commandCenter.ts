import { buildImpactGraph,projectWorkload,type Capacity,type Dependency,type PlanningItem } from '../work/v2Planning';
import type { Conversation,Message } from './pass3Types';
import type { Notification,TimeEntry,WorkSession } from './types';
export interface EmployeeCommandCenter {today:PlanningItem[];overdue:PlanningItem[];upcoming:PlanningItem[];blocked:PlanningItem[];highImpact:PlanningItem[];activeSession:WorkSession|null;recentConversations:Conversation[];notifications:Notification[]}
export function employeeCommandCenter(items:PlanningItem[],dependencies:Dependency[],sessions:WorkSession[],conversations:Conversation[],notifications:Notification[],now=new Date()):EmployeeCommandCenter{
 const day=now.toISOString().slice(0,10);const graph=buildImpactGraph(items,dependencies,now);return{today:items.filter(i=>i.dueDate===day),overdue:items.filter(i=>Boolean(i.dueDate&&i.dueDate<day)&&i.status!=='completed'),upcoming:items.filter(i=>Boolean(i.dueDate&&i.dueDate>day)&&i.status!=='completed'),blocked:items.filter(i=>i.status==='blocked'),highImpact:items.filter(i=>graph.find(n=>n.taskId===i.id)?.downstream.length),activeSession:sessions.find(s=>!s.endedAt)??null,recentConversations:conversations.slice(0,5),notifications:notifications.filter(n=>!n.readAt)};
}
export interface AdminCommandCenter {projectProgress:number;blockedCount:number;dependencyRisks:number;workload:ReturnType<typeof projectWorkload>;submittedTime:number;recentActivity:Message[]}
export function adminCommandCenter(items:PlanningItem[],dependencies:Dependency[],capacity:Capacity[],time:TimeEntry[],activity:Message[]):AdminCommandCenter{
 const active=items.filter(i=>i.status!=='archived');const total=active.reduce((n,i)=>n+i.progress,0);return{projectProgress:active.length?Math.round(total/active.length):0,blockedCount:active.filter(i=>i.status==='blocked').length,dependencyRisks:buildImpactGraph(active,dependencies).filter(n=>n.waiting||n.dueDateRisk).length,workload:projectWorkload(active,capacity),submittedTime:time.filter(e=>e.status==='submitted').length,recentActivity:activity.slice(0,10)};
}
