/**
 * JACRAL – Landing Page & CMS Types.
 */

export interface BrandInfo {
  brand_name: string;
  tagline?: string;
  logo_url?: string | null;
  favicon_url?: string | null;
}

export interface BrandAdminInfo extends BrandInfo {
  draft_logo_url?: string | null;
  draft_favicon_url?: string | null;
  is_published: boolean;
}

export interface HeroSlide {
  id: number;
  slide_number: number;
  display_order: number;
  title?: string | null;
  subtitle?: string | null;
  description?: string | null;
  cta_text?: string | null;
  cta_url?: string | null;
  secondary_cta_text?: string | null;
  secondary_cta_url?: string | null;
  image_url?: string | null;
  mobile_image_url?: string | null;
  is_active: boolean;
}

export interface HeroSlideAdmin extends HeroSlide {
  draft_title?: string | null;
  draft_subtitle?: string | null;
  draft_description?: string | null;
  draft_cta_text?: string | null;
  draft_cta_url?: string | null;
  draft_secondary_cta_text?: string | null;
  draft_secondary_cta_url?: string | null;
  draft_image_url?: string | null;
  draft_mobile_image_url?: string | null;
  draft_is_active: boolean;
  is_published: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SectionContent {
  [key: string]: any;
}

export interface LandingPageSection {
  section_key: string;
  title?: string | null;
  subtitle?: string | null;
  content?: SectionContent;
  is_active: boolean;
}

export interface SectionAdmin extends LandingPageSection {
  id: number;
  draft_content?: SectionContent;
  draft_is_active: boolean;
  is_published: boolean;
  updated_at?: string;
}

export interface LandingPageData {
  brand: BrandInfo;
  hero_slides: HeroSlide[];
  sections: Record<string, LandingPageSection>;
}

export interface AdminLandingPageData {
  brand: BrandAdminInfo;
  hero_slides: HeroSlideAdmin[];
  sections: Record<string, SectionAdmin>;
  has_unpublished_changes: boolean;
}

export interface SiteSettings {
  contact_email?: string | null;
  contact_phone?: string | null;
  contact_address?: string | null;
  social_instagram?: string | null;
  social_facebook?: string | null;
  social_twitter?: string | null;
  social_linkedin?: string | null;
}

