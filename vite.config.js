import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // opcional: si quieres exponer también el server de dev
  server: {
    host: true,
  },
  preview: {
    // hace que escuche en 0.0.0.0
    host: true,
    // puerto opcional, Railway inyecta PORT
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : 4173,
    // aquí autorizas tu dominio
    allowedHosts: [
      'realidadnacional.net',
      // si tienes subdominios o quieres todo, puedes usar:
      // '.realidadnacional.net'
      // o
      // 'all'
    ],
  },
})
