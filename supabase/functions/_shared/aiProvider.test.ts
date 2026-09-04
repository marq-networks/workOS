import{afterEach,describe,expect,it,vi}from'vitest';import{configuredProvider,executionRequiresConfirmation,validateAiRequest}from'./aiProvider';
describe('AI provider governance',()=>{
 afterEach(()=>vi.unstubAllGlobals());
 it('fails closed without a configured server provider',()=>expect(configuredProvider({})).toBeNull());
 it('bounds prompt and context',()=>{expect(()=>validateAiRequest({capability:'briefing',authority:'read',prompt:'',context:[]})).toThrow('invalid_prompt');expect(()=>validateAiRequest({capability:'briefing',authority:'read',prompt:'ok',context:Array(101)})).toThrow('invalid_context');});
 it('requires explicit confirmation for execute',()=>{expect(()=>executionRequiresConfirmation('execute',false)).toThrow('confirmation_required');expect(()=>executionRequiresConfirmation('draft',false)).not.toThrow();});
 it('supports a configured server-side provider without exposing its key in results',async()=>{const fetch=vi.fn(async()=>new Response(JSON.stringify({choices:[{message:{content:'reviewable draft'}}]}),{status:200}));vi.stubGlobal('fetch',fetch);const provider=configuredProvider({provider:'openai-compatible',apiKey:'server-secret',endpoint:'https://provider.test/v1/chat',model:'approved-model'});await expect(provider!.complete({capability:'project_plan',authority:'draft',prompt:'Plan',context:[]})).resolves.toEqual({content:'reviewable draft',provider:'openai-compatible',model:'approved-model'});expect(JSON.stringify(await fetch.mock.calls[0][1])).toContain('server-secret');});
});
