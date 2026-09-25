export type AnalyticsEventName =
  | 'page_view'
  | 'prologue_started'
  | 'prologue_completed'
  | 'prologue_skipped'
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
  | 'recovery_code_generated'
  | 'install_prompt_shown'
  | 'boss_fight_started'
  | 'boss_fight_won'
  | 'boss_fight_lost'
  | 'module_left';

export type AnalyticsProps = Record<string, string | number | boolean>;

export interface AnalyticsPort {
  track(event: AnalyticsEventName, props?: AnalyticsProps): void;
}
