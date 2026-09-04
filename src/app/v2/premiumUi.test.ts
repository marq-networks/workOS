import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
const read=(path:string)=>readFileSync(new URL(path,import.meta.url),'utf8');
describe('V2 premium UI contracts',()=>{
  it('provides first-class light/dark semantic tokens and reduced motion',()=>{const css=read('../../styles/theme.css');for(const token of ['--success:','--warning:','--ai:','--offline:'])expect(css).toContain(token);expect(css).toContain('.dark {');expect(css).toContain('prefers-reduced-motion');});
  it('uses the premium shell and intentional empty states',()=>{const source=read('./V2FunctionalScreens.tsx');expect(source).toContain('premium-page');expect(source).toContain('premium-empty');expect(source).toContain('aria-label="Work filters"');});
  it('keeps workspace panels repository-backed',()=>{const source=read('./Pass3Screens.tsx');expect(source).toContain("import('./supabaseClosureRepository')");expect(source).not.toContain('ExecutionOSMockService');expect(source).not.toContain('localStorage');});
});
