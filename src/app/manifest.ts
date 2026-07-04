import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'School MIS - Management Information System',
    short_name: 'School MIS',
    description: 'Comprehensive School Management Information System for managing students, teachers, attendance, exams, fees, library, and more.',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#3b82f6',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    categories: ['education', 'productivity', 'business'],
    lang: 'en-US',
    dir: 'ltr',
    scope: '/',
    id: 'school-mis',
    display_override: ['standalone', 'fullscreen', 'minimal-ui'],
    prefer_related_applications: false,
    shortcuts: [
      {
        name: 'Dashboard',
        url: '/dashboard',
        description: 'View dashboard',
      },
      {
        name: 'Students',
        url: '/students',
        description: 'Manage students',
      },
      {
        name: 'Attendance',
        url: '/attendance',
        description: 'Mark attendance',
      },
    ],
  }
}