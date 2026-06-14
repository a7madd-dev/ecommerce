export const metadata = {
  title: "Terms of Service — Store",
  description: "Terms and conditions for using our services",
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
      <h1 className="text-4xl font-bold tracking-tight">Terms of Service</h1>
      <p className="text-muted-foreground mt-3">Effective: January 15, 2024</p>

      <div className="mt-12 space-y-10 text-[15px] leading-relaxed text-muted-foreground">
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Acceptance of Terms
          </h2>
          <p>
            By accessing and using this website, you accept and agree to be
            bound by these Terms of Service and our Privacy Policy. If you do
            not agree to these terms, you should not use our website or
            services. We reserve the right to modify these terms at any time,
            and your continued use of the site constitutes acceptance of any
            changes.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Use of Service
          </h2>
          <p>
            You agree to use our service only for lawful purposes and in
            accordance with these terms. You must not use the service in any way
            that could damage, disable, or impair the site or interfere with any
            other party&apos;s use. You are prohibited from attempting to gain
            unauthorized access to any part of the service.
          </p>
          <p className="mt-3">
            We reserve the right to refuse service, terminate accounts, or
            cancel orders at our sole discretion, including if we believe that
            your conduct violates these terms or is harmful to other users, us,
            or third parties.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            User Accounts
          </h2>
          <p>
            When you create an account, you must provide accurate and complete
            information. You are responsible for maintaining the confidentiality
            of your account credentials and for all activities that occur under
            your account. You agree to notify us immediately of any unauthorized
            use of your account.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Products & Pricing
          </h2>
          <p>
            We make every effort to display product descriptions, images, and
            pricing accurately. However, we do not warrant that product
            descriptions or other content is accurate, complete, or
            error-free. Prices are subject to change without notice. We reserve
            the right to correct any errors in pricing and to cancel any orders
            placed at incorrect prices.
          </p>
          <p className="mt-3">
            All prices are displayed in US Dollars unless otherwise stated.
            Applicable taxes and shipping costs will be calculated and displayed
            during checkout.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Orders & Payment
          </h2>
          <p>
            By placing an order, you are making an offer to purchase a product.
            All orders are subject to acceptance and availability. We may refuse
            or cancel any order for any reason, including limitations on
            quantities available for purchase, inaccuracies in product or
            pricing information, or problems identified by our fraud detection
            systems.
          </p>
          <p className="mt-3">
            We accept major credit cards, debit cards, and selected digital
            payment methods. Payment is processed securely through our
            PCI-compliant payment processors. Your financial information is
            never stored on our servers.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Shipping & Delivery
          </h2>
          <p>
            Shipping times are estimates and are not guaranteed. We are not
            responsible for delays caused by carriers, customs, or events beyond
            our control. Risk of loss and title for items purchased pass to you
            upon delivery to the carrier. Free shipping is available on orders
            over $50 within the continental United States.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Returns & Refunds
          </h2>
          <p>
            We offer a 30-day return policy for most items. Products must be
            returned in their original condition with all tags and packaging
            intact. Refunds will be processed to the original payment method
            within 5-10 business days after we receive the returned item. Custom
            or personalized products are not eligible for return unless
            defective.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Intellectual Property
          </h2>
          <p>
            All content on this website, including text, graphics, logos,
            images, and software, is the property of Store Inc. or its content
            suppliers and is protected by intellectual property laws. You may
            not reproduce, distribute, modify, or create derivative works from
            any content without our prior written consent.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Limitation of Liability
          </h2>
          <p>
            To the fullest extent permitted by law, Store Inc. shall not be
            liable for any indirect, incidental, special, consequential, or
            punitive damages arising from your use of our services. Our total
            liability shall not exceed the amount you paid for the product or
            service giving rise to the claim.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Governing Law
          </h2>
          <p>
            These terms shall be governed by and construed in accordance with
            the laws of the State of California, without regard to its conflict
            of law provisions. Any disputes arising under these terms shall be
            subject to the exclusive jurisdiction of the courts located in San
            Francisco, California.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Contact
          </h2>
          <p>
            For questions about these Terms of Service, please contact us at{" "}
            <span className="text-foreground font-medium">
              legal@store.com
            </span>{" "}
            or write to: Store Inc., 100 Market Street, Suite 400, San
            Francisco, CA 94105.
          </p>
        </section>
      </div>
    </div>
  );
}
