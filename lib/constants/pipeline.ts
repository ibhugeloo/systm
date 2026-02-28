import { Client } from '@/types/database';

export const STATUS_COLUMNS: Client['status'][] = [
  'onboarding',
  'mvp_generated',
  'demo_scheduled',
  'demo_done',
  'handoff_sent',
  'in_production',
  'closed',
];

export const STATUS_LABELS: Record<Client['status'], string> = {
  onboarding: 'Intégration',
  mvp_generated: 'MVP généré',
  demo_scheduled: 'Démo prévue',
  demo_done: 'Démo terminée',
  handoff_sent: 'Remise envoyée',
  in_production: 'En production',
  closed: 'Clôturé',
};

export const STATUS_COLORS: Record<Client['status'], string> = {
  onboarding: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  mvp_generated: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  demo_scheduled: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  demo_done: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  handoff_sent: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
  in_production: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  closed: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
};
