import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('en', 'da', 'pl');
  CREATE TYPE "public"."enum_pages_blocks_cta_band_links_href" AS ENUM('about.html', 'billing.html', 'contact.html', 'cpq.html', 'implementation.html', 'index-print.html', 'index.html', 'platform.html', 'process.html', 'sales.html', 'subscription.html');
  CREATE TYPE "public"."enum_pages_blocks_cta_band_links_variant" AS ENUM('btn-blue', 'btn-cyan', 'btn-ghost', 'btn-outline-dark');
  CREATE TYPE "public"."enum_pages_blocks_page_hero_split_links_href" AS ENUM('about.html', 'billing.html', 'contact.html', 'cpq.html', 'implementation.html', 'index-print.html', 'index.html', 'platform.html', 'process.html', 'sales.html', 'subscription.html');
  CREATE TYPE "public"."enum_pages_blocks_page_hero_split_links_variant" AS ENUM('btn-blue', 'btn-cyan', 'btn-ghost', 'btn-outline-dark');
  CREATE TYPE "public"."enum_pages_blocks_feature_grid_accent" AS ENUM('acc-blue', 'acc-cyan', 'acc-green', 'acc-navy', 'acc-violet');
  CREATE TYPE "public"."enum_pages_blocks_page_hero_links_href" AS ENUM('about.html', 'billing.html', 'contact.html', 'cpq.html', 'implementation.html', 'index-print.html', 'index.html', 'platform.html', 'process.html', 'sales.html', 'subscription.html');
  CREATE TYPE "public"."enum_pages_blocks_integration_grid_cards_badge_letter" AS ENUM('D', 'H', 'P', 'S');
  CREATE TYPE "public"."enum_pages_blocks_integration_grid_accent" AS ENUM('acc-blue', 'acc-violet');
  CREATE TYPE "public"."enum_pages_blocks_q2c_board_links_href" AS ENUM('about.html', 'billing.html', 'contact.html', 'cpq.html', 'implementation.html', 'index-print.html', 'index.html', 'platform.html', 'process.html', 'sales.html', 'subscription.html');
  CREATE TYPE "public"."enum_pages_blocks_q2c_board_links_variant" AS ENUM('btn-ghost', 'btn-primary');
  CREATE TYPE "public"."enum_pages_blocks_innovate_forecast_links_href" AS ENUM('about.html', 'billing.html', 'contact.html', 'cpq.html', 'implementation.html', 'index-print.html', 'index.html', 'platform.html', 'process.html', 'sales.html', 'subscription.html');
  CREATE TYPE "public"."enum_pages_blocks_innovate_forecast_links_variant" AS ENUM('btn-cyan', 'btn-outline-dark');
  CREATE TYPE "public"."enum_pages_blocks_board_grid_people_image" AS ENUM('assets/board-henrik.jpeg', 'assets/board-karina.webp', 'assets/board-kristian.webp', 'assets/board-peter.webp');
  CREATE TYPE "public"."enum_pages_blocks_print_hero_links_href" AS ENUM('about.html', 'billing.html', 'contact.html', 'cpq.html', 'implementation.html', 'index-print.html', 'index.html', 'platform.html', 'process.html', 'sales.html', 'subscription.html');
  CREATE TYPE "public"."enum_pages_blocks_print_hero_links_variant" AS ENUM('btn-cyan', 'btn-outline-dark');
  CREATE TYPE "public"."enum_pages_blocks_home_hero_links_href" AS ENUM('about.html', 'billing.html', 'contact.html', 'cpq.html', 'implementation.html', 'index-print.html', 'index.html', 'platform.html', 'process.html', 'sales.html', 'subscription.html');
  CREATE TYPE "public"."enum_pages_blocks_home_hero_links_variant" AS ENUM('btn-cyan', 'btn-outline-dark');
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "media_locales" (
  	"alt" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "pages_blocks_cta_band_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"href" "enum_pages_blocks_cta_band_links_href",
  	"variant" "enum_pages_blocks_cta_band_links_variant",
  	"large" boolean,
  	"arrow" boolean,
  	"slots" jsonb
  );
  
  CREATE TABLE "pages_blocks_cta_band_links_locales" (
  	"content_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_cta_band" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"dark" boolean,
  	"narrow" boolean,
  	"body_class" varchar,
  	"section" varchar,
  	"lead" varchar,
  	"slots" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_cta_band_locales" (
  	"content_body" varchar,
  	"content_eyebrow" varchar,
  	"content_heading" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_page_hero_split_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"href" "enum_pages_blocks_page_hero_split_links_href",
  	"variant" "enum_pages_blocks_page_hero_split_links_variant",
  	"large" boolean,
  	"arrow" boolean,
  	"slots" jsonb
  );
  
  CREATE TABLE "pages_blocks_page_hero_split_links_locales" (
  	"content_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_page_hero_split" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"dark" boolean,
  	"dot_style" varchar,
  	"visual" varchar,
  	"section" varchar,
  	"lead" varchar,
  	"slots" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_page_hero_split_locales" (
  	"content_body" varchar,
  	"content_eyebrow" varchar,
  	"content_heading" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_split_prose_paragraphs" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"style" varchar,
  	"slots" jsonb
  );
  
  CREATE TABLE "pages_blocks_split_prose_paragraphs_locales" (
  	"content_text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_split_prose" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"alt" boolean,
  	"flip" boolean,
  	"id_attr" varchar,
  	"dot_style" varchar,
  	"visual" varchar,
  	"section" varchar,
  	"lead" varchar,
  	"slots" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_split_prose_locales" (
  	"content_eyebrow" varchar,
  	"content_heading" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_feature_grid_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" varchar,
  	"slots" jsonb
  );
  
  CREATE TABLE "pages_blocks_feature_grid_cards_locales" (
  	"content_body" varchar,
  	"content_heading" varchar,
  	"content_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_feature_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"accent" "enum_pages_blocks_feature_grid_accent",
  	"dot_style" varchar,
  	"section" varchar,
  	"lead" varchar,
  	"slots" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_feature_grid_locales" (
  	"content_eyebrow" varchar,
  	"content_heading" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_page_hero_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"href" "enum_pages_blocks_page_hero_links_href",
  	"variant" varchar,
  	"large" boolean,
  	"slots" jsonb
  );
  
  CREATE TABLE "pages_blocks_page_hero_links_locales" (
  	"content_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_page_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"container_style" varchar,
  	"lede_style" varchar,
  	"ctas_style" varchar,
  	"section" varchar,
  	"lead" varchar,
  	"slots" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_page_hero_locales" (
  	"content_body" varchar,
  	"content_eyebrow" varchar,
  	"content_heading" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_integration_grid_bullets" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"slots" jsonb
  );
  
  CREATE TABLE "pages_blocks_integration_grid_bullets_locales" (
  	"content_text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_integration_grid_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"badge_class" varchar,
  	"badge_letter" "enum_pages_blocks_integration_grid_cards_badge_letter",
  	"slots" jsonb
  );
  
  CREATE TABLE "pages_blocks_integration_grid_cards_locales" (
  	"content_body" varchar,
  	"content_meta" varchar,
  	"content_name" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_integration_grid_source_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"slots" jsonb
  );
  
  CREATE TABLE "pages_blocks_integration_grid_source_tags_locales" (
  	"content_text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_integration_grid_target_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"slots" jsonb
  );
  
  CREATE TABLE "pages_blocks_integration_grid_target_tags_locales" (
  	"content_text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_integration_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"alt" boolean,
  	"id_attr" varchar,
  	"dot_style" varchar,
  	"accent" "enum_pages_blocks_integration_grid_accent",
  	"bullet" varchar,
  	"section" varchar,
  	"lead" varchar,
  	"slots" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_integration_grid_locales" (
  	"content_body" varchar,
  	"content_eyebrow" varchar,
  	"content_heading" varchar,
  	"content_sync_source" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_q2c_board_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"href" "enum_pages_blocks_q2c_board_links_href",
  	"variant" "enum_pages_blocks_q2c_board_links_variant",
  	"large" boolean,
  	"slots" jsonb
  );
  
  CREATE TABLE "pages_blocks_q2c_board_links_locales" (
  	"content_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_q2c_board" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"section" varchar,
  	"lead" varchar,
  	"slots" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_q2c_board_locales" (
  	"content_div_142_active_subs_2" varchar,
  	"content_div_arr_active" varchar,
  	"content_div_billing" varchar,
  	"content_div_issued_14_may_2026" varchar,
  	"content_div_one_platform_atsuite" varchar,
  	"content_div_quote_q_2046" varchar,
  	"content_div_quoting" varchar,
  	"content_div_recognised" varchar,
  	"content_div_renewal_3_yr_ramp" varchar,
  	"content_div_revenue" varchar,
  	"content_div_subscription" varchar,
  	"content_div_usage" varchar,
  	"content_div_usage_voice_min" varchar,
  	"content_h2_one_system_for_the" varchar,
  	"content_p_replace_disconnected_t" varchar,
  	"content_span_approved" varchar,
  	"content_span_auto_billed" varchar,
  	"content_span_healthy" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_module_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"section" varchar,
  	"lead" varchar,
  	"slots" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_module_grid_locales" (
  	"content_a_billing_automation" varchar,
  	"content_a_configure_price_quote" varchar,
  	"content_a_process_optimisation" varchar,
  	"content_a_subscription_managemen" varchar,
  	"content_div_1_820_mo" varchar,
  	"content_div_348_skus" varchar,
  	"content_div_38_sec" varchar,
  	"content_div_atsuite_in_a_nutshell" varchar,
  	"content_div_catalog" varchar,
  	"content_div_price" varchar,
  	"content_div_quote" varchar,
  	"content_h2_four_modules_one_reven" varchar,
  	"content_h3_configure_price_and_qu" varchar,
  	"content_h3_enterprise_grade_billi" varchar,
  	"content_h3_event_driven_automatio" varchar,
  	"content_h3_manage_every_subscript" varchar,
  	"content_p_adopt_the_full_suite" varchar,
  	"content_p_an_always_on_process" varchar,
  	"content_p_an_intelligent_automat" varchar,
  	"content_p_full_control_over_plan" varchar,
  	"content_p_recurring_usage_based" varchar,
  	"content_span_01_subscription" varchar,
  	"content_span_02_cpq" varchar,
  	"content_span_03_billing" varchar,
  	"content_span_04_process" varchar,
  	"content_span_2_pending" varchar,
  	"content_span_3_to_review" varchar,
  	"content_span_active_subs" varchar,
  	"content_span_add_ons_attached" varchar,
  	"content_span_all_systems_normal" varchar,
  	"content_span_approval_queue" varchar,
  	"content_span_avg_completion" varchar,
  	"content_span_billed" varchar,
  	"content_span_exceptions" varchar,
  	"content_span_invoices_this_run" varchar,
  	"content_span_mediation_rate" varchar,
  	"content_span_net_retention" varchar,
  	"content_span_on_track" varchar,
  	"content_span_renewing_this_month" varchar,
  	"content_span_status" varchar,
  	"content_span_triggered_today" varchar,
  	"content_span_workflows_live" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_innovate_forecast_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"href" "enum_pages_blocks_innovate_forecast_links_href",
  	"variant" "enum_pages_blocks_innovate_forecast_links_variant",
  	"large" boolean,
  	"slots" jsonb
  );
  
  CREATE TABLE "pages_blocks_innovate_forecast_links_locales" (
  	"content_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_innovate_forecast" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"section" varchar,
  	"lead" varchar,
  	"slots" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_innovate_forecast_locales" (
  	"content_div_3_1_pts" varchar,
  	"content_div_arr" varchar,
  	"content_div_innovate" varchar,
  	"content_div_predictive_90d_horizon" varchar,
  	"content_div_renewals" varchar,
  	"content_div_revenue_forecast_q3" varchar,
  	"content_div_upsell" varchar,
  	"content_h2_unlock_your_earnings_p" varchar,
  	"content_li_advanced_cpq_billing_c" varchar,
  	"content_li_guided_selling_for_a" varchar,
  	"content_li_predictive_analytics_f" varchar,
  	"content_li_real_time_collaboratio" varchar,
  	"content_p_we_continuously_add_ca" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_value_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"section" varchar,
  	"lead" varchar,
  	"slots" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_value_grid_locales" (
  	"content_div_our_values" varchar,
  	"content_h2_what_drives_agree_tech" varchar,
  	"content_h3_accountability" varchar,
  	"content_h3_diversity" varchar,
  	"content_h3_innovation" varchar,
  	"content_h3_sustainability" varchar,
  	"content_p_always_evolving_the_pl" varchar,
  	"content_p_different_perspectives" varchar,
  	"content_p_innovation_accountabil" varchar,
  	"content_p_long_term_thinking_for" varchar,
  	"content_p_we_do_what_we" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_team_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"section" varchar,
  	"lead" varchar,
  	"slots" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_team_grid_locales" (
  	"content_div_ceo" varchar,
  	"content_div_cto" varchar,
  	"content_div_kb" varchar,
  	"content_div_kj" varchar,
  	"content_div_management_team" varchar,
  	"content_h2_meet_the_leaders_behin" varchar,
  	"content_h3_karina_buch" varchar,
  	"content_h3_kristian_jacobsen" varchar,
  	"content_p_20_years_in_software" varchar,
  	"content_p_senior_executive_with" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_board_grid_people" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image" "enum_pages_blocks_board_grid_people_image",
  	"slots" jsonb
  );
  
  CREATE TABLE "pages_blocks_board_grid_people_locales" (
  	"content_alt" varchar,
  	"content_bio" varchar,
  	"content_name" varchar,
  	"content_role" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_board_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"section" varchar,
  	"lead" varchar,
  	"slots" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_board_grid_locales" (
  	"content_eyebrow" varchar,
  	"content_heading" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_contact_form" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"section" varchar,
  	"lead" varchar,
  	"slots" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_contact_form_locales" (
  	"content_b_copenhagen_denmark" varchar,
  	"content_b_info_agree_tech_com" varchar,
  	"content_b_message_sent" varchar,
  	"content_b_mon_fri_09_00" varchar,
  	"content_b_please_note" varchar,
  	"content_button_send_message" varchar,
  	"content_div_agree_technologies_aps" varchar,
  	"content_div_use_this_form_for" varchar,
  	"content_div_we_only_reply_to" varchar,
  	"content_h2_copenhagen_built_for_e" varchar,
  	"content_label_business_email" varchar,
  	"content_label_company_name" varchar,
  	"content_label_country" varchar,
  	"content_label_first_name" varchar,
  	"content_label_i_consent_to_receive" varchar,
  	"content_label_i_m_interested_in" varchar,
  	"content_label_last_name" varchar,
  	"content_label_message" varchar,
  	"content_label_website" varchar,
  	"content_li_a_discovery_call" varchar,
  	"content_li_general_enquiries" varchar,
  	"content_li_requesting_a_demo" varchar,
  	"content_option_billing_automation" varchar,
  	"content_option_cpq" varchar,
  	"content_option_denmark" varchar,
  	"content_option_germany" varchar,
  	"content_option_netherlands" varchar,
  	"content_option_norway" varchar,
  	"content_option_other" varchar,
  	"content_option_process_optimisatio" varchar,
  	"content_option_sales" varchar,
  	"content_option_subscription_manage" varchar,
  	"content_option_sweden" varchar,
  	"content_option_the_full_atsuite" varchar,
  	"content_option_united_kingdom" varchar,
  	"content_p_a_european_revenue_pla" varchar,
  	"content_p_demo_sales_requests" varchar,
  	"content_p_european_hq_gdpr_nativ" varchar,
  	"content_p_reply_within_one_busin" varchar,
  	"content_p_we_ve_received_your_mes" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_cpq_rules" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"section" varchar,
  	"lead" varchar,
  	"slots" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_cpq_rules_locales" (
  	"content_b_deal_desk_marco_r" varchar,
  	"content_b_finance_karina_b" varchar,
  	"content_b_sales_manager_anna_l" varchar,
  	"content_div_approval_flow" varchar,
  	"content_div_approved_09_14" varchar,
  	"content_div_approved_11_02" varchar,
  	"content_div_awaiting_2h_sla" varchar,
  	"content_div_pending" varchar,
  	"content_div_quote_q_2046_206" varchar,
  	"content_div_the_transformative_pow" varchar,
  	"content_h2_free_your_sales_team" varchar,
  	"content_li_approval_routing_align" varchar,
  	"content_li_direct_hand_off_to" varchar,
  	"content_li_faster_more_consistent" varchar,
  	"content_p_atsuite_revolutionises" varchar,
  	"content_span_2_of_3" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_step_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"section" varchar,
  	"lead" varchar,
  	"slots" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_step_list_locales" (
  	"content_div_our_approach" varchar,
  	"content_h2_four_steps_one_outcome" varchar,
  	"content_h3_discovery_workshops" varchar,
  	"content_h3_implementation" varchar,
  	"content_h3_operations" varchar,
  	"content_h3_proof_of_concept" varchar,
  	"content_p_in_depth_workshops_to" varchar,
  	"content_p_ongoing_support_and_mo" varchar,
  	"content_p_our_team_works_closely" varchar,
  	"content_p_we_start_by_demonstrat" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_implementation_note" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"section" varchar,
  	"lead" varchar,
  	"slots" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_implementation_note_locales" (
  	"content_div_what_you_get" varchar,
  	"content_h2_a_partner_not_just" varchar,
  	"content_p_our_experts_assess_you" varchar,
  	"content_p_reduced_implementation" varchar,
  	"content_p_we_prioritise_ongoing" varchar,
  	"content_strong_measurable_outcomes" varchar,
  	"content_strong_seamless_transition_wi" varchar,
  	"content_strong_tailored_solution_desi" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_print_hero_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"href" "enum_pages_blocks_print_hero_links_href",
  	"variant" "enum_pages_blocks_print_hero_links_variant",
  	"large" boolean,
  	"arrow" boolean,
  	"slots" jsonb
  );
  
  CREATE TABLE "pages_blocks_print_hero_links_locales" (
  	"content_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_print_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"section" varchar,
  	"lead" varchar,
  	"slots" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_print_hero_locales" (
  	"content_b_6_years" varchar,
  	"content_b_built_in_eu" varchar,
  	"content_div_18_vs_last_year" varchar,
  	"content_div_2_4m_arr" varchar,
  	"content_div_approved" varchar,
  	"content_div_atsuite_quote_to_reven" varchar,
  	"content_div_billing_accuracy" varchar,
  	"content_div_dstny" varchar,
  	"content_div_edit_quote" varchar,
  	"content_div_forecast_accuracy" varchar,
  	"content_div_gdpr_native" varchar,
  	"content_div_in_production" varchar,
  	"content_div_ipvision" varchar,
  	"content_div_kontur_co" varchar,
  	"content_div_mvnx" varchar,
  	"content_div_nordix" varchar,
  	"content_div_northwind_telecom_rene" varchar,
  	"content_div_predictive_90d" varchar,
  	"content_div_quote_q_2046" varchar,
  	"content_div_renewal_auto" varchar,
  	"content_div_send_to_customer" varchar,
  	"content_div_telavox" varchar,
  	"content_div_trusted_by_leading_saa" varchar,
  	"content_h1_the_all_in_one" varchar,
  	"content_p_automate_the_entire_qu" varchar,
  	"content_span_add_on_recording_qa" varchar,
  	"content_span_annualised" varchar,
  	"content_span_multi_year_ramp_7" varchar,
  	"content_span_subscription_voice_pro" varchar,
  	"content_span_usage_international_es" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_print_quote" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"section" varchar,
  	"lead" varchar,
  	"slots" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_print_quote_locales" (
  	"content_blockquote_with_atsuite_we_have" varchar,
  	"content_div_average_net_revenue_re" varchar,
  	"content_div_average_quote_turnarou" varchar,
  	"content_div_billing_accuracy_in_pr" varchar,
  	"content_div_carsten_thomsen" varchar,
  	"content_div_ct" varchar,
  	"content_div_customer_dstny_a_s" varchar,
  	"content_div_operating_as_a_managed" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_home_hero_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"href" "enum_pages_blocks_home_hero_links_href",
  	"variant" "enum_pages_blocks_home_hero_links_variant",
  	"large" boolean,
  	"arrow" boolean,
  	"slots" jsonb
  );
  
  CREATE TABLE "pages_blocks_home_hero_links_locales" (
  	"content_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_home_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"section" varchar,
  	"lead" varchar,
  	"slots" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_home_hero_locales" (
  	"content_b_6_years" varchar,
  	"content_b_built_in_eu" varchar,
  	"content_b_faster" varchar,
  	"content_b_lower_acpu" varchar,
  	"content_b_predictive" varchar,
  	"content_b_real_time" varchar,
  	"content_b_reduced" varchar,
  	"content_div_18_vs_last_year" varchar,
  	"content_div_2_4m_arr" varchar,
  	"content_div_approved" varchar,
  	"content_div_atsuite_quote_to_reven" varchar,
  	"content_div_billing_accuracy" varchar,
  	"content_div_cash_flow" varchar,
  	"content_div_dstny" varchar,
  	"content_div_edit_quote" varchar,
  	"content_div_forecast_accuracy" varchar,
  	"content_div_gdpr_native" varchar,
  	"content_div_in_production" varchar,
  	"content_div_ipvision" varchar,
  	"content_div_northwind_telecom_rene" varchar,
  	"content_div_operational_risk" varchar,
  	"content_div_predictive_90d" varchar,
  	"content_div_profitability" varchar,
  	"content_div_quote_q_2046" varchar,
  	"content_div_renewal_auto" varchar,
  	"content_div_send_to_customer" varchar,
  	"content_div_telavox" varchar,
  	"content_div_through_automation" varchar,
  	"content_div_time_to_cash" varchar,
  	"content_div_trusted_by_leading_saa" varchar,
  	"content_h1_the_all_in_one" varchar,
  	"content_p_automate_the_entire_qu" varchar,
  	"content_span_add_on_recording_qa" varchar,
  	"content_span_annualised" varchar,
  	"content_span_multi_year_ramp_7" varchar,
  	"content_span_subscription_voice_pro" varchar,
  	"content_span_usage_international_es" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_cfo_dashboard" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"section" varchar,
  	"lead" varchar,
  	"slots" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_cfo_dashboard_locales" (
  	"content_b_3_1_pts" varchar,
  	"content_div_11_mom_142_active" varchar,
  	"content_div_18_4_yoy" varchar,
  	"content_div_2_1_pts_qoq" varchar,
  	"content_div_23_renewing_cpi_auto" varchar,
  	"content_div_8_461_events_minute" varchar,
  	"content_div_built_for_the_office" varchar,
  	"content_div_contribution" varchar,
  	"content_div_discount_performance" varchar,
  	"content_div_gross_margin" varchar,
  	"content_div_live_streaming" varchar,
  	"content_div_mrr_arr" varchar,
  	"content_div_qoq" varchar,
  	"content_div_quote_subscription_usa" varchar,
  	"content_div_real_time_revenue_visi" varchar,
  	"content_div_renewal_indexation" varchar,
  	"content_div_run_14_may_2026" varchar,
  	"content_div_subscription_usage" varchar,
  	"content_div_today_without_atsuite" varchar,
  	"content_div_vs_list_within_policy" varchar,
  	"content_div_with_atsuite" varchar,
  	"content_h2_eliminate_revenue_leak" varchar,
  	"content_h3_the_challenges_most_cf" varchar,
  	"content_h3_the_result_from_day" varchar,
  	"content_li_better_reporting_for_m" varchar,
  	"content_li_complex_subscription_a" varchar,
  	"content_li_improved_compliance_an" varchar,
  	"content_li_inconsistent_cash_flow" varchar,
  	"content_li_limited_confidence_in" varchar,
  	"content_li_lower_operational_cost" varchar,
  	"content_li_manual_billing_control" varchar,
  	"content_li_more_predictable_cash" varchar,
  	"content_li_near_perfect_invoice_a" varchar,
  	"content_li_no_real_time_visibilit" varchar,
  	"content_p_as_businesses_move_tow" varchar,
  	"content_p_atsuite_brings_cpq_sub" varchar,
  	"content_small_mo" varchar,
  	"content_span_usage_ingest" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_quote_carousel" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"section" varchar,
  	"lead" varchar,
  	"slots" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_quote_carousel_locales" (
  	"content_blockquote_before_atsuite_we_stru" varchar,
  	"content_blockquote_with_atsuite_we_have" varchar,
  	"content_div_average_net_revenue_re" varchar,
  	"content_div_billing_accuracy_acros" varchar,
  	"content_div_carsten_thomsen" varchar,
  	"content_div_ct" varchar,
  	"content_div_customer_cloudfarms" varchar,
  	"content_div_customer_dstny_a_s" varchar,
  	"content_div_global_operations_acro" varchar,
  	"content_div_in_production_at_dstny" varchar,
  	"content_div_jens_toppenberg" varchar,
  	"content_div_jt" varchar,
  	"content_div_lead_to_billing_fully" varchar,
  	"content_div_manual_handoffs_across" varchar,
  	"content_div_monthly_transactions_p" varchar,
  	"content_div_unified_platform_repla" varchar,
  	"content_small_ceo_cloudfarms" varchar,
  	"content_small_regions" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_quote_band" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"section" varchar,
  	"lead" varchar,
  	"slots" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_quote_band_locales" (
  	"content_blockquote_our_enduring_collabora" varchar,
  	"content_div_colin_russel_mvnx_dire" varchar,
  	"content_div_customer_telavox" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"label" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"media_id" integer,
  	"pages_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "page_index_meta" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "page_index_meta_locales" (
  	"title" varchar,
  	"description" varchar,
  	"og_title" varchar,
  	"og_description" varchar,
  	"twitter_title" varchar,
  	"twitter_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "page_index_hero" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "page_index_hero_locales" (
  	"div_atsuite_quote_to_reven" varchar,
  	"h1_the_all_in_one" varchar,
  	"p_automate_the_entire_qu" varchar,
  	"a_book_a_demo" varchar,
  	"a_explore_the_platform" varchar,
  	"div_quote_q_2046" varchar,
  	"div_northwind_telecom_rene" varchar,
  	"div_approved" varchar,
  	"span_subscription_voice_pro" varchar,
  	"span_add_on_recording_qa" varchar,
  	"span_usage_international_es" varchar,
  	"span_multi_year_ramp_7" varchar,
  	"span_annualised" varchar,
  	"div_send_to_customer" varchar,
  	"div_edit_quote" varchar,
  	"div_renewal_auto" varchar,
  	"div_2_4m_arr" varchar,
  	"div_18_vs_last_year" varchar,
  	"div_forecast_accuracy" varchar,
  	"div_predictive_90d" varchar,
  	"b_6_years" varchar,
  	"div_in_production" varchar,
  	"div_billing_accuracy" varchar,
  	"b_built_in_eu" varchar,
  	"div_gdpr_native" varchar,
  	"b_real_time" varchar,
  	"div_profitability" varchar,
  	"b_lower_acpu" varchar,
  	"div_through_automation" varchar,
  	"b_faster" varchar,
  	"div_time_to_cash" varchar,
  	"b_predictive" varchar,
  	"div_cash_flow" varchar,
  	"b_reduced" varchar,
  	"div_operational_risk" varchar,
  	"div_trusted_by_leading_saa" varchar,
  	"div_dstny" varchar,
  	"div_telavox" varchar,
  	"div_ipvision" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "page_index_q2c" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "page_index_q2c_locales" (
  	"div_one_platform_atsuite" varchar,
  	"h2_one_system_for_the" varchar,
  	"p_replace_disconnected_t" varchar,
  	"a_tour_the_platform" varchar,
  	"a_speak_to_an_expert" varchar,
  	"div_quoting" varchar,
  	"div_subscription" varchar,
  	"div_usage" varchar,
  	"div_billing" varchar,
  	"div_revenue" varchar,
  	"div_quote_q_2046" varchar,
  	"div_renewal_3_yr_ramp" varchar,
  	"span_approved" varchar,
  	"div_arr_active" varchar,
  	"div_142_active_subs_2" varchar,
  	"span_healthy" varchar,
  	"div_usage_voice_min" varchar,
  	"div_issued_14_may_2026" varchar,
  	"span_auto_billed" varchar,
  	"div_recognised" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "page_index_modules" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "page_index_modules_locales" (
  	"div_atsuite_in_a_nutshell" varchar,
  	"h2_four_modules_one_reven" varchar,
  	"p_adopt_the_full_suite" varchar,
  	"span_01_subscription" varchar,
  	"h3_manage_every_subscript" varchar,
  	"p_full_control_over_plan" varchar,
  	"span_active_subs" varchar,
  	"span_renewing_this_month" varchar,
  	"span_on_track" varchar,
  	"span_add_ons_attached" varchar,
  	"span_net_retention" varchar,
  	"a_subscription_managemen" varchar,
  	"span_02_cpq" varchar,
  	"h3_configure_price_and_qu" varchar,
  	"p_an_intelligent_automat" varchar,
  	"div_catalog" varchar,
  	"div_348_skus" varchar,
  	"div_price" varchar,
  	"div_1_820_mo" varchar,
  	"div_quote" varchar,
  	"div_38_sec" varchar,
  	"span_approval_queue" varchar,
  	"span_2_pending" varchar,
  	"a_configure_price_quote" varchar,
  	"span_03_billing" varchar,
  	"h3_enterprise_grade_billi" varchar,
  	"p_recurring_usage_based" varchar,
  	"span_invoices_this_run" varchar,
  	"span_billed" varchar,
  	"span_mediation_rate" varchar,
  	"span_exceptions" varchar,
  	"span_3_to_review" varchar,
  	"a_billing_automation" varchar,
  	"span_04_process" varchar,
  	"h3_event_driven_automatio" varchar,
  	"p_an_always_on_process" varchar,
  	"span_workflows_live" varchar,
  	"span_triggered_today" varchar,
  	"span_avg_completion" varchar,
  	"span_status" varchar,
  	"span_all_systems_normal" varchar,
  	"a_process_optimisation" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "page_index_cfo" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "page_index_cfo_locales" (
  	"div_built_for_the_office" varchar,
  	"h2_eliminate_revenue_leak" varchar,
  	"p_as_businesses_move_tow" varchar,
  	"p_atsuite_brings_cpq_sub" varchar,
  	"div_today_without_atsuite" varchar,
  	"h3_the_challenges_most_cf" varchar,
  	"li_inconsistent_cash_flow" varchar,
  	"li_manual_billing_control" varchar,
  	"li_limited_confidence_in" varchar,
  	"li_complex_subscription_a" varchar,
  	"li_no_real_time_visibilit" varchar,
  	"div_with_atsuite" varchar,
  	"h3_the_result_from_day" varchar,
  	"li_more_predictable_cash" varchar,
  	"li_near_perfect_invoice_a" varchar,
  	"li_lower_operational_cost" varchar,
  	"li_improved_compliance_an" varchar,
  	"li_better_reporting_for_m" varchar,
  	"div_real_time_revenue_visi" varchar,
  	"div_quote_subscription_usa" varchar,
  	"div_live_streaming" varchar,
  	"div_mrr_arr" varchar,
  	"div_18_4_yoy" varchar,
  	"div_gross_margin" varchar,
  	"div_2_1_pts_qoq" varchar,
  	"div_contribution" varchar,
  	"div_discount_performance" varchar,
  	"div_vs_list_within_policy" varchar,
  	"div_subscription_usage" varchar,
  	"small_mo" varchar,
  	"div_11_mom_142_active" varchar,
  	"div_renewal_indexation" varchar,
  	"div_23_renewing_cpi_auto" varchar,
  	"b_3_1_pts" varchar,
  	"div_qoq" varchar,
  	"span_usage_ingest" varchar,
  	"div_8_461_events_minute" varchar,
  	"div_run_14_may_2026" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "page_index_quote" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "page_index_quote_locales" (
  	"div_customer_dstny_a_s" varchar,
  	"blockquote_with_atsuite_we_have" varchar,
  	"div_ct" varchar,
  	"div_carsten_thomsen" varchar,
  	"div_billing_accuracy_acros" varchar,
  	"div_in_production_at_dstny" varchar,
  	"div_monthly_transactions_p" varchar,
  	"div_average_net_revenue_re" varchar,
  	"div_customer_cloudfarms" varchar,
  	"blockquote_before_atsuite_we_stru" varchar,
  	"div_jt" varchar,
  	"div_jens_toppenberg" varchar,
  	"small_ceo_cloudfarms" varchar,
  	"small_regions" varchar,
  	"div_global_operations_acro" varchar,
  	"div_unified_platform_repla" varchar,
  	"div_lead_to_billing_fully" varchar,
  	"div_manual_handoffs_across" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "page_index_innovate" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "page_index_innovate_locales" (
  	"div_innovate" varchar,
  	"h2_unlock_your_earnings_p" varchar,
  	"p_we_continuously_add_ca" varchar,
  	"li_advanced_cpq_billing_c" varchar,
  	"li_guided_selling_for_a" varchar,
  	"li_real_time_collaboratio" varchar,
  	"li_predictive_analytics_f" varchar,
  	"a_schedule_a_demo" varchar,
  	"a_see_the_platform" varchar,
  	"div_revenue_forecast_q3" varchar,
  	"div_predictive_90d_horizon" varchar,
  	"div_arr" varchar,
  	"div_renewals" varchar,
  	"div_3_1_pts" varchar,
  	"div_upsell" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "page_index_cta_band" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "page_index_cta_band_locales" (
  	"div_ready_when_you_are" varchar,
  	"h2_get_started_today_and" varchar,
  	"p_a_30_minute_discovery" varchar,
  	"a_book_a_demo" varchar,
  	"a_how_implementation_wor" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "page_platform_meta" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "page_platform_meta_locales" (
  	"title" varchar,
  	"description" varchar,
  	"og_title" varchar,
  	"og_description" varchar,
  	"twitter_title" varchar,
  	"twitter_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "page_platform_page_hero_dark" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "page_platform_page_hero_dark_locales" (
  	"div_the_atsuite_platform" varchar,
  	"h1_configure_launch_go" varchar,
  	"p_a_comprehensive_platfo" varchar,
  	"a_speak_to_an_expert" varchar,
  	"a_how_implementation_wor" varchar,
  	"div_presentation_apis" varchar,
  	"div_web_app" varchar,
  	"div_react_js" varchar,
  	"div_api_gateway" varchar,
  	"div_rest_spring_boot" varchar,
  	"div_atsuite_modules" varchar,
  	"div_cpq" varchar,
  	"div_configure" varchar,
  	"div_subscription" varchar,
  	"div_lifecycle" varchar,
  	"div_billing" varchar,
  	"div_monetise" varchar,
  	"div_process" varchar,
  	"div_orchestrate" varchar,
  	"div_shared_services" varchar,
  	"div_data_model" varchar,
  	"div_extensible" varchar,
  	"div_process_engine" varchar,
  	"div_event_driven" varchar,
  	"div_analytics" varchar,
  	"div_predictive" varchar,
  	"div_identity" varchar,
  	"div_sso" varchar,
  	"div_deployment" varchar,
  	"div_saas" varchar,
  	"div_multi_tenant" varchar,
  	"div_managed_service" varchar,
  	"div_eu_regions" varchar,
  	"div_on_premise" varchar,
  	"div_your_infrastructure" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "page_platform_integration" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "page_platform_integration_locales" (
  	"div_integration" varchar,
  	"h2_api_driven_by_design" varchar,
  	"p_being_api_driven_atsui" varchar,
  	"div_api_v3" varchar,
  	"div_rest_webhooks" varchar,
  	"span_99_99_uptime" varchar,
  	"div_works_with_your_stack" varchar,
  	"h3_talks_to_the_systems" varchar,
  	"p_pre_built_connectors_a" varchar,
  	"div_erp_finance" varchar,
  	"span_sap" varchar,
  	"span_oracle_netsuite" varchar,
  	"span_microsoft_dynamics_365" varchar,
  	"span_sage" varchar,
  	"span_xero" varchar,
  	"span_quickbooks" varchar,
  	"div_crm_sales" varchar,
  	"span_salesforce" varchar,
  	"span_hubspot" varchar,
  	"span_dynamics_365_sales" varchar,
  	"span_pipedrive" varchar,
  	"div_service_itsm" varchar,
  	"span_jira" varchar,
  	"span_servicenow" varchar,
  	"span_zendesk" varchar,
  	"span_freshdesk" varchar,
  	"div_identity_sso" varchar,
  	"span_okta" varchar,
  	"span_microsoft_entra_id" varchar,
  	"span_auth0" varchar,
  	"span_google_workspace" varchar,
  	"div_payments_banking" varchar,
  	"span_stripe" varchar,
  	"span_adyen" varchar,
  	"span_gocardless" varchar,
  	"span_sepa_direct_debit" varchar,
  	"div_data_bi" varchar,
  	"span_snowflake" varchar,
  	"span_power_bi" varchar,
  	"span_tableau" varchar,
  	"span_looker" varchar,
  	"p_anything_else_via_rest" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "page_platform_data_model" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "page_platform_data_model_locales" (
  	"div_extensible_data_model" varchar,
  	"h2_adaptable_to_diverse_b" varchar,
  	"p_a_highly_adaptable_dat" varchar,
  	"div_custom_entity_contract" varchar,
  	"span_uuid" varchar,
  	"span_months" varchar,
  	"span_schedule" varchar,
  	"span_tier" varchar,
  	"span_enum" varchar,
  	"span_str" varchar,
  	"div_2_custom_fields_added" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "page_platform_process" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "page_platform_process_locales" (
  	"div_process_engine" varchar,
  	"h2_built_in_automation_op" varchar,
  	"p_atsuite_s_process_engi" varchar,
  	"div_event" varchar,
  	"div_quote_signed" varchar,
  	"div_rule" varchar,
  	"div_if_amt_100k" varchar,
  	"div_action" varchar,
  	"div_provision_notify" varchar,
  	"span_42_active_workflows" varchar,
  	"span_8_461_runs_today" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "page_platform_analytics" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "page_platform_analytics_locales" (
  	"div_analytics" varchar,
  	"h2_insight_that_drives_de" varchar,
  	"p_the_analytics_module_e" varchar,
  	"div_renewal_forecast" varchar,
  	"div_94_predictive_accuracy" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "page_platform_deployment" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "page_platform_deployment_locales" (
  	"div_reliable_secure_deploy" varchar,
  	"h2_deploy_how_your_busine" varchar,
  	"p_unlike_most_modern_cpq" varchar,
  	"strong_saas" varchar,
  	"p_multi_tenant_cloud_con" varchar,
  	"strong_managed_as_a_service" varchar,
  	"p_we_host_monitor_and" varchar,
  	"strong_on_premise" varchar,
  	"p_deploy_atsuite_inside" varchar,
  	"strong_gdpr_native" varchar,
  	"p_data_residency_retenti" varchar,
  	"strong_sso" varchar,
  	"p_enterprise_identity_wi" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "page_platform_cta_band_dark" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "page_platform_cta_band_dark_locales" (
  	"div_innovate_with_agree_te" varchar,
  	"h2_continuous_innovation" varchar,
  	"p_cutting_edge_cloud_bas" varchar,
  	"a_talk_to_an_expert" varchar,
  	"a_how_implementation_wor" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "page_cpq_meta" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "page_cpq_meta_locales" (
  	"title" varchar,
  	"description" varchar,
  	"og_title" varchar,
  	"og_description" varchar,
  	"twitter_title" varchar,
  	"twitter_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "page_cpq_page_hero" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "page_cpq_page_hero_locales" (
  	"div_solutions_cpq" varchar,
  	"h1_quote_with_speed_confi" varchar,
  	"p_an_automated_cpq_that" varchar,
  	"a_schedule_a_demo" varchar,
  	"a_see_the_platform" varchar,
  	"div_northwind_telecom_fy26" varchar,
  	"div_quote_q_2046_draft" varchar,
  	"span_pending_approval" varchar,
  	"span_product" varchar,
  	"span_qty" varchar,
  	"span_disc" varchar,
  	"span_annual" varchar,
  	"span_voice_pro_per_seat" varchar,
  	"span_recording_qa" varchar,
  	"span_sms_usage_tier" varchar,
  	"span_80k_mo" varchar,
  	"span_tier_b" varchar,
  	"span_international_voice_es" varchar,
  	"span_1_4m_min" varchar,
  	"span_tier_a" varchar,
  	"span_annualised_multi_yr_ra" varchar,
  	"span_en" varchar,
  	"span_da" varchar,
  	"span_de" varchar,
  	"span_fr" varchar,
  	"span_nl" varchar,
  	"span_sv" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "page_cpq_split_section" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "page_cpq_split_section_locales" (
  	"div_cpq_capabilities" varchar,
  	"h2_everything_your_sales" varchar,
  	"div_01_catalog" varchar,
  	"h3_product_catalog" varchar,
  	"p_detailed_accurate_prod" varchar,
  	"div_02_pricing" varchar,
  	"h3_dynamic_pricing" varchar,
  	"p_adjust_pricing_ratings" varchar,
  	"div_03_turnaround" varchar,
  	"h3_fast_quote_turnaround" varchar,
  	"p_speed_up_quote_generat" varchar,
  	"div_04_efficiency" varchar,
  	"h3_increase_efficiency" varchar,
  	"p_automate_complex_prici" varchar,
  	"div_05_flexibility" varchar,
  	"h3_flexible_cpq" varchar,
  	"p_tailored_configuration" varchar,
  	"div_06_i18n" varchar,
  	"h3_multi_language" varchar,
  	"p_a_multilingual_product" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "page_cpq_split_section_alt" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "page_cpq_split_section_alt_locales" (
  	"div_the_transformative_pow" varchar,
  	"h2_free_your_sales_team" varchar,
  	"p_atsuite_revolutionises" varchar,
  	"li_faster_more_consistent" varchar,
  	"li_approval_routing_align" varchar,
  	"li_direct_hand_off_to" varchar,
  	"div_approval_flow" varchar,
  	"div_quote_q_2046_206" varchar,
  	"span_2_of_3" varchar,
  	"b_sales_manager_anna_l" varchar,
  	"div_approved_09_14" varchar,
  	"b_deal_desk_marco_r" varchar,
  	"div_approved_11_02" varchar,
  	"b_finance_karina_b" varchar,
  	"div_awaiting_2h_sla" varchar,
  	"div_pending" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "page_cpq_crm_integrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "page_cpq_crm_integrations_locales" (
  	"div_integrations_crm" varchar,
  	"h2_quote_from_the_crm" varchar,
  	"p_atsuite_cpq_plugs_bi" varchar,
  	"li_two_way_sync_of" varchar,
  	"li_generate_atsuite_quote" varchar,
  	"li_closed_won_deals_hand" varchar,
  	"li_pre_built_connectors_p" varchar,
  	"div_hubspot" varchar,
  	"div_crm_sales_hub" varchar,
  	"p_sync_deals_companies_a" varchar,
  	"div_pipedrive" varchar,
  	"div_crm_pipeline" varchar,
  	"p_mirror_pipeline_stages" varchar,
  	"div_salesforce" varchar,
  	"div_crm_sales_cloud" varchar,
  	"p_native_object_mapping" varchar,
  	"div_microsoft_dynamics_365" varchar,
  	"div_crm_sales" varchar,
  	"p_bi_directional_sync_wi" varchar,
  	"div_crm" varchar,
  	"span_accounts" varchar,
  	"span_contacts" varchar,
  	"span_opportunities" varchar,
  	"span_quotes" varchar,
  	"span_orders" varchar,
  	"span_subscriptions" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "page_cpq_cta_band_dark" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "page_cpq_cta_band_dark_locales" (
  	"div_ready_to_quote_faster" varchar,
  	"h2_see_atsuite_cpq_in" varchar,
  	"p_30_minute_discovery_we" varchar,
  	"a_schedule_a_demo" varchar,
  	"a_back_to_overview" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "page_billing_meta" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "page_billing_meta_locales" (
  	"title" varchar,
  	"description" varchar,
  	"og_title" varchar,
  	"og_description" varchar,
  	"twitter_title" varchar,
  	"twitter_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "page_billing_page_hero_dark" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "page_billing_page_hero_dark_locales" (
  	"div_solutions_billing_auto" varchar,
  	"h1_modern_billing_for_the" varchar,
  	"p_a_flexible_enterprise" varchar,
  	"a_schedule_a_demo" varchar,
  	"a_see_the_platform" varchar,
  	"div_bill_run_may_2026" varchar,
  	"div_cycle_05_1_284" varchar,
  	"span_99_98_mediated" varchar,
  	"div_billed" varchar,
  	"div_invoices" varchar,
  	"div_exceptions" varchar,
  	"div_northwind_telecom" varchar,
  	"small_recurring_monthly" varchar,
  	"span_issued" varchar,
  	"div_telavox_nordics" varchar,
  	"small_usage_based_voice" varchar,
  	"span_issued_2" varchar,
  	"div_kontur_co" varchar,
  	"small_tiered_mid_cycle_cha" varchar,
  	"span_qa_review" varchar,
  	"div_ipvision_aps" varchar,
  	"small_agreement_proration" varchar,
  	"span_issued_3" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "page_billing_split_section" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "page_billing_split_section_locales" (
  	"div_billing_capabilities" varchar,
  	"h2_discover_the_billing_c" varchar,
  	"div_models" varchar,
  	"h3_flexible_billing_model" varchar,
  	"p_usage_based_tiered_one" varchar,
  	"div_usage" varchar,
  	"h3_real_time_usage_collec" varchar,
  	"p_track_usage_from_cdrs" varchar,
  	"div_invoicing" varchar,
  	"h3_advanced_invoicing" varchar,
  	"p_periodic_one_time_or" varchar,
  	"div_accounts" varchar,
  	"h3_account_management" varchar,
  	"p_a_360_view_of" varchar,
  	"div_rules" varchar,
  	"h3_rules_automation" varchar,
  	"p_automate_upgrades_bill" varchar,
  	"div_quality" varchar,
  	"h3_quality_assurance" varchar,
  	"p_a_daily_shadow_billing" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "page_billing_split_section_alt" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "page_billing_split_section_alt_locales" (
  	"div_your_data_is_safe" varchar,
  	"h2_we_take_your_billing" varchar,
  	"p_our_platform_is_equipp" varchar,
  	"p_compliant_with_major_d" varchar,
  	"strong_ssl_encryption" varchar,
  	"p_end_to_end_encryption" varchar,
  	"strong_gdpr_ccpa" varchar,
  	"p_compliant_with_the_maj" varchar,
  	"strong_2_factor_auth" varchar,
  	"p_additional_layer_of_au" varchar,
  	"strong_daily_backups" varchar,
  	"p_regular_encrypted_back" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "page_billing_cta_band_dark" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "page_billing_cta_band_dark_locales" (
  	"div_ready_for_a_billing" varchar,
  	"h2_modernise_your_billing" varchar,
  	"p_walk_through_a_real" varchar,
  	"a_book_a_demo" varchar,
  	"a_back_to_overview" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "page_subscription_meta" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "page_subscription_meta_locales" (
  	"title" varchar,
  	"description" varchar,
  	"og_title" varchar,
  	"og_description" varchar,
  	"twitter_title" varchar,
  	"twitter_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "page_subscription_page_hero" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "page_subscription_page_hero_locales" (
  	"div_solutions_subscription" varchar,
  	"h1_streamline_every_subsc" varchar,
  	"p_atsuite_subscription_g" varchar,
  	"a_schedule_a_demo" varchar,
  	"a_see_the_platform" varchar,
  	"div_active_subscriptions" varchar,
  	"div_142_accounts_23_renewi" varchar,
  	"div_2_4m_arr" varchar,
  	"span_customer" varchar,
  	"span_plan" varchar,
  	"span_usage" varchar,
  	"span_status" varchar,
  	"div_northwind_telecom" varchar,
  	"small_1_200_seats" varchar,
  	"div_voice_pro" varchar,
  	"span_active" varchar,
  	"div_telavox_nordics" varchar,
  	"small_800_seats" varchar,
  	"div_enterprise" varchar,
  	"span_renewing" varchar,
  	"div_kontur_co" varchar,
  	"small_240_seats" varchar,
  	"div_standard" varchar,
  	"span_upsell" varchar,
  	"div_ipvision_aps" varchar,
  	"small_140_seats" varchar,
  	"div_voice_lite" varchar,
  	"span_paused" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "page_subscription_split_section_alt" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "page_subscription_split_section_alt_locales" (
  	"div_customer_telavox" varchar,
  	"blockquote_our_enduring_collabora" varchar,
  	"div_colin_russel_mvnx_dire" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "page_subscription_split_section" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "page_subscription_split_section_locales" (
  	"div_subscription_capabilit" varchar,
  	"h2_built_for_the_entire" varchar,
  	"div_plan_package" varchar,
  	"h3_plan_and_package_manag" varchar,
  	"p_customizable_plans_add" varchar,
  	"div_provisioning" varchar,
  	"h3_activation_provisionin" varchar,
  	"p_simplified_onboarding" varchar,
  	"div_usage" varchar,
  	"h3_usage_tracking_reporti" varchar,
  	"p_real_time_monitoring_a" varchar,
  	"div_lifecycle" varchar,
  	"h3_renewals_lifecycle" varchar,
  	"p_automated_reminders_an" varchar,
  	"div_billing" varchar,
  	"h3_cycles_invoicing" varchar,
  	"p_recurring_billing_on_a" varchar,
  	"div_analytics" varchar,
  	"h3_advanced_analytics" varchar,
  	"p_customer_behaviour_ins" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "page_subscription_cta_band_dark" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "page_subscription_cta_band_dark_locales" (
  	"div_your_benefits_today_an" varchar,
  	"h2_elevate_operations_fin" varchar,
  	"p_an_indispensable_tool" varchar,
  	"a_contact_us" varchar,
  	"a_back_to_overview" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "page_process_meta" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "page_process_meta_locales" (
  	"title" varchar,
  	"description" varchar,
  	"og_title" varchar,
  	"og_description" varchar,
  	"twitter_title" varchar,
  	"twitter_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "page_process_page_hero" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "page_process_page_hero_locales" (
  	"div_solutions_process_opti" varchar,
  	"h1_eliminate_manual_work" varchar,
  	"p_atsuite_automates_manu" varchar,
  	"a_schedule_a_demo" varchar,
  	"a_see_the_platform" varchar,
  	"b_quote_signed" varchar,
  	"small_event_cpq" varchar,
  	"b_provision_service" varchar,
  	"small_workflow_0_8s" varchar,
  	"b_generate_invoice" varchar,
  	"small_billing_day_1" varchar,
  	"b_notify_crm" varchar,
  	"small_api_hubspot" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "page_process_split_section" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "page_process_split_section_locales" (
  	"div_process_capabilities" varchar,
  	"h2_discover_the_process_m" varchar,
  	"div_workflows" varchar,
  	"h3_create_workflows" varchar,
  	"p_use_the_process_tool" varchar,
  	"div_integration" varchar,
  	"h3_seamless_integration" varchar,
  	"p_connect_systems_and_ap" varchar,
  	"div_events" varchar,
  	"h3_become_event_driven" varchar,
  	"p_let_well_defined_event" varchar,
  	"div_efficiency" varchar,
  	"h3_increase_efficiency" varchar,
  	"p_stop_wasting_time_on" varchar,
  	"div_scale" varchar,
  	"h3_scale_your_business" varchar,
  	"p_automation_of_daily_ta" varchar,
  	"div_control" varchar,
  	"h3_be_in_control" varchar,
  	"p_the_atsuite_process_en" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "page_process_cta_band_dark" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "page_process_cta_band_dark_locales" (
  	"div_operational_efficiency" varchar,
  	"h2_streamline_processes_r" varchar,
  	"p_by_leveraging_atsuite" varchar,
  	"a_schedule_a_demo" varchar,
  	"a_back_to_overview" varchar,
  	"label_390705a7" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "page_sales_meta" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "page_sales_meta_locales" (
  	"title" varchar,
  	"description" varchar,
  	"og_title" varchar,
  	"og_description" varchar,
  	"twitter_title" varchar,
  	"twitter_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "page_sales_page_hero" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "page_sales_page_hero_locales" (
  	"div_solutions_sales" varchar,
  	"h1_grow_your_business_wit" varchar,
  	"p_atsuite_automates_time" varchar,
  	"a_request_a_demo" varchar,
  	"a_see_cpq" varchar,
  	"div_pipeline_this_quarter" varchar,
  	"div_42_opportunities_1_84m" varchar,
  	"b_lead" varchar,
  	"b_qualified" varchar,
  	"b_proposal" varchar,
  	"b_closing" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "page_sales_split_section" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "page_sales_split_section_locales" (
  	"div_sales_capabilities" varchar,
  	"h2_discover_our_sales_fea" varchar,
  	"div_pipeline" varchar,
  	"h3_pipeline_management" varchar,
  	"p_opportunities_link_to" varchar,
  	"div_process" varchar,
  	"h3_customizable_sales_pro" varchar,
  	"p_match_the_sales_path" varchar,
  	"div_activity" varchar,
  	"h3_sales_activity_recordi" varchar,
  	"p_record_tasks_events_ca" varchar,
  	"div_playbook" varchar,
  	"h3_sales_playbook" varchar,
  	"p_online_playbooks_guide" varchar,
  	"div_quotes" varchar,
  	"h3_quotes" varchar,
  	"p_create_quotes_automati" varchar,
  	"div_approval" varchar,
  	"h3_internal_review_approv" varchar,
  	"p_quotes_route_to_the" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "page_sales_crm_integrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "page_sales_crm_integrations_locales" (
  	"div_integrations_crm" varchar,
  	"h2_works_with_the_crm" varchar,
  	"p_atsuite_connects_bi_di" varchar,
  	"li_two_way_sync_of" varchar,
  	"li_quotes_generated_in_at" varchar,
  	"li_closed_won_deals_trigg" varchar,
  	"li_pre_built_connectors_p" varchar,
  	"div_hubspot" varchar,
  	"div_crm_sales_hub" varchar,
  	"p_sync_deals_companies_a" varchar,
  	"div_pipedrive" varchar,
  	"div_crm_pipeline" varchar,
  	"p_mirror_pipeline_stages" varchar,
  	"div_salesforce" varchar,
  	"div_crm_sales_cloud" varchar,
  	"p_native_object_mapping" varchar,
  	"div_microsoft_dynamics_365" varchar,
  	"div_crm_sales" varchar,
  	"p_bi_directional_sync_wi" varchar,
  	"div_crm" varchar,
  	"span_accounts" varchar,
  	"span_contacts" varchar,
  	"span_opportunities" varchar,
  	"span_quotes" varchar,
  	"span_orders" varchar,
  	"span_subscriptions" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "page_sales_cta_band_dark" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "page_sales_cta_band_dark_locales" (
  	"div_ready_to_ignite_a" varchar,
  	"h2_streamline_workflows_b" varchar,
  	"a_schedule_a_demo" varchar,
  	"a_back_to_overview" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "page_implementation_meta" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "page_implementation_meta_locales" (
  	"title" varchar,
  	"description" varchar,
  	"og_title" varchar,
  	"og_description" varchar,
  	"twitter_title" varchar,
  	"twitter_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "page_implementation_page_hero" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "page_implementation_page_hero_locales" (
  	"div_implementation" varchar,
  	"h1_seamless_transition_ze" varchar,
  	"p_implementing_a_new_cpq" varchar,
  	"a_schedule_a_call" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "page_implementation_split_section" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "page_implementation_split_section_locales" (
  	"div_our_approach" varchar,
  	"h2_four_steps_one_outcome" varchar,
  	"h3_proof_of_concept" varchar,
  	"p_we_start_by_demonstrat" varchar,
  	"h3_discovery_workshops" varchar,
  	"p_in_depth_workshops_to" varchar,
  	"h3_implementation" varchar,
  	"p_our_team_works_closely" varchar,
  	"h3_operations" varchar,
  	"p_ongoing_support_and_mo" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "page_implementation_split_section_alt" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "page_implementation_split_section_alt_locales" (
  	"div_what_you_get" varchar,
  	"h2_a_partner_not_just" varchar,
  	"strong_tailored_solution_desi" varchar,
  	"p_our_experts_assess_you" varchar,
  	"strong_seamless_transition_wi" varchar,
  	"p_we_prioritise_ongoing" varchar,
  	"strong_measurable_outcomes" varchar,
  	"p_reduced_implementation" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "page_implementation_cta_band_dark" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "page_implementation_cta_band_dark_locales" (
  	"div_ready_when_you_are" varchar,
  	"h2_get_started_today" varchar,
  	"p_a_30_minute_conversati" varchar,
  	"a_schedule_a_call" varchar,
  	"a_see_the_platform" varchar,
  	"label_824a9fbc" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "page_about_meta" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "page_about_meta_locales" (
  	"title" varchar,
  	"description" varchar,
  	"og_title" varchar,
  	"og_description" varchar,
  	"twitter_title" varchar,
  	"twitter_description" varchar,
  	"alt" varchar,
  	"alt_2" varchar,
  	"alt_3" varchar,
  	"alt_4" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "page_about_page_hero" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "page_about_page_hero_locales" (
  	"div_our_journey" varchar,
  	"h1_built_from_a_real" varchar,
  	"p_it_began_with_the" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "page_about_split_section" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "page_about_split_section_locales" (
  	"div_our_values" varchar,
  	"h2_what_drives_agree_tech" varchar,
  	"p_innovation_accountabil" varchar,
  	"h3_innovation" varchar,
  	"p_always_evolving_the_pl" varchar,
  	"h3_accountability" varchar,
  	"p_we_do_what_we" varchar,
  	"h3_diversity" varchar,
  	"p_different_perspectives" varchar,
  	"h3_sustainability" varchar,
  	"p_long_term_thinking_for" varchar,
  	"div_board_of_directors" varchar,
  	"h2_meet_the_board" varchar,
  	"div_chairman_of_the_board" varchar,
  	"h4_kenneth_andreasen" varchar,
  	"p_seasoned_executive_and" varchar,
  	"div_board_member" varchar,
  	"h4_peter_reich" varchar,
  	"p_seasoned_executive_and_2" varchar,
  	"div_board_member_cto" varchar,
  	"h4_kristian_hvid_jakobsen" varchar,
  	"p_cto_and_investor_at" varchar,
  	"div_board_member_ceo" varchar,
  	"h4_karina_buch" varchar,
  	"p_ceo_and_investor_at" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "page_about_split_section_alt" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "page_about_split_section_alt_locales" (
  	"div_management_team" varchar,
  	"h2_meet_the_leaders_behin" varchar,
  	"div_kb" varchar,
  	"div_ceo" varchar,
  	"h3_karina_buch" varchar,
  	"p_senior_executive_with" varchar,
  	"div_kj" varchar,
  	"div_cto" varchar,
  	"h3_kristian_jacobsen" varchar,
  	"p_20_years_in_software" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "page_about_cta_band_dark" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "page_about_cta_band_dark_locales" (
  	"div_book_a_meeting" varchar,
  	"h2_it_can_start_with" varchar,
  	"p_whether_you_need_sales" varchar,
  	"a_contact_me" varchar,
  	"a_see_the_platform" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "page_contact_meta" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "page_contact_meta_locales" (
  	"title" varchar,
  	"description" varchar,
  	"og_title" varchar,
  	"og_description" varchar,
  	"twitter_title" varchar,
  	"twitter_description" varchar,
  	"first_name" varchar,
  	"last_name" varchar,
  	"email" varchar,
  	"company" varchar,
  	"website" varchar,
  	"message" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "page_contact_page_hero" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "page_contact_page_hero_locales" (
  	"div_thank_you_for_your" varchar,
  	"h1_contact_us" varchar,
  	"p_tell_us_a_bit" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "page_contact_split_section" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "page_contact_split_section_locales" (
  	"b_please_note" varchar,
  	"div_we_only_reply_to" varchar,
  	"b_message_sent" varchar,
  	"p_we_ve_received_your_mes" varchar,
  	"label_first_name" varchar,
  	"label_last_name" varchar,
  	"label_business_email" varchar,
  	"label_company_name" varchar,
  	"label_website" varchar,
  	"label_country" varchar,
  	"option_denmark" varchar,
  	"option_sweden" varchar,
  	"option_norway" varchar,
  	"option_germany" varchar,
  	"option_netherlands" varchar,
  	"option_united_kingdom" varchar,
  	"option_other" varchar,
  	"label_i_m_interested_in" varchar,
  	"option_the_full_atsuite" varchar,
  	"option_cpq" varchar,
  	"option_billing_automation" varchar,
  	"option_subscription_manage" varchar,
  	"option_process_optimisatio" varchar,
  	"option_sales" varchar,
  	"label_message" varchar,
  	"label_i_consent_to_receive" varchar,
  	"button_send_message" varchar,
  	"div_agree_technologies_aps" varchar,
  	"h2_copenhagen_built_for_e" varchar,
  	"p_a_european_revenue_pla" varchar,
  	"b_info_agree_tech_com" varchar,
  	"p_demo_sales_requests" varchar,
  	"b_copenhagen_denmark" varchar,
  	"p_european_hq_gdpr_nativ" varchar,
  	"b_mon_fri_09_00" varchar,
  	"p_reply_within_one_busin" varchar,
  	"div_use_this_form_for" varchar,
  	"li_a_discovery_call" varchar,
  	"li_requesting_a_demo" varchar,
  	"li_general_enquiries" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "page_nav_meta" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "page_nav_meta_locales" (
  	"aria_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "page_nav_main" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "page_nav_main_locales" (
  	"div_solutions" varchar,
  	"a_platform" varchar,
  	"a_implementation" varchar,
  	"a_about_us" varchar,
  	"a_talk_to_an_expert" varchar,
  	"a_book_a_demo" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "page_nav_mm_solutions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "page_nav_mm_solutions_locales" (
  	"div_cpq" varchar,
  	"div_configure_price_and_qu" varchar,
  	"div_subscription_managemen" varchar,
  	"div_lifecycle_renewals_and" varchar,
  	"div_billing_automation" varchar,
  	"div_flexible_monetization" varchar,
  	"div_process_optimisation" varchar,
  	"div_event_driven_workflow" varchar,
  	"div_sales" varchar,
  	"div_pipeline_playbooks_and" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "page_foot_main" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "page_foot_main_locales" (
  	"p_a_european_revenue_pla" varchar,
  	"h4_platform" varchar,
  	"a_introduction" varchar,
  	"a_integration" varchar,
  	"a_extensible_model" varchar,
  	"a_process_engine" varchar,
  	"a_analytics" varchar,
  	"a_secure_reliable" varchar,
  	"h4_solutions" varchar,
  	"a_sales" varchar,
  	"a_cpq" varchar,
  	"a_billing" varchar,
  	"a_subscription" varchar,
  	"a_process_optimisation" varchar,
  	"h4_company" varchar,
  	"a_about" varchar,
  	"a_implementation" varchar,
  	"a_contact" varchar,
  	"div_2026_agree_technologie" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "page_jsonld_org" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "page_jsonld_org_locales" (
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "page_index_print_meta" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "page_index_print_meta_locales" (
  	"title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "page_index_print_hero" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "page_index_print_hero_locales" (
  	"div_atsuite_quote_to_reven" varchar,
  	"h1_the_all_in_one" varchar,
  	"p_automate_the_entire_qu" varchar,
  	"a_book_a_demo" varchar,
  	"a_explore_the_platform" varchar,
  	"b_6_years" varchar,
  	"div_in_production" varchar,
  	"div_billing_accuracy" varchar,
  	"b_built_in_eu" varchar,
  	"div_gdpr_native" varchar,
  	"div_quote_q_2046" varchar,
  	"div_northwind_telecom_rene" varchar,
  	"div_approved" varchar,
  	"span_subscription_voice_pro" varchar,
  	"span_add_on_recording_qa" varchar,
  	"span_usage_international_es" varchar,
  	"span_multi_year_ramp_7" varchar,
  	"span_annualised" varchar,
  	"div_send_to_customer" varchar,
  	"div_edit_quote" varchar,
  	"div_renewal_auto" varchar,
  	"div_2_4m_arr" varchar,
  	"div_18_vs_last_year" varchar,
  	"div_forecast_accuracy" varchar,
  	"div_predictive_90d" varchar,
  	"div_trusted_by_leading_saa" varchar,
  	"div_dstny" varchar,
  	"div_telavox" varchar,
  	"div_mvnx" varchar,
  	"div_ipvision" varchar,
  	"div_nordix" varchar,
  	"div_kontur_co" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "page_index_print_q2c" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "page_index_print_q2c_locales" (
  	"div_one_platform_atsuite" varchar,
  	"h2_one_system_for_the" varchar,
  	"p_replace_disconnected_t" varchar,
  	"a_tour_the_platform" varchar,
  	"a_speak_to_an_expert" varchar,
  	"div_quoting" varchar,
  	"div_subscription" varchar,
  	"div_usage" varchar,
  	"div_billing" varchar,
  	"div_revenue" varchar,
  	"div_quote_q_2046" varchar,
  	"div_renewal_3_yr_ramp" varchar,
  	"span_approved" varchar,
  	"div_arr_active" varchar,
  	"div_142_active_subs_2" varchar,
  	"span_healthy" varchar,
  	"div_usage_voice_min" varchar,
  	"div_issued_14_may_2026" varchar,
  	"span_auto_billed" varchar,
  	"div_recognised" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "page_index_print_modules" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "page_index_print_modules_locales" (
  	"div_atsuite_in_a_nutshell" varchar,
  	"h2_four_modules_one_reven" varchar,
  	"p_adopt_the_full_suite" varchar,
  	"span_01_subscription" varchar,
  	"h3_manage_every_subscript" varchar,
  	"p_full_control_over_plan" varchar,
  	"span_active_subs" varchar,
  	"span_renewing_this_month" varchar,
  	"span_on_track" varchar,
  	"span_add_ons_attached" varchar,
  	"span_net_retention" varchar,
  	"a_subscription_managemen" varchar,
  	"span_02_cpq" varchar,
  	"h3_configure_price_and_qu" varchar,
  	"p_an_intelligent_automat" varchar,
  	"div_catalog" varchar,
  	"div_348_skus" varchar,
  	"div_price" varchar,
  	"div_1_820_mo" varchar,
  	"div_quote" varchar,
  	"div_38_sec" varchar,
  	"span_approval_queue" varchar,
  	"span_2_pending" varchar,
  	"a_configure_price_quote" varchar,
  	"span_03_billing" varchar,
  	"h3_enterprise_grade_billi" varchar,
  	"p_recurring_usage_based" varchar,
  	"span_invoices_this_run" varchar,
  	"span_billed" varchar,
  	"span_mediation_rate" varchar,
  	"span_exceptions" varchar,
  	"span_3_to_review" varchar,
  	"a_billing_automation" varchar,
  	"span_04_process" varchar,
  	"h3_event_driven_automatio" varchar,
  	"p_an_always_on_process" varchar,
  	"span_workflows_live" varchar,
  	"span_triggered_today" varchar,
  	"span_avg_completion" varchar,
  	"span_status" varchar,
  	"span_all_systems_normal" varchar,
  	"a_process_optimisation" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "page_index_print_quote" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "page_index_print_quote_locales" (
  	"div_customer_dstny_a_s" varchar,
  	"blockquote_with_atsuite_we_have" varchar,
  	"div_ct" varchar,
  	"div_carsten_thomsen" varchar,
  	"div_billing_accuracy_in_pr" varchar,
  	"div_operating_as_a_managed" varchar,
  	"div_average_quote_turnarou" varchar,
  	"div_average_net_revenue_re" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "page_index_print_innovate" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "page_index_print_innovate_locales" (
  	"div_innovate" varchar,
  	"h2_unlock_your_earnings_p" varchar,
  	"p_we_continuously_add_ca" varchar,
  	"li_advanced_cpq_billing_c" varchar,
  	"li_guided_selling_for_a" varchar,
  	"li_real_time_collaboratio" varchar,
  	"li_predictive_analytics_f" varchar,
  	"a_schedule_a_demo" varchar,
  	"a_see_the_platform" varchar,
  	"div_revenue_forecast_q3" varchar,
  	"div_predictive_90d_horizon" varchar,
  	"div_arr" varchar,
  	"div_renewals" varchar,
  	"div_3_1_pts" varchar,
  	"div_upsell" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "page_index_print_cta_band" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "page_index_print_cta_band_locales" (
  	"div_ready_when_you_are" varchar,
  	"h2_get_started_today_and" varchar,
  	"p_a_30_minute_discovery" varchar,
  	"a_book_a_demo" varchar,
  	"a_how_implementation_wor" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_locales" ADD CONSTRAINT "media_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cta_band_links" ADD CONSTRAINT "pages_blocks_cta_band_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_cta_band"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cta_band_links_locales" ADD CONSTRAINT "pages_blocks_cta_band_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_cta_band_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cta_band" ADD CONSTRAINT "pages_blocks_cta_band_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cta_band_locales" ADD CONSTRAINT "pages_blocks_cta_band_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_cta_band"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_page_hero_split_links" ADD CONSTRAINT "pages_blocks_page_hero_split_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_page_hero_split"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_page_hero_split_links_locales" ADD CONSTRAINT "pages_blocks_page_hero_split_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_page_hero_split_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_page_hero_split" ADD CONSTRAINT "pages_blocks_page_hero_split_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_page_hero_split_locales" ADD CONSTRAINT "pages_blocks_page_hero_split_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_page_hero_split"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_split_prose_paragraphs" ADD CONSTRAINT "pages_blocks_split_prose_paragraphs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_split_prose"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_split_prose_paragraphs_locales" ADD CONSTRAINT "pages_blocks_split_prose_paragraphs_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_split_prose_paragraphs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_split_prose" ADD CONSTRAINT "pages_blocks_split_prose_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_split_prose_locales" ADD CONSTRAINT "pages_blocks_split_prose_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_split_prose"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_feature_grid_cards" ADD CONSTRAINT "pages_blocks_feature_grid_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_feature_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_feature_grid_cards_locales" ADD CONSTRAINT "pages_blocks_feature_grid_cards_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_feature_grid_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_feature_grid" ADD CONSTRAINT "pages_blocks_feature_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_feature_grid_locales" ADD CONSTRAINT "pages_blocks_feature_grid_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_feature_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_page_hero_links" ADD CONSTRAINT "pages_blocks_page_hero_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_page_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_page_hero_links_locales" ADD CONSTRAINT "pages_blocks_page_hero_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_page_hero_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_page_hero" ADD CONSTRAINT "pages_blocks_page_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_page_hero_locales" ADD CONSTRAINT "pages_blocks_page_hero_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_page_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_integration_grid_bullets" ADD CONSTRAINT "pages_blocks_integration_grid_bullets_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_integration_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_integration_grid_bullets_locales" ADD CONSTRAINT "pages_blocks_integration_grid_bullets_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_integration_grid_bullets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_integration_grid_cards" ADD CONSTRAINT "pages_blocks_integration_grid_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_integration_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_integration_grid_cards_locales" ADD CONSTRAINT "pages_blocks_integration_grid_cards_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_integration_grid_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_integration_grid_source_tags" ADD CONSTRAINT "pages_blocks_integration_grid_source_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_integration_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_integration_grid_source_tags_locales" ADD CONSTRAINT "pages_blocks_integration_grid_source_tags_locales_parent__fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_integration_grid_source_tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_integration_grid_target_tags" ADD CONSTRAINT "pages_blocks_integration_grid_target_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_integration_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_integration_grid_target_tags_locales" ADD CONSTRAINT "pages_blocks_integration_grid_target_tags_locales_parent__fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_integration_grid_target_tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_integration_grid" ADD CONSTRAINT "pages_blocks_integration_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_integration_grid_locales" ADD CONSTRAINT "pages_blocks_integration_grid_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_integration_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_q2c_board_links" ADD CONSTRAINT "pages_blocks_q2c_board_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_q2c_board"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_q2c_board_links_locales" ADD CONSTRAINT "pages_blocks_q2c_board_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_q2c_board_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_q2c_board" ADD CONSTRAINT "pages_blocks_q2c_board_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_q2c_board_locales" ADD CONSTRAINT "pages_blocks_q2c_board_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_q2c_board"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_module_grid" ADD CONSTRAINT "pages_blocks_module_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_module_grid_locales" ADD CONSTRAINT "pages_blocks_module_grid_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_module_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_innovate_forecast_links" ADD CONSTRAINT "pages_blocks_innovate_forecast_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_innovate_forecast"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_innovate_forecast_links_locales" ADD CONSTRAINT "pages_blocks_innovate_forecast_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_innovate_forecast_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_innovate_forecast" ADD CONSTRAINT "pages_blocks_innovate_forecast_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_innovate_forecast_locales" ADD CONSTRAINT "pages_blocks_innovate_forecast_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_innovate_forecast"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_value_grid" ADD CONSTRAINT "pages_blocks_value_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_value_grid_locales" ADD CONSTRAINT "pages_blocks_value_grid_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_value_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_team_grid" ADD CONSTRAINT "pages_blocks_team_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_team_grid_locales" ADD CONSTRAINT "pages_blocks_team_grid_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_team_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_board_grid_people" ADD CONSTRAINT "pages_blocks_board_grid_people_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_board_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_board_grid_people_locales" ADD CONSTRAINT "pages_blocks_board_grid_people_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_board_grid_people"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_board_grid" ADD CONSTRAINT "pages_blocks_board_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_board_grid_locales" ADD CONSTRAINT "pages_blocks_board_grid_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_board_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_contact_form" ADD CONSTRAINT "pages_blocks_contact_form_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_contact_form_locales" ADD CONSTRAINT "pages_blocks_contact_form_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_contact_form"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cpq_rules" ADD CONSTRAINT "pages_blocks_cpq_rules_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cpq_rules_locales" ADD CONSTRAINT "pages_blocks_cpq_rules_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_cpq_rules"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_step_list" ADD CONSTRAINT "pages_blocks_step_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_step_list_locales" ADD CONSTRAINT "pages_blocks_step_list_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_step_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_implementation_note" ADD CONSTRAINT "pages_blocks_implementation_note_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_implementation_note_locales" ADD CONSTRAINT "pages_blocks_implementation_note_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_implementation_note"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_print_hero_links" ADD CONSTRAINT "pages_blocks_print_hero_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_print_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_print_hero_links_locales" ADD CONSTRAINT "pages_blocks_print_hero_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_print_hero_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_print_hero" ADD CONSTRAINT "pages_blocks_print_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_print_hero_locales" ADD CONSTRAINT "pages_blocks_print_hero_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_print_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_print_quote" ADD CONSTRAINT "pages_blocks_print_quote_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_print_quote_locales" ADD CONSTRAINT "pages_blocks_print_quote_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_print_quote"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_home_hero_links" ADD CONSTRAINT "pages_blocks_home_hero_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_home_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_home_hero_links_locales" ADD CONSTRAINT "pages_blocks_home_hero_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_home_hero_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_home_hero" ADD CONSTRAINT "pages_blocks_home_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_home_hero_locales" ADD CONSTRAINT "pages_blocks_home_hero_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_home_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cfo_dashboard" ADD CONSTRAINT "pages_blocks_cfo_dashboard_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cfo_dashboard_locales" ADD CONSTRAINT "pages_blocks_cfo_dashboard_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_cfo_dashboard"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_quote_carousel" ADD CONSTRAINT "pages_blocks_quote_carousel_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_quote_carousel_locales" ADD CONSTRAINT "pages_blocks_quote_carousel_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_quote_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_quote_band" ADD CONSTRAINT "pages_blocks_quote_band_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_quote_band_locales" ADD CONSTRAINT "pages_blocks_quote_band_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_quote_band"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_index_meta_locales" ADD CONSTRAINT "page_index_meta_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_index_meta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_index_hero_locales" ADD CONSTRAINT "page_index_hero_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_index_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_index_q2c_locales" ADD CONSTRAINT "page_index_q2c_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_index_q2c"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_index_modules_locales" ADD CONSTRAINT "page_index_modules_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_index_modules"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_index_cfo_locales" ADD CONSTRAINT "page_index_cfo_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_index_cfo"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_index_quote_locales" ADD CONSTRAINT "page_index_quote_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_index_quote"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_index_innovate_locales" ADD CONSTRAINT "page_index_innovate_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_index_innovate"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_index_cta_band_locales" ADD CONSTRAINT "page_index_cta_band_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_index_cta_band"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_platform_meta_locales" ADD CONSTRAINT "page_platform_meta_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_platform_meta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_platform_page_hero_dark_locales" ADD CONSTRAINT "page_platform_page_hero_dark_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_platform_page_hero_dark"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_platform_integration_locales" ADD CONSTRAINT "page_platform_integration_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_platform_integration"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_platform_data_model_locales" ADD CONSTRAINT "page_platform_data_model_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_platform_data_model"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_platform_process_locales" ADD CONSTRAINT "page_platform_process_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_platform_process"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_platform_analytics_locales" ADD CONSTRAINT "page_platform_analytics_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_platform_analytics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_platform_deployment_locales" ADD CONSTRAINT "page_platform_deployment_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_platform_deployment"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_platform_cta_band_dark_locales" ADD CONSTRAINT "page_platform_cta_band_dark_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_platform_cta_band_dark"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_cpq_meta_locales" ADD CONSTRAINT "page_cpq_meta_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_cpq_meta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_cpq_page_hero_locales" ADD CONSTRAINT "page_cpq_page_hero_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_cpq_page_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_cpq_split_section_locales" ADD CONSTRAINT "page_cpq_split_section_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_cpq_split_section"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_cpq_split_section_alt_locales" ADD CONSTRAINT "page_cpq_split_section_alt_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_cpq_split_section_alt"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_cpq_crm_integrations_locales" ADD CONSTRAINT "page_cpq_crm_integrations_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_cpq_crm_integrations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_cpq_cta_band_dark_locales" ADD CONSTRAINT "page_cpq_cta_band_dark_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_cpq_cta_band_dark"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_billing_meta_locales" ADD CONSTRAINT "page_billing_meta_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_billing_meta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_billing_page_hero_dark_locales" ADD CONSTRAINT "page_billing_page_hero_dark_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_billing_page_hero_dark"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_billing_split_section_locales" ADD CONSTRAINT "page_billing_split_section_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_billing_split_section"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_billing_split_section_alt_locales" ADD CONSTRAINT "page_billing_split_section_alt_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_billing_split_section_alt"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_billing_cta_band_dark_locales" ADD CONSTRAINT "page_billing_cta_band_dark_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_billing_cta_band_dark"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_subscription_meta_locales" ADD CONSTRAINT "page_subscription_meta_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_subscription_meta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_subscription_page_hero_locales" ADD CONSTRAINT "page_subscription_page_hero_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_subscription_page_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_subscription_split_section_alt_locales" ADD CONSTRAINT "page_subscription_split_section_alt_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_subscription_split_section_alt"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_subscription_split_section_locales" ADD CONSTRAINT "page_subscription_split_section_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_subscription_split_section"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_subscription_cta_band_dark_locales" ADD CONSTRAINT "page_subscription_cta_band_dark_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_subscription_cta_band_dark"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_process_meta_locales" ADD CONSTRAINT "page_process_meta_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_process_meta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_process_page_hero_locales" ADD CONSTRAINT "page_process_page_hero_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_process_page_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_process_split_section_locales" ADD CONSTRAINT "page_process_split_section_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_process_split_section"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_process_cta_band_dark_locales" ADD CONSTRAINT "page_process_cta_band_dark_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_process_cta_band_dark"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_sales_meta_locales" ADD CONSTRAINT "page_sales_meta_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_sales_meta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_sales_page_hero_locales" ADD CONSTRAINT "page_sales_page_hero_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_sales_page_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_sales_split_section_locales" ADD CONSTRAINT "page_sales_split_section_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_sales_split_section"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_sales_crm_integrations_locales" ADD CONSTRAINT "page_sales_crm_integrations_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_sales_crm_integrations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_sales_cta_band_dark_locales" ADD CONSTRAINT "page_sales_cta_band_dark_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_sales_cta_band_dark"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_implementation_meta_locales" ADD CONSTRAINT "page_implementation_meta_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_implementation_meta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_implementation_page_hero_locales" ADD CONSTRAINT "page_implementation_page_hero_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_implementation_page_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_implementation_split_section_locales" ADD CONSTRAINT "page_implementation_split_section_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_implementation_split_section"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_implementation_split_section_alt_locales" ADD CONSTRAINT "page_implementation_split_section_alt_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_implementation_split_section_alt"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_implementation_cta_band_dark_locales" ADD CONSTRAINT "page_implementation_cta_band_dark_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_implementation_cta_band_dark"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_about_meta_locales" ADD CONSTRAINT "page_about_meta_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_about_meta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_about_page_hero_locales" ADD CONSTRAINT "page_about_page_hero_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_about_page_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_about_split_section_locales" ADD CONSTRAINT "page_about_split_section_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_about_split_section"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_about_split_section_alt_locales" ADD CONSTRAINT "page_about_split_section_alt_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_about_split_section_alt"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_about_cta_band_dark_locales" ADD CONSTRAINT "page_about_cta_band_dark_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_about_cta_band_dark"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_contact_meta_locales" ADD CONSTRAINT "page_contact_meta_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_contact_meta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_contact_page_hero_locales" ADD CONSTRAINT "page_contact_page_hero_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_contact_page_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_contact_split_section_locales" ADD CONSTRAINT "page_contact_split_section_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_contact_split_section"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_nav_meta_locales" ADD CONSTRAINT "page_nav_meta_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_nav_meta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_nav_main_locales" ADD CONSTRAINT "page_nav_main_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_nav_main"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_nav_mm_solutions_locales" ADD CONSTRAINT "page_nav_mm_solutions_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_nav_mm_solutions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_foot_main_locales" ADD CONSTRAINT "page_foot_main_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_foot_main"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_jsonld_org_locales" ADD CONSTRAINT "page_jsonld_org_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_jsonld_org"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_index_print_meta_locales" ADD CONSTRAINT "page_index_print_meta_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_index_print_meta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_index_print_hero_locales" ADD CONSTRAINT "page_index_print_hero_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_index_print_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_index_print_q2c_locales" ADD CONSTRAINT "page_index_print_q2c_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_index_print_q2c"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_index_print_modules_locales" ADD CONSTRAINT "page_index_print_modules_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_index_print_modules"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_index_print_quote_locales" ADD CONSTRAINT "page_index_print_quote_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_index_print_quote"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_index_print_innovate_locales" ADD CONSTRAINT "page_index_print_innovate_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_index_print_innovate"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_index_print_cta_band_locales" ADD CONSTRAINT "page_index_print_cta_band_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_index_print_cta_band"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE UNIQUE INDEX "media_locales_locale_parent_id_unique" ON "media_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_cta_band_links_order_idx" ON "pages_blocks_cta_band_links" USING btree ("_order");
  CREATE INDEX "pages_blocks_cta_band_links_parent_id_idx" ON "pages_blocks_cta_band_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_cta_band_links_locales_locale_parent_id_unique" ON "pages_blocks_cta_band_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_cta_band_order_idx" ON "pages_blocks_cta_band" USING btree ("_order");
  CREATE INDEX "pages_blocks_cta_band_parent_id_idx" ON "pages_blocks_cta_band" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_cta_band_path_idx" ON "pages_blocks_cta_band" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_cta_band_locales_locale_parent_id_unique" ON "pages_blocks_cta_band_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_page_hero_split_links_order_idx" ON "pages_blocks_page_hero_split_links" USING btree ("_order");
  CREATE INDEX "pages_blocks_page_hero_split_links_parent_id_idx" ON "pages_blocks_page_hero_split_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_page_hero_split_links_locales_locale_parent_id_" ON "pages_blocks_page_hero_split_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_page_hero_split_order_idx" ON "pages_blocks_page_hero_split" USING btree ("_order");
  CREATE INDEX "pages_blocks_page_hero_split_parent_id_idx" ON "pages_blocks_page_hero_split" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_page_hero_split_path_idx" ON "pages_blocks_page_hero_split" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_page_hero_split_locales_locale_parent_id_unique" ON "pages_blocks_page_hero_split_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_split_prose_paragraphs_order_idx" ON "pages_blocks_split_prose_paragraphs" USING btree ("_order");
  CREATE INDEX "pages_blocks_split_prose_paragraphs_parent_id_idx" ON "pages_blocks_split_prose_paragraphs" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_split_prose_paragraphs_locales_locale_parent_id" ON "pages_blocks_split_prose_paragraphs_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_split_prose_order_idx" ON "pages_blocks_split_prose" USING btree ("_order");
  CREATE INDEX "pages_blocks_split_prose_parent_id_idx" ON "pages_blocks_split_prose" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_split_prose_path_idx" ON "pages_blocks_split_prose" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_split_prose_locales_locale_parent_id_unique" ON "pages_blocks_split_prose_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_feature_grid_cards_order_idx" ON "pages_blocks_feature_grid_cards" USING btree ("_order");
  CREATE INDEX "pages_blocks_feature_grid_cards_parent_id_idx" ON "pages_blocks_feature_grid_cards" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_feature_grid_cards_locales_locale_parent_id_uni" ON "pages_blocks_feature_grid_cards_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_feature_grid_order_idx" ON "pages_blocks_feature_grid" USING btree ("_order");
  CREATE INDEX "pages_blocks_feature_grid_parent_id_idx" ON "pages_blocks_feature_grid" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_feature_grid_path_idx" ON "pages_blocks_feature_grid" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_feature_grid_locales_locale_parent_id_unique" ON "pages_blocks_feature_grid_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_page_hero_links_order_idx" ON "pages_blocks_page_hero_links" USING btree ("_order");
  CREATE INDEX "pages_blocks_page_hero_links_parent_id_idx" ON "pages_blocks_page_hero_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_page_hero_links_locales_locale_parent_id_unique" ON "pages_blocks_page_hero_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_page_hero_order_idx" ON "pages_blocks_page_hero" USING btree ("_order");
  CREATE INDEX "pages_blocks_page_hero_parent_id_idx" ON "pages_blocks_page_hero" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_page_hero_path_idx" ON "pages_blocks_page_hero" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_page_hero_locales_locale_parent_id_unique" ON "pages_blocks_page_hero_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_integration_grid_bullets_order_idx" ON "pages_blocks_integration_grid_bullets" USING btree ("_order");
  CREATE INDEX "pages_blocks_integration_grid_bullets_parent_id_idx" ON "pages_blocks_integration_grid_bullets" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_integration_grid_bullets_locales_locale_parent_" ON "pages_blocks_integration_grid_bullets_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_integration_grid_cards_order_idx" ON "pages_blocks_integration_grid_cards" USING btree ("_order");
  CREATE INDEX "pages_blocks_integration_grid_cards_parent_id_idx" ON "pages_blocks_integration_grid_cards" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_integration_grid_cards_locales_locale_parent_id" ON "pages_blocks_integration_grid_cards_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_integration_grid_source_tags_order_idx" ON "pages_blocks_integration_grid_source_tags" USING btree ("_order");
  CREATE INDEX "pages_blocks_integration_grid_source_tags_parent_id_idx" ON "pages_blocks_integration_grid_source_tags" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_integration_grid_source_tags_locales_locale_par" ON "pages_blocks_integration_grid_source_tags_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_integration_grid_target_tags_order_idx" ON "pages_blocks_integration_grid_target_tags" USING btree ("_order");
  CREATE INDEX "pages_blocks_integration_grid_target_tags_parent_id_idx" ON "pages_blocks_integration_grid_target_tags" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_integration_grid_target_tags_locales_locale_par" ON "pages_blocks_integration_grid_target_tags_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_integration_grid_order_idx" ON "pages_blocks_integration_grid" USING btree ("_order");
  CREATE INDEX "pages_blocks_integration_grid_parent_id_idx" ON "pages_blocks_integration_grid" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_integration_grid_path_idx" ON "pages_blocks_integration_grid" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_integration_grid_locales_locale_parent_id_uniqu" ON "pages_blocks_integration_grid_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_q2c_board_links_order_idx" ON "pages_blocks_q2c_board_links" USING btree ("_order");
  CREATE INDEX "pages_blocks_q2c_board_links_parent_id_idx" ON "pages_blocks_q2c_board_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_q2c_board_links_locales_locale_parent_id_unique" ON "pages_blocks_q2c_board_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_q2c_board_order_idx" ON "pages_blocks_q2c_board" USING btree ("_order");
  CREATE INDEX "pages_blocks_q2c_board_parent_id_idx" ON "pages_blocks_q2c_board" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_q2c_board_path_idx" ON "pages_blocks_q2c_board" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_q2c_board_locales_locale_parent_id_unique" ON "pages_blocks_q2c_board_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_module_grid_order_idx" ON "pages_blocks_module_grid" USING btree ("_order");
  CREATE INDEX "pages_blocks_module_grid_parent_id_idx" ON "pages_blocks_module_grid" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_module_grid_path_idx" ON "pages_blocks_module_grid" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_module_grid_locales_locale_parent_id_unique" ON "pages_blocks_module_grid_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_innovate_forecast_links_order_idx" ON "pages_blocks_innovate_forecast_links" USING btree ("_order");
  CREATE INDEX "pages_blocks_innovate_forecast_links_parent_id_idx" ON "pages_blocks_innovate_forecast_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_innovate_forecast_links_locales_locale_parent_i" ON "pages_blocks_innovate_forecast_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_innovate_forecast_order_idx" ON "pages_blocks_innovate_forecast" USING btree ("_order");
  CREATE INDEX "pages_blocks_innovate_forecast_parent_id_idx" ON "pages_blocks_innovate_forecast" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_innovate_forecast_path_idx" ON "pages_blocks_innovate_forecast" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_innovate_forecast_locales_locale_parent_id_uniq" ON "pages_blocks_innovate_forecast_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_value_grid_order_idx" ON "pages_blocks_value_grid" USING btree ("_order");
  CREATE INDEX "pages_blocks_value_grid_parent_id_idx" ON "pages_blocks_value_grid" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_value_grid_path_idx" ON "pages_blocks_value_grid" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_value_grid_locales_locale_parent_id_unique" ON "pages_blocks_value_grid_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_team_grid_order_idx" ON "pages_blocks_team_grid" USING btree ("_order");
  CREATE INDEX "pages_blocks_team_grid_parent_id_idx" ON "pages_blocks_team_grid" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_team_grid_path_idx" ON "pages_blocks_team_grid" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_team_grid_locales_locale_parent_id_unique" ON "pages_blocks_team_grid_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_board_grid_people_order_idx" ON "pages_blocks_board_grid_people" USING btree ("_order");
  CREATE INDEX "pages_blocks_board_grid_people_parent_id_idx" ON "pages_blocks_board_grid_people" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_board_grid_people_locales_locale_parent_id_uniq" ON "pages_blocks_board_grid_people_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_board_grid_order_idx" ON "pages_blocks_board_grid" USING btree ("_order");
  CREATE INDEX "pages_blocks_board_grid_parent_id_idx" ON "pages_blocks_board_grid" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_board_grid_path_idx" ON "pages_blocks_board_grid" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_board_grid_locales_locale_parent_id_unique" ON "pages_blocks_board_grid_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_contact_form_order_idx" ON "pages_blocks_contact_form" USING btree ("_order");
  CREATE INDEX "pages_blocks_contact_form_parent_id_idx" ON "pages_blocks_contact_form" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_contact_form_path_idx" ON "pages_blocks_contact_form" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_contact_form_locales_locale_parent_id_unique" ON "pages_blocks_contact_form_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_cpq_rules_order_idx" ON "pages_blocks_cpq_rules" USING btree ("_order");
  CREATE INDEX "pages_blocks_cpq_rules_parent_id_idx" ON "pages_blocks_cpq_rules" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_cpq_rules_path_idx" ON "pages_blocks_cpq_rules" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_cpq_rules_locales_locale_parent_id_unique" ON "pages_blocks_cpq_rules_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_step_list_order_idx" ON "pages_blocks_step_list" USING btree ("_order");
  CREATE INDEX "pages_blocks_step_list_parent_id_idx" ON "pages_blocks_step_list" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_step_list_path_idx" ON "pages_blocks_step_list" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_step_list_locales_locale_parent_id_unique" ON "pages_blocks_step_list_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_implementation_note_order_idx" ON "pages_blocks_implementation_note" USING btree ("_order");
  CREATE INDEX "pages_blocks_implementation_note_parent_id_idx" ON "pages_blocks_implementation_note" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_implementation_note_path_idx" ON "pages_blocks_implementation_note" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_implementation_note_locales_locale_parent_id_un" ON "pages_blocks_implementation_note_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_print_hero_links_order_idx" ON "pages_blocks_print_hero_links" USING btree ("_order");
  CREATE INDEX "pages_blocks_print_hero_links_parent_id_idx" ON "pages_blocks_print_hero_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_print_hero_links_locales_locale_parent_id_uniqu" ON "pages_blocks_print_hero_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_print_hero_order_idx" ON "pages_blocks_print_hero" USING btree ("_order");
  CREATE INDEX "pages_blocks_print_hero_parent_id_idx" ON "pages_blocks_print_hero" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_print_hero_path_idx" ON "pages_blocks_print_hero" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_print_hero_locales_locale_parent_id_unique" ON "pages_blocks_print_hero_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_print_quote_order_idx" ON "pages_blocks_print_quote" USING btree ("_order");
  CREATE INDEX "pages_blocks_print_quote_parent_id_idx" ON "pages_blocks_print_quote" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_print_quote_path_idx" ON "pages_blocks_print_quote" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_print_quote_locales_locale_parent_id_unique" ON "pages_blocks_print_quote_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_home_hero_links_order_idx" ON "pages_blocks_home_hero_links" USING btree ("_order");
  CREATE INDEX "pages_blocks_home_hero_links_parent_id_idx" ON "pages_blocks_home_hero_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_home_hero_links_locales_locale_parent_id_unique" ON "pages_blocks_home_hero_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_home_hero_order_idx" ON "pages_blocks_home_hero" USING btree ("_order");
  CREATE INDEX "pages_blocks_home_hero_parent_id_idx" ON "pages_blocks_home_hero" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_home_hero_path_idx" ON "pages_blocks_home_hero" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_home_hero_locales_locale_parent_id_unique" ON "pages_blocks_home_hero_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_cfo_dashboard_order_idx" ON "pages_blocks_cfo_dashboard" USING btree ("_order");
  CREATE INDEX "pages_blocks_cfo_dashboard_parent_id_idx" ON "pages_blocks_cfo_dashboard" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_cfo_dashboard_path_idx" ON "pages_blocks_cfo_dashboard" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_cfo_dashboard_locales_locale_parent_id_unique" ON "pages_blocks_cfo_dashboard_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_quote_carousel_order_idx" ON "pages_blocks_quote_carousel" USING btree ("_order");
  CREATE INDEX "pages_blocks_quote_carousel_parent_id_idx" ON "pages_blocks_quote_carousel" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_quote_carousel_path_idx" ON "pages_blocks_quote_carousel" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_quote_carousel_locales_locale_parent_id_unique" ON "pages_blocks_quote_carousel_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_quote_band_order_idx" ON "pages_blocks_quote_band" USING btree ("_order");
  CREATE INDEX "pages_blocks_quote_band_parent_id_idx" ON "pages_blocks_quote_band" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_quote_band_path_idx" ON "pages_blocks_quote_band" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_quote_band_locales_locale_parent_id_unique" ON "pages_blocks_quote_band_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "pages_name_idx" ON "pages" USING btree ("name");
  CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE UNIQUE INDEX "page_index_meta_locales_locale_parent_id_unique" ON "page_index_meta_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "page_index_hero_locales_locale_parent_id_unique" ON "page_index_hero_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "page_index_q2c_locales_locale_parent_id_unique" ON "page_index_q2c_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "page_index_modules_locales_locale_parent_id_unique" ON "page_index_modules_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "page_index_cfo_locales_locale_parent_id_unique" ON "page_index_cfo_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "page_index_quote_locales_locale_parent_id_unique" ON "page_index_quote_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "page_index_innovate_locales_locale_parent_id_unique" ON "page_index_innovate_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "page_index_cta_band_locales_locale_parent_id_unique" ON "page_index_cta_band_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "page_platform_meta_locales_locale_parent_id_unique" ON "page_platform_meta_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "page_platform_page_hero_dark_locales_locale_parent_id_unique" ON "page_platform_page_hero_dark_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "page_platform_integration_locales_locale_parent_id_unique" ON "page_platform_integration_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "page_platform_data_model_locales_locale_parent_id_unique" ON "page_platform_data_model_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "page_platform_process_locales_locale_parent_id_unique" ON "page_platform_process_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "page_platform_analytics_locales_locale_parent_id_unique" ON "page_platform_analytics_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "page_platform_deployment_locales_locale_parent_id_unique" ON "page_platform_deployment_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "page_platform_cta_band_dark_locales_locale_parent_id_unique" ON "page_platform_cta_band_dark_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "page_cpq_meta_locales_locale_parent_id_unique" ON "page_cpq_meta_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "page_cpq_page_hero_locales_locale_parent_id_unique" ON "page_cpq_page_hero_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "page_cpq_split_section_locales_locale_parent_id_unique" ON "page_cpq_split_section_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "page_cpq_split_section_alt_locales_locale_parent_id_unique" ON "page_cpq_split_section_alt_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "page_cpq_crm_integrations_locales_locale_parent_id_unique" ON "page_cpq_crm_integrations_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "page_cpq_cta_band_dark_locales_locale_parent_id_unique" ON "page_cpq_cta_band_dark_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "page_billing_meta_locales_locale_parent_id_unique" ON "page_billing_meta_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "page_billing_page_hero_dark_locales_locale_parent_id_unique" ON "page_billing_page_hero_dark_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "page_billing_split_section_locales_locale_parent_id_unique" ON "page_billing_split_section_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "page_billing_split_section_alt_locales_locale_parent_id_uniq" ON "page_billing_split_section_alt_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "page_billing_cta_band_dark_locales_locale_parent_id_unique" ON "page_billing_cta_band_dark_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "page_subscription_meta_locales_locale_parent_id_unique" ON "page_subscription_meta_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "page_subscription_page_hero_locales_locale_parent_id_unique" ON "page_subscription_page_hero_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "page_subscription_split_section_alt_locales_locale_parent_id" ON "page_subscription_split_section_alt_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "page_subscription_split_section_locales_locale_parent_id_uni" ON "page_subscription_split_section_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "page_subscription_cta_band_dark_locales_locale_parent_id_uni" ON "page_subscription_cta_band_dark_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "page_process_meta_locales_locale_parent_id_unique" ON "page_process_meta_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "page_process_page_hero_locales_locale_parent_id_unique" ON "page_process_page_hero_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "page_process_split_section_locales_locale_parent_id_unique" ON "page_process_split_section_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "page_process_cta_band_dark_locales_locale_parent_id_unique" ON "page_process_cta_band_dark_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "page_sales_meta_locales_locale_parent_id_unique" ON "page_sales_meta_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "page_sales_page_hero_locales_locale_parent_id_unique" ON "page_sales_page_hero_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "page_sales_split_section_locales_locale_parent_id_unique" ON "page_sales_split_section_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "page_sales_crm_integrations_locales_locale_parent_id_unique" ON "page_sales_crm_integrations_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "page_sales_cta_band_dark_locales_locale_parent_id_unique" ON "page_sales_cta_band_dark_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "page_implementation_meta_locales_locale_parent_id_unique" ON "page_implementation_meta_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "page_implementation_page_hero_locales_locale_parent_id_uniqu" ON "page_implementation_page_hero_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "page_implementation_split_section_locales_locale_parent_id_u" ON "page_implementation_split_section_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "page_implementation_split_section_alt_locales_locale_parent_" ON "page_implementation_split_section_alt_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "page_implementation_cta_band_dark_locales_locale_parent_id_u" ON "page_implementation_cta_band_dark_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "page_about_meta_locales_locale_parent_id_unique" ON "page_about_meta_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "page_about_page_hero_locales_locale_parent_id_unique" ON "page_about_page_hero_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "page_about_split_section_locales_locale_parent_id_unique" ON "page_about_split_section_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "page_about_split_section_alt_locales_locale_parent_id_unique" ON "page_about_split_section_alt_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "page_about_cta_band_dark_locales_locale_parent_id_unique" ON "page_about_cta_band_dark_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "page_contact_meta_locales_locale_parent_id_unique" ON "page_contact_meta_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "page_contact_page_hero_locales_locale_parent_id_unique" ON "page_contact_page_hero_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "page_contact_split_section_locales_locale_parent_id_unique" ON "page_contact_split_section_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "page_nav_meta_locales_locale_parent_id_unique" ON "page_nav_meta_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "page_nav_main_locales_locale_parent_id_unique" ON "page_nav_main_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "page_nav_mm_solutions_locales_locale_parent_id_unique" ON "page_nav_mm_solutions_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "page_foot_main_locales_locale_parent_id_unique" ON "page_foot_main_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "page_jsonld_org_locales_locale_parent_id_unique" ON "page_jsonld_org_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "page_index_print_meta_locales_locale_parent_id_unique" ON "page_index_print_meta_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "page_index_print_hero_locales_locale_parent_id_unique" ON "page_index_print_hero_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "page_index_print_q2c_locales_locale_parent_id_unique" ON "page_index_print_q2c_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "page_index_print_modules_locales_locale_parent_id_unique" ON "page_index_print_modules_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "page_index_print_quote_locales_locale_parent_id_unique" ON "page_index_print_quote_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "page_index_print_innovate_locales_locale_parent_id_unique" ON "page_index_print_innovate_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "page_index_print_cta_band_locales_locale_parent_id_unique" ON "page_index_print_cta_band_locales" USING btree ("_locale","_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "media_locales" CASCADE;
  DROP TABLE "pages_blocks_cta_band_links" CASCADE;
  DROP TABLE "pages_blocks_cta_band_links_locales" CASCADE;
  DROP TABLE "pages_blocks_cta_band" CASCADE;
  DROP TABLE "pages_blocks_cta_band_locales" CASCADE;
  DROP TABLE "pages_blocks_page_hero_split_links" CASCADE;
  DROP TABLE "pages_blocks_page_hero_split_links_locales" CASCADE;
  DROP TABLE "pages_blocks_page_hero_split" CASCADE;
  DROP TABLE "pages_blocks_page_hero_split_locales" CASCADE;
  DROP TABLE "pages_blocks_split_prose_paragraphs" CASCADE;
  DROP TABLE "pages_blocks_split_prose_paragraphs_locales" CASCADE;
  DROP TABLE "pages_blocks_split_prose" CASCADE;
  DROP TABLE "pages_blocks_split_prose_locales" CASCADE;
  DROP TABLE "pages_blocks_feature_grid_cards" CASCADE;
  DROP TABLE "pages_blocks_feature_grid_cards_locales" CASCADE;
  DROP TABLE "pages_blocks_feature_grid" CASCADE;
  DROP TABLE "pages_blocks_feature_grid_locales" CASCADE;
  DROP TABLE "pages_blocks_page_hero_links" CASCADE;
  DROP TABLE "pages_blocks_page_hero_links_locales" CASCADE;
  DROP TABLE "pages_blocks_page_hero" CASCADE;
  DROP TABLE "pages_blocks_page_hero_locales" CASCADE;
  DROP TABLE "pages_blocks_integration_grid_bullets" CASCADE;
  DROP TABLE "pages_blocks_integration_grid_bullets_locales" CASCADE;
  DROP TABLE "pages_blocks_integration_grid_cards" CASCADE;
  DROP TABLE "pages_blocks_integration_grid_cards_locales" CASCADE;
  DROP TABLE "pages_blocks_integration_grid_source_tags" CASCADE;
  DROP TABLE "pages_blocks_integration_grid_source_tags_locales" CASCADE;
  DROP TABLE "pages_blocks_integration_grid_target_tags" CASCADE;
  DROP TABLE "pages_blocks_integration_grid_target_tags_locales" CASCADE;
  DROP TABLE "pages_blocks_integration_grid" CASCADE;
  DROP TABLE "pages_blocks_integration_grid_locales" CASCADE;
  DROP TABLE "pages_blocks_q2c_board_links" CASCADE;
  DROP TABLE "pages_blocks_q2c_board_links_locales" CASCADE;
  DROP TABLE "pages_blocks_q2c_board" CASCADE;
  DROP TABLE "pages_blocks_q2c_board_locales" CASCADE;
  DROP TABLE "pages_blocks_module_grid" CASCADE;
  DROP TABLE "pages_blocks_module_grid_locales" CASCADE;
  DROP TABLE "pages_blocks_innovate_forecast_links" CASCADE;
  DROP TABLE "pages_blocks_innovate_forecast_links_locales" CASCADE;
  DROP TABLE "pages_blocks_innovate_forecast" CASCADE;
  DROP TABLE "pages_blocks_innovate_forecast_locales" CASCADE;
  DROP TABLE "pages_blocks_value_grid" CASCADE;
  DROP TABLE "pages_blocks_value_grid_locales" CASCADE;
  DROP TABLE "pages_blocks_team_grid" CASCADE;
  DROP TABLE "pages_blocks_team_grid_locales" CASCADE;
  DROP TABLE "pages_blocks_board_grid_people" CASCADE;
  DROP TABLE "pages_blocks_board_grid_people_locales" CASCADE;
  DROP TABLE "pages_blocks_board_grid" CASCADE;
  DROP TABLE "pages_blocks_board_grid_locales" CASCADE;
  DROP TABLE "pages_blocks_contact_form" CASCADE;
  DROP TABLE "pages_blocks_contact_form_locales" CASCADE;
  DROP TABLE "pages_blocks_cpq_rules" CASCADE;
  DROP TABLE "pages_blocks_cpq_rules_locales" CASCADE;
  DROP TABLE "pages_blocks_step_list" CASCADE;
  DROP TABLE "pages_blocks_step_list_locales" CASCADE;
  DROP TABLE "pages_blocks_implementation_note" CASCADE;
  DROP TABLE "pages_blocks_implementation_note_locales" CASCADE;
  DROP TABLE "pages_blocks_print_hero_links" CASCADE;
  DROP TABLE "pages_blocks_print_hero_links_locales" CASCADE;
  DROP TABLE "pages_blocks_print_hero" CASCADE;
  DROP TABLE "pages_blocks_print_hero_locales" CASCADE;
  DROP TABLE "pages_blocks_print_quote" CASCADE;
  DROP TABLE "pages_blocks_print_quote_locales" CASCADE;
  DROP TABLE "pages_blocks_home_hero_links" CASCADE;
  DROP TABLE "pages_blocks_home_hero_links_locales" CASCADE;
  DROP TABLE "pages_blocks_home_hero" CASCADE;
  DROP TABLE "pages_blocks_home_hero_locales" CASCADE;
  DROP TABLE "pages_blocks_cfo_dashboard" CASCADE;
  DROP TABLE "pages_blocks_cfo_dashboard_locales" CASCADE;
  DROP TABLE "pages_blocks_quote_carousel" CASCADE;
  DROP TABLE "pages_blocks_quote_carousel_locales" CASCADE;
  DROP TABLE "pages_blocks_quote_band" CASCADE;
  DROP TABLE "pages_blocks_quote_band_locales" CASCADE;
  DROP TABLE "pages" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "page_index_meta" CASCADE;
  DROP TABLE "page_index_meta_locales" CASCADE;
  DROP TABLE "page_index_hero" CASCADE;
  DROP TABLE "page_index_hero_locales" CASCADE;
  DROP TABLE "page_index_q2c" CASCADE;
  DROP TABLE "page_index_q2c_locales" CASCADE;
  DROP TABLE "page_index_modules" CASCADE;
  DROP TABLE "page_index_modules_locales" CASCADE;
  DROP TABLE "page_index_cfo" CASCADE;
  DROP TABLE "page_index_cfo_locales" CASCADE;
  DROP TABLE "page_index_quote" CASCADE;
  DROP TABLE "page_index_quote_locales" CASCADE;
  DROP TABLE "page_index_innovate" CASCADE;
  DROP TABLE "page_index_innovate_locales" CASCADE;
  DROP TABLE "page_index_cta_band" CASCADE;
  DROP TABLE "page_index_cta_band_locales" CASCADE;
  DROP TABLE "page_platform_meta" CASCADE;
  DROP TABLE "page_platform_meta_locales" CASCADE;
  DROP TABLE "page_platform_page_hero_dark" CASCADE;
  DROP TABLE "page_platform_page_hero_dark_locales" CASCADE;
  DROP TABLE "page_platform_integration" CASCADE;
  DROP TABLE "page_platform_integration_locales" CASCADE;
  DROP TABLE "page_platform_data_model" CASCADE;
  DROP TABLE "page_platform_data_model_locales" CASCADE;
  DROP TABLE "page_platform_process" CASCADE;
  DROP TABLE "page_platform_process_locales" CASCADE;
  DROP TABLE "page_platform_analytics" CASCADE;
  DROP TABLE "page_platform_analytics_locales" CASCADE;
  DROP TABLE "page_platform_deployment" CASCADE;
  DROP TABLE "page_platform_deployment_locales" CASCADE;
  DROP TABLE "page_platform_cta_band_dark" CASCADE;
  DROP TABLE "page_platform_cta_band_dark_locales" CASCADE;
  DROP TABLE "page_cpq_meta" CASCADE;
  DROP TABLE "page_cpq_meta_locales" CASCADE;
  DROP TABLE "page_cpq_page_hero" CASCADE;
  DROP TABLE "page_cpq_page_hero_locales" CASCADE;
  DROP TABLE "page_cpq_split_section" CASCADE;
  DROP TABLE "page_cpq_split_section_locales" CASCADE;
  DROP TABLE "page_cpq_split_section_alt" CASCADE;
  DROP TABLE "page_cpq_split_section_alt_locales" CASCADE;
  DROP TABLE "page_cpq_crm_integrations" CASCADE;
  DROP TABLE "page_cpq_crm_integrations_locales" CASCADE;
  DROP TABLE "page_cpq_cta_band_dark" CASCADE;
  DROP TABLE "page_cpq_cta_band_dark_locales" CASCADE;
  DROP TABLE "page_billing_meta" CASCADE;
  DROP TABLE "page_billing_meta_locales" CASCADE;
  DROP TABLE "page_billing_page_hero_dark" CASCADE;
  DROP TABLE "page_billing_page_hero_dark_locales" CASCADE;
  DROP TABLE "page_billing_split_section" CASCADE;
  DROP TABLE "page_billing_split_section_locales" CASCADE;
  DROP TABLE "page_billing_split_section_alt" CASCADE;
  DROP TABLE "page_billing_split_section_alt_locales" CASCADE;
  DROP TABLE "page_billing_cta_band_dark" CASCADE;
  DROP TABLE "page_billing_cta_band_dark_locales" CASCADE;
  DROP TABLE "page_subscription_meta" CASCADE;
  DROP TABLE "page_subscription_meta_locales" CASCADE;
  DROP TABLE "page_subscription_page_hero" CASCADE;
  DROP TABLE "page_subscription_page_hero_locales" CASCADE;
  DROP TABLE "page_subscription_split_section_alt" CASCADE;
  DROP TABLE "page_subscription_split_section_alt_locales" CASCADE;
  DROP TABLE "page_subscription_split_section" CASCADE;
  DROP TABLE "page_subscription_split_section_locales" CASCADE;
  DROP TABLE "page_subscription_cta_band_dark" CASCADE;
  DROP TABLE "page_subscription_cta_band_dark_locales" CASCADE;
  DROP TABLE "page_process_meta" CASCADE;
  DROP TABLE "page_process_meta_locales" CASCADE;
  DROP TABLE "page_process_page_hero" CASCADE;
  DROP TABLE "page_process_page_hero_locales" CASCADE;
  DROP TABLE "page_process_split_section" CASCADE;
  DROP TABLE "page_process_split_section_locales" CASCADE;
  DROP TABLE "page_process_cta_band_dark" CASCADE;
  DROP TABLE "page_process_cta_band_dark_locales" CASCADE;
  DROP TABLE "page_sales_meta" CASCADE;
  DROP TABLE "page_sales_meta_locales" CASCADE;
  DROP TABLE "page_sales_page_hero" CASCADE;
  DROP TABLE "page_sales_page_hero_locales" CASCADE;
  DROP TABLE "page_sales_split_section" CASCADE;
  DROP TABLE "page_sales_split_section_locales" CASCADE;
  DROP TABLE "page_sales_crm_integrations" CASCADE;
  DROP TABLE "page_sales_crm_integrations_locales" CASCADE;
  DROP TABLE "page_sales_cta_band_dark" CASCADE;
  DROP TABLE "page_sales_cta_band_dark_locales" CASCADE;
  DROP TABLE "page_implementation_meta" CASCADE;
  DROP TABLE "page_implementation_meta_locales" CASCADE;
  DROP TABLE "page_implementation_page_hero" CASCADE;
  DROP TABLE "page_implementation_page_hero_locales" CASCADE;
  DROP TABLE "page_implementation_split_section" CASCADE;
  DROP TABLE "page_implementation_split_section_locales" CASCADE;
  DROP TABLE "page_implementation_split_section_alt" CASCADE;
  DROP TABLE "page_implementation_split_section_alt_locales" CASCADE;
  DROP TABLE "page_implementation_cta_band_dark" CASCADE;
  DROP TABLE "page_implementation_cta_band_dark_locales" CASCADE;
  DROP TABLE "page_about_meta" CASCADE;
  DROP TABLE "page_about_meta_locales" CASCADE;
  DROP TABLE "page_about_page_hero" CASCADE;
  DROP TABLE "page_about_page_hero_locales" CASCADE;
  DROP TABLE "page_about_split_section" CASCADE;
  DROP TABLE "page_about_split_section_locales" CASCADE;
  DROP TABLE "page_about_split_section_alt" CASCADE;
  DROP TABLE "page_about_split_section_alt_locales" CASCADE;
  DROP TABLE "page_about_cta_band_dark" CASCADE;
  DROP TABLE "page_about_cta_band_dark_locales" CASCADE;
  DROP TABLE "page_contact_meta" CASCADE;
  DROP TABLE "page_contact_meta_locales" CASCADE;
  DROP TABLE "page_contact_page_hero" CASCADE;
  DROP TABLE "page_contact_page_hero_locales" CASCADE;
  DROP TABLE "page_contact_split_section" CASCADE;
  DROP TABLE "page_contact_split_section_locales" CASCADE;
  DROP TABLE "page_nav_meta" CASCADE;
  DROP TABLE "page_nav_meta_locales" CASCADE;
  DROP TABLE "page_nav_main" CASCADE;
  DROP TABLE "page_nav_main_locales" CASCADE;
  DROP TABLE "page_nav_mm_solutions" CASCADE;
  DROP TABLE "page_nav_mm_solutions_locales" CASCADE;
  DROP TABLE "page_foot_main" CASCADE;
  DROP TABLE "page_foot_main_locales" CASCADE;
  DROP TABLE "page_jsonld_org" CASCADE;
  DROP TABLE "page_jsonld_org_locales" CASCADE;
  DROP TABLE "page_index_print_meta" CASCADE;
  DROP TABLE "page_index_print_meta_locales" CASCADE;
  DROP TABLE "page_index_print_hero" CASCADE;
  DROP TABLE "page_index_print_hero_locales" CASCADE;
  DROP TABLE "page_index_print_q2c" CASCADE;
  DROP TABLE "page_index_print_q2c_locales" CASCADE;
  DROP TABLE "page_index_print_modules" CASCADE;
  DROP TABLE "page_index_print_modules_locales" CASCADE;
  DROP TABLE "page_index_print_quote" CASCADE;
  DROP TABLE "page_index_print_quote_locales" CASCADE;
  DROP TABLE "page_index_print_innovate" CASCADE;
  DROP TABLE "page_index_print_innovate_locales" CASCADE;
  DROP TABLE "page_index_print_cta_band" CASCADE;
  DROP TABLE "page_index_print_cta_band_locales" CASCADE;
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum_pages_blocks_cta_band_links_href";
  DROP TYPE "public"."enum_pages_blocks_cta_band_links_variant";
  DROP TYPE "public"."enum_pages_blocks_page_hero_split_links_href";
  DROP TYPE "public"."enum_pages_blocks_page_hero_split_links_variant";
  DROP TYPE "public"."enum_pages_blocks_feature_grid_accent";
  DROP TYPE "public"."enum_pages_blocks_page_hero_links_href";
  DROP TYPE "public"."enum_pages_blocks_integration_grid_cards_badge_letter";
  DROP TYPE "public"."enum_pages_blocks_integration_grid_accent";
  DROP TYPE "public"."enum_pages_blocks_q2c_board_links_href";
  DROP TYPE "public"."enum_pages_blocks_q2c_board_links_variant";
  DROP TYPE "public"."enum_pages_blocks_innovate_forecast_links_href";
  DROP TYPE "public"."enum_pages_blocks_innovate_forecast_links_variant";
  DROP TYPE "public"."enum_pages_blocks_board_grid_people_image";
  DROP TYPE "public"."enum_pages_blocks_print_hero_links_href";
  DROP TYPE "public"."enum_pages_blocks_print_hero_links_variant";
  DROP TYPE "public"."enum_pages_blocks_home_hero_links_href";
  DROP TYPE "public"."enum_pages_blocks_home_hero_links_variant";`)
}
