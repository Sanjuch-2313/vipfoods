import { Link } from "react-router-dom";

const infoMap = {
  about: {
    kicker: "About us",
    title: "Fresh food, honest sourcing, and family values",
    paragraphs: [
      "VIP Foods brings farm-fresh fruits, vegetables, pickles, snacks, and spices from trusted producers directly to your home.",
      "We focus on quality, freshness, and everyday convenience so you can enjoy wholesome ingredients without compromising on taste or trust.",
      "From family kitchens to your doorstep, we keep our promises simple: real food, fair pricing, and reliable service.",
    ],
    points: [
      "100% fresh produce, sourced with care",
      "Fast delivery across the city",
      "Quality-first packaging and support",
    ],
  },
  blog: {
    kicker: "Blog",
    title: "Stories, tips, and seasonal food inspiration",
    paragraphs: [
      "Discover simple cooking ideas, kitchen tips, seasonal produce highlights, and stories behind the ingredients we love to bring to your table.",
      "Our blog is built for food lovers who want practical advice and fresh inspiration for everyday healthy meals.",
    ],
    points: [
      "Seasonal produce guides",
      "Healthy meal ideas",
      "Traditional recipes and modern twists",
    ],
  },
  terms: {
    kicker: "Terms",
    title: "Terms & Conditions",
    paragraphs: [
      "By placing an order with VIP Foods, you agree to provide correct contact details and to receive products at the address selected during checkout.",
      "All product availability, pricing, and delivery estimates are subject to change based on supply and local conditions.",
      "We reserve the right to cancel or amend an order if the item is unavailable or if there is a suspicious or incomplete order request.",
    ],
    points: [
      "Orders are subject to stock availability",
      "Delivery timing may vary due to traffic or weather",
      "Payments must be completed before dispatch is finalized",
    ],
  },
  privacy: {
    kicker: "Privacy",
    title: "Privacy Policy",
    paragraphs: [
      "We only use your personal data to process orders, deliver products, and improve your shopping experience.",
      "Your contact and address information is never sold or shared with third parties without your consent, except where required for payment or delivery support.",
      "We keep our systems protected and use standard industry practices to secure your information.",
    ],
    points: [
      "Data is used only for order and delivery support",
      "Payment details are handled securely through trusted gateways",
      "You can contact us anytime to update your account information",
    ],
  },
  refund: {
    kicker: "Returns",
    title: "Refund and Returns Policy",
    paragraphs: [
      "We want every order to meet your expectations. If a product is damaged, incorrect, or unsatisfactory, please contact us immediately after delivery.",
      "Perishable products are reviewed carefully, and valid complaints are resolved with replacement, credit, or refund depending on the issue.",
      "Refunds are processed once the issue is verified and approved by our support team.",
    ],
    points: [
      "Report quality issues within a reasonable time",
      "Refunds are reviewed before approval",
      "Replacement is preferred for fresh or perishable items",
    ],
  },
  shipping: {
    kicker: "Shipping",
    title: "Shipping & Cancellation Policy",
    paragraphs: [
      "VIP Foods aims to deliver orders promptly within the stated service area and timeline for the selected outlet.",
      "If a delivery is delayed due to weather, traffic, or unforeseen circumstances, we will update you as soon as possible.",
      "Orders can be cancelled before dispatch. Once dispatched, cancellations depend on delivery status and our support team approval.",
    ],
    points: [
      "Delivery windows may vary by location",
      "Late deliveries are communicated directly to customers",
      "Cancellation depends on the status of the order",
    ],
  },
};

export default function InfoPage({ page = "about" }) {
  const content = infoMap[page] || infoMap.about;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-4xl rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-green-600">{content.kicker}</p>
        <h1 className="mt-2 text-3xl font-black text-gray-900 sm:text-4xl">{content.title}</h1>

        <div className="mt-6 space-y-4 text-sm leading-7 text-gray-600 sm:text-base">
          {content.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        {content.points && (
          <ul className="mt-6 space-y-3 rounded-[22px] border border-gray-200 bg-gray-50 p-5 text-sm text-gray-700">
            {content.points.map((point) => (
              <li key={point} className="flex items-start gap-3">
                <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-green-600" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/shop"
            className="rounded-full bg-green-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-green-700"
          >
            Shop now
          </Link>
          <Link
            to="/profile"
            className="rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-bold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
          >
            My account
          </Link>
        </div>
      </div>
    </div>
  );
}
