export type AiAuthority='read'|'draft'|'execute';
export interface AiProviderRequest {capability:string;authority:AiAuthority;prompt:string;context:unknown[]}
export interface AiProviderResult {content:string;provider:string;model:string}
export interface AiProvider {complete(request:AiProviderRequest):Promise<AiProviderResult>}
export interface AiRuntimeConfig {provider?:string;apiKey?:string;endpoint?:string;model?:string}
export function validateAiRequest(input:AiProviderRequest):AiProviderRequest{
 if(!['read','draft','execute'].includes(input.authority))throw new Error('invalid_authority');
 if(!input.capability||input.capability.length>80)throw new Error('invalid_capability');
 if(!input.prompt.trim()||input.prompt.length>12000)throw new Error('invalid_prompt');
 if(!Array.isArray(input.context)||input.context.length>100)throw new Error('invalid_context');
 return{...input,prompt:input.prompt.trim()};
}
export function configuredProvider(config:AiRuntimeConfig):AiProvider|null{
 if(config.provider!=='openai-compatible'||!config.apiKey||!config.endpoint||!config.model)return null;
 return{async complete(request){const response=await fetch(config.endpoint!,{method:'POST',headers:{authorization:`Bearer ${config.apiKey}`,'content-type':'application/json'},body:JSON.stringify({model:config.model,messages:[{role:'system',content:`Capability: ${request.capability}. Authority: ${request.authority}. Return reviewable output only.`},{role:'user',content:JSON.stringify({prompt:request.prompt,context:request.context})}],temperature:0.2})});if(!response.ok)throw new Error('provider_request_failed');const payload=await response.json() as{choices?:{message?:{content?:string}}[]};const content=payload.choices?.[0]?.message?.content;if(!content)throw new Error('provider_response_invalid');return{content,provider:config.provider!,model:config.model!};}};
}
export function executionRequiresConfirmation(authority:AiAuthority,confirmed:boolean){if(authority==='execute'&&!confirmed)throw new Error('confirmation_required');}
