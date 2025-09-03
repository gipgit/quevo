// Central config for all allowed payment methods in the app

export interface PaymentMethodField {
  name: string;
  label: string;
  type: string; // e.g. 'text', 'email', 'number', etc.
  placeholder?: string;
  required?: boolean;
}

export interface PaymentMethodConfig {
  id: string;
  name: string;
  iconPath: string;
  description?: string;
  fields?: PaymentMethodField[];
  category: 'online' | 'in-person';
}

export interface PaymentMethodCategory {
  id: 'online' | 'in-person';
  name: string;
  description: string;
}

export const PAYMENT_METHOD_CATEGORIES: PaymentMethodCategory[] = [
  {
    id: 'online',
    name: 'For Online Payments',
    description: 'Payment methods available for online transactions'
  },
  {
    id: 'in-person',
    name: 'For Payments in Person',
    description: 'Payment methods available for in-person transactions'
  }
];

export const ALLOWED_PAYMENT_METHODS: PaymentMethodConfig[] = [
  {
    id: "bank_transfer",
    name: "Bank Transfer",
    iconPath: "/icons/payments/bank_transfer.svg",
    category: "online",
    fields: [
      { name: "iban", label: "IBAN", type: "text", required: true },
      { name: "account_holder", label: "Account Holder", type: "text", required: true },
      { name: "bank_name", label: "Bank Name", type: "text" },
    ],
  },
  {
    id: "cash",
    name: "Cash",
    iconPath: "/icons/payments/cash.svg",
    category: "in-person",
    fields: [
      { name: "cash_note", label: "Cash Note", type: "text" },
    ],
  },
  {
    id: "pos",
    name: "POS",
    iconPath: "/icons/payments/pos.svg",
    category: "in-person",
    fields: [
      { name: "pos_note", label: "POS Note", type: "text" },
    ],
  },
  {
    id: "paypal",
    name: "PayPal",
    iconPath: "/icons/payments/paypal.svg",
    category: "online",
    fields: [
      { name: "paypal_email", label: "PayPal Email", type: "email", required: true },
    ],
  },
  {
    id: "stripe",
    name: "Stripe",
    iconPath: "/icons/payments/stripe.svg",
    category: "online",
    fields: [
      { name: "stripe_link", label: "Stripe Payment Link", type: "url", required: true },
    ],
  },
  {
    id: "satispay",
    name: "Satispay",
    iconPath: "/icons/payments/satispay.svg",
    category: "online",
    fields: [
      { name: "phone_number", label: "Phone Number", type: "text", required: true },
    ],
  },
  {
    id: "credit_card",
    name: "Credit Card",
    iconPath: "/icons/payments/credit-card.svg",
    category: "in-person",
    fields: [
      { name: "credit_card_info", label: "Credit Card Info", type: "text" },
    ],
  },
  {
    id: "apple_pay",
    name: "Apple Pay",
    iconPath: "/icons/payments/applepay.svg",
    category: "online",
    fields: [
      { name: "apple_pay_id", label: "Apple Pay ID", type: "text" },
    ],
  },
  {
    id: "google_pay",
    name: "Google Pay",
    iconPath: "/icons/payments/googlepay.svg",
    category: "online",
    fields: [
      { name: "google_pay_id", label: "Google Pay ID", type: "text" },
    ],
  },
  {
    id: "amazon_pay",
    name: "Amazon Pay",
    iconPath: "/icons/payments/amazonpay.svg",
    category: "online",
    fields: [
      { name: "amazon_pay_id", label: "Amazon Pay ID", type: "text" },
    ],
  },
  {
    id: "klarna",
    name: "Klarna",
    iconPath: "/icons/payments/klarna.svg",
    category: "online",
    fields: [
      { name: "klarna_merchant_id", label: "Klarna Merchant ID", type: "text", required: true },
      { name: "klarna_public_key", label: "Klarna Public Key", type: "text" },
    ],
  },
  {
    id: "sofort",
    name: "Sofort",
    iconPath: "/icons/payments/sofort.svg",
    category: "online",
    fields: [
      { name: "sofort_merchant_id", label: "Sofort Merchant ID", type: "text", required: true },
    ],
  },
  {
    id: "ideal",
    name: "iDEAL",
    iconPath: "/icons/payments/ideal.svg",
    category: "online",
    fields: [
      { name: "ideal_merchant_id", label: "iDEAL Merchant ID", type: "text", required: true },
    ],
  },
  {
    id: "bancontact",
    name: "Bancontact",
    iconPath: "/icons/payments/bancontact.svg",
    category: "online",
    fields: [
      { name: "bancontact_merchant_id", label: "Bancontact Merchant ID", type: "text", required: true },
    ],
  },
  {
    id: "giropay",
    name: "Giropay",
    iconPath: "/icons/payments/giropay.svg",
    category: "online",
    fields: [
      { name: "giropay_merchant_id", label: "Giropay Merchant ID", type: "text", required: true },
    ],
  },
  {
    id: "eps",
    name: "EPS",
    iconPath: "/icons/payments/eps.svg",
    category: "online",
    fields: [
      { name: "eps_merchant_id", label: "EPS Merchant ID", type: "text", required: true },
    ],
  },
  {
    id: "multibanco",
    name: "Multibanco",
    iconPath: "/icons/payments/multibanco.svg",
    category: "online",
    fields: [
      { name: "multibanco_merchant_id", label: "Multibanco Merchant ID", type: "text", required: true },
    ],
  },
  {
    id: "trustly",
    name: "Trustly",
    iconPath: "/icons/payments/trustly.svg",
    category: "online",
    fields: [
      { name: "trustly_merchant_id", label: "Trustly Merchant ID", type: "text", required: true },
    ],
  },
  {
    id: "paysafecard",
    name: "Paysafecard",
    iconPath: "/icons/payments/paysafecard.svg",
    category: "online",
    fields: [
      { name: "paysafecard_merchant_id", label: "Paysafecard Merchant ID", type: "text", required: true },
    ],
  },
  {
    id: "skrill",
    name: "Skrill",
    iconPath: "/icons/payments/skrill.svg",
    category: "online",
    fields: [
      { name: "skrill_merchant_id", label: "Skrill Merchant ID", type: "text", required: true },
      { name: "skrill_email", label: "Skrill Email", type: "email" },
    ],
  },
  {
    id: "neteller",
    name: "Neteller",
    iconPath: "/icons/payments/neteller.svg",
    category: "online",
    fields: [
      { name: "neteller_merchant_id", label: "Neteller Merchant ID", type: "text", required: true },
    ],
  },
  {
    id: "rapid_transfer",
    name: "Rapid Transfer",
    iconPath: "/icons/payments/rapid-transfer.svg",
    category: "online",
    fields: [
      { name: "rapid_transfer_merchant_id", label: "Rapid Transfer Merchant ID", type: "text", required: true },
    ],
  },
  {
    id: "mybank",
    name: "MyBank",
    iconPath: "/icons/payments/mybank.svg",
    category: "online",
    fields: [
      { name: "mybank_merchant_id", label: "MyBank Merchant ID", type: "text", required: true },
    ],
  },
  {
    id: "bpay",
    name: "BPAY",
    iconPath: "/icons/payments/bpay.svg",
    category: "online",
    fields: [
      { name: "bpay_biller_code", label: "BPAY Biller Code", type: "text", required: true },
      { name: "bpay_customer_reference", label: "BPAY Customer Reference", type: "text" },
    ],
  },
];

// Utility functions for working with payment method categories
export const getPaymentMethodsByCategory = (category: 'online' | 'in-person'): PaymentMethodConfig[] => {
  return ALLOWED_PAYMENT_METHODS.filter(method => method.category === category);
};

export const getPaymentMethodById = (id: string): PaymentMethodConfig | undefined => {
  return ALLOWED_PAYMENT_METHODS.find(method => method.id === id);
};

export const getCategoryById = (id: 'online' | 'in-person'): PaymentMethodCategory | undefined => {
  return PAYMENT_METHOD_CATEGORIES.find(category => category.id === id);
};
