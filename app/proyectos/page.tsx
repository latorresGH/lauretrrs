import type { Metadata } from 'next';
import ProjectsPage from '@/components/ProjectsPage';

export const metadata: Metadata = {
  title: 'Proyectos — Laureano',
  description: 'Proyectos de diseño y desarrollo web de Laureano.',
};

export default function Page() {
  return <ProjectsPage />;
}
