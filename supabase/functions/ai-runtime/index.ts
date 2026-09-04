import{configuredProvider,executionRequiresConfirmation,validateAiRequest}from'../_shared/aiProvider.ts';
const json=(status:number,body:unknown)=>new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json'}});
Deno.serve(async request=>{
 if(request.method!=='POST')return json(405,{error:'method_not_allowed'});
 if(!request.headers.get('authorization')?.startsWith('Bearer '))return json(401,{error:'authentication_required'});
 const provider=configuredProvider({provider:Deno.env.get('AI_PROVIDER'),apiKey:Deno.env.get('AI_PROVIDER_API_KEY'),endpoint:Deno.env.get('AI_PROVIDER_ENDPOINT'),model:Deno.env.get('AI_PROVIDER_MODEL')});
 const input=await request.json();if(input.operation==='configuration_status')return provider?json(200,{status:'ready'}):json(503,{status:'configuration_required'});
 if(!provider)return json(503,{status:'configuration_required',message:'A server-side AI provider must be configured.'});
 try{const governed=validateAiRequest(input);executionRequiresConfirmation(governed.authority,Boolean(input.confirmed));return json(200,await provider.complete(governed));}catch{return json(400,{error:'invalid_or_unconfirmed_request'});}
});
