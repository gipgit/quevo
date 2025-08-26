export interface BusinessProfileLeanData {
  businessData: {
    business_id: string;
    business_public_uuid: string;
    business_urlname: string;
    business_name: string;
    business_descr: string | null;
    business_address: string | null;
    business_city: string | null;
    business_img_cover: string | null;
    business_img_profile: string | null;
    business_email: any;
    business_phone: any;
    business_link_booking: boolean;
    business_has_rewards: boolean;
    business_has_promotions: boolean;
  } | null;
  themeColorBackground: string;
  themeColorText: string;
  themeColorButton: string;
  isDarkBackground: boolean;
}

export interface PromotionData {
  promo_id: string;
  promo_title: string;
  promo_text_full: string;
  promo_conditions: string | null;
  date_start: Date | null;
  date_end: Date | null;
  locked: boolean;
  promo_img: string | null;
  promo_discount_percentage: number | null;
  promo_discount_amount: number | null;
  promo_min_amount: number | null;
  promo_max_discount: number | null;
  promo_code: string | null;
  promo_usage_limit: number | null;
  promo_used_count: number;
  promo_type: string;
  promo_status: string;
  created_at: Date | null;
  updated_at: Date | null;
}

export interface RewardsData {
  reward_id: string;
  reward_title: string;
  reward_text: string;
  reward_img: string | null;
  points_required: number;
  reward_type: string;
  reward_value: number | null;
  reward_percentage: number | null;
  reward_status: string;
  created_at: Date | null;
  updated_at: Date | null;
}

export interface ProductsData {
  item_id: string;
  item_name: string;
  item_descr: string | null;
  item_price: number;
  item_img: string | null;
  item_status: string;
  created_at: Date | null;
  updated_at: Date | null;
}

export declare function getBusinessProfileLeanData(businessUrlname: string): Promise<BusinessProfileLeanData>;
export declare function getPromotionsData(businessId: string): Promise<PromotionData[]>;
export declare function getRewardsData(businessId: string): Promise<RewardsData[]>;
export declare function getProductsData(businessId: string): Promise<{ businessMenuItems: any[] }>;
export interface ServiceData {
  service_id: string;
  service_title: string;
  service_descr: string | null;
  price_base: number | null;
  price_type: string;
  price_unit: string | null;
  display_order: number | null;
  is_active: boolean;
  category_id: number | null;
  serviceitem: Array<{
    service_item_id: string;
    item_name: string;
    item_description: string | null;
    price_base: number;
    price_type: string;
    price_unit: string | null;
    display_order: number | null;
    is_active: boolean;
  }>;
}

export interface ServiceCategoryData {
  category_id: number;
  category_name: string;
  description: string | null;
}

export interface ServiceRequestServicesData {
  services: ServiceData[];
  categories: ServiceCategoryData[];
}

export declare function getServiceRequestServicesData(businessId: string): Promise<ServiceRequestServicesData>;
