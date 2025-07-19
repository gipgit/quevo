// Central config for all allowed social links in the app

export interface SocialLinkConfig {
  id: string;
  name: string;
  placeholder: string;
  iconPath: string;
}

export const ALLOWED_SOCIAL_LINKS: SocialLinkConfig[] = [
  { id: "tiktok", name: "TikTok", placeholder: "https://tiktok.com/@username", iconPath: "/icons/links-icons/tiktok.svg" },
  { id: "youtube", name: "YouTube", placeholder: "https://youtube.com/channel/yourchannelid", iconPath: "/icons/links-icons/youtube.svg" },
  { id: "instagram", name: "Instagram", placeholder: "https://instagram.com/username", iconPath: "/icons/links-icons/instagram.svg" },
  { id: "twitter", name: "Twitter", placeholder: "https://twitter.com/username", iconPath: "/icons/links-icons/twitter.svg" },
  { id: "facebook", name: "Facebook", placeholder: "https://facebook.com/yourpage", iconPath: "/icons/links-icons/facebook.svg" },
  { id: "whatsapp", name: "WhatsApp", placeholder: "https://wa.me/yourphonenumber", iconPath: "/icons/links-icons/whatsapp.svg" },
  { id: "paypal", name: "PayPal", placeholder: "https://paypal.me/username", iconPath: "/icons/links-icons/paypal.svg" },
  { id: "linkedin", name: "LinkedIn", placeholder: "https://linkedin.com/in/username", iconPath: "/icons/links-icons/linkedin.svg" },
  { id: "shopify", name: "Shopify", placeholder: "https://yourstore.myshopify.com", iconPath: "/icons/links-icons/shopify.svg" },
  { id: "amazon", name: "Amazon", placeholder: "https://www.amazon.com/shop/yourstore", iconPath: "/icons/links-icons/amazon.svg" },
  { id: "patreon", name: "Patreon", placeholder: "https://patreon.com/yourcreator", iconPath: "/icons/links-icons/patreon.svg" },
  { id: "google_reviews", name: "Google Reviews", placeholder: "https://g.page/r/your-business/review", iconPath: "/icons/social/google.svg" },
];
