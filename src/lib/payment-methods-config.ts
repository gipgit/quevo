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
}

export const ALLOWED_PAYMENT_METHODS: PaymentMethodConfig[] = [
  {
    id: "bank_transfer",
    name: "Bank Transfer",
    iconPath: "/icons/payments/bank_transfer.svg",
    fields: [
      { name: "iban", label: "IBAN", type: "text", required: true },
      { name: "account_holder", label: "Account Holder", type: "text", required: true },
      { name: "bank_name", label: "Bank Name", type: "text" },
      { name: "transfer_subject", label: "Transfer Subject", type: "text" },
    ],
  },
  {
    id: "cash",
    name: "Cash",
    iconPath: "/icons/payments/cash.svg",
    fields: [
      { name: "cash_note", label: "Cash Note", type: "text" },
    ],
  },
  {
    id: "pos",
    name: "POS",
    iconPath: "/icons/payments/pos.svg",
    fields: [
      { name: "pos_note", label: "POS Note", type: "text" },
    ],
  },
  {
    id: "paypal",
    name: "PayPal",
    iconPath: "/icons/payments/paypal.svg",
    fields: [
      { name: "paypal_email", label: "PayPal Email", type: "email", required: true },
    ],
  },
  {
    id: "stripe",
    name: "Stripe",
    iconPath: "/icons/payments/stripe.svg",
    fields: [
      { name: "stripe_link", label: "Stripe Payment Link", type: "url", required: true },
    ],
  },
  {
    id: "satispay",
    name: "Satispay",
    iconPath: "/icons/payments/satispay.svg",
    fields: [
      { name: "phone_number", label: "Phone Number", type: "text", required: true },
    ],
  },
  {
    id: "credit_card",
    name: "Credit Card",
    iconPath: "/icons/payments/credit-card.svg",
    fields: [
      { name: "credit_card_info", label: "Credit Card Info", type: "text" },
    ],
  },
  {
    id: "apple_pay",
    name: "Apple Pay",
    iconPath: "/icons/payments/applepay.svg",
    fields: [
      { name: "apple_pay_id", label: "Apple Pay ID", type: "text" },
    ],
  },
  {
    id: "google_pay",
    name: "Google Pay",
    iconPath: "/icons/payments/googlepay.svg",
    fields: [
      { name: "google_pay_id", label: "Google Pay ID", type: "text" },
    ],
  },
  {
    id: "amazon_pay",
    name: "Amazon Pay",
    iconPath: "/icons/payments/amazonpay.svg",
    fields: [
      { name: "amazon_pay_id", label: "Amazon Pay ID", type: "text" },
    ],
  },
];
