export type AnalyticsEventName =
  | 'page_view'
  | 'island_opened'
  | 'module_started'
  | 'quiz_answered'
  | 'module_completed'
  | 'island_completed'
  | 'lab_opened'
  | 'lab_query_run'
  | 'mission_completed'
  | 'support_opened'
  | 'pix_key_copied'
  | 'pix_qr_shown'
  | 'progress_exported'
  | 'progress_imported'
  | 'install_prompt_shown';

export type AnalyticsProps = Record<string, string | number | boolean>;

export interface AnalyticsPort {
  track(event: AnalyticsEventName, props?: AnalyticsProps): void;
}
