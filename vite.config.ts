import { defineConfig, loadEnv } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { validateSupabaseEnvironment } from './src/config/deploymentEnvironment'


function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id: string) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

export default defineConfig(({ mode }) => {
  const environment = loadEnv(mode, process.cwd(), '')
  const vercelEnvironment = process.env.VERCEL_ENV ?? environment.VERCEL_ENV

  if (vercelEnvironment === 'production' || vercelEnvironment === 'preview') {
    validateSupabaseEnvironment({
      VERCEL_ENV: vercelEnvironment,
      VITE_SUPABASE_URL: environment.VITE_SUPABASE_URL,
      VITE_SUPABASE_PUBLISHABLE_KEY: environment.VITE_SUPABASE_PUBLISHABLE_KEY,
    })
  }

  return {
    plugins: [
      figmaAssetResolver(),
      // The React and Tailwind plugins are both required for Make, even if
      // Tailwind is not being actively used – do not remove them
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        // Alias @ to the src directory
        '@': path.resolve(__dirname, './src'),
      },
    },
  }
})
