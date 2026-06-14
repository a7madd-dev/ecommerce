export const metadata = {
  title: "Privacy Policy — Store",
  description: "How we collect, use, and protect your information",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
      <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
      <p className="text-muted-foreground mt-3">
        Last updated: January 15, 2024
      </p>

      <div className="mt-12 space-y-10 text-[15px] leading-relaxed text-muted-foreground">
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Information We Collect
          </h2>
          <p>
            We collect information you provide directly when you create an
            account, make a purchase, or contact our support team. This includes
            your name, email address, shipping address, phone number, and
            payment information.
          </p>
          <p className="mt-3">
            We also automatically collect certain information when you visit our
            website, including your IP address, browser type, operating system,
            referring URLs, and information about how you interact with our
            site. We use cookies and similar tracking technologies to collect
            this data.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            How We Use Your Information
          </h2>
          <p>
            We use the information we collect to process your orders, manage
            your account, and provide customer support. We may also use your
            information to send you promotional communications about products,
            services, and events that may interest you.
          </p>
          <p className="mt-3">
            Additionally, we use your data to improve our website, personalize
            your shopping experience, detect and prevent fraud, and comply with
            legal obligations. We may aggregate and anonymize your data for
            analytical purposes.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Information Sharing
          </h2>
          <p>
            We do not sell your personal information to third parties. We may
            share your information with trusted service providers who assist us
            in operating our website, conducting our business, or serving our
            customers, as long as those parties agree to keep this information
            confidential.
          </p>
          <p className="mt-3">
            We may also share your information when required by law, to protect
            our rights, or in connection with a merger, acquisition, or sale of
            assets. Payment information is processed directly by our PCI-DSS
            compliant payment processors.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Data Security
          </h2>
          <p>
            We implement industry-standard security measures to protect your
            personal information, including SSL encryption, secure server
            infrastructure, and regular security audits. However, no method of
            electronic transmission or storage is 100% secure, and we cannot
            guarantee absolute security.
          </p>
          <p className="mt-3">
            We retain your personal information only for as long as necessary to
            fulfill the purposes outlined in this policy, unless a longer
            retention period is required or permitted by law.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Cookies
          </h2>
          <p>
            We use cookies and similar technologies to enhance your browsing
            experience, analyze site traffic, and personalize content. Essential
            cookies are required for the site to function properly, while
            analytics and marketing cookies help us understand how you use our
            site.
          </p>
          <p className="mt-3">
            You can control cookie preferences through your browser settings.
            Disabling certain cookies may limit the functionality of our
            website.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Your Rights
          </h2>
          <p>
            Depending on your jurisdiction, you may have the right to access,
            correct, delete, or export your personal data. You may also have the
            right to object to or restrict certain processing of your
            information. To exercise any of these rights, please contact us
            using the information below.
          </p>
          <p className="mt-3">
            If you have opted in to receive marketing communications, you can
            unsubscribe at any time by clicking the unsubscribe link in any
            email or contacting our support team.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Contact Us
          </h2>
          <p>
            If you have any questions or concerns about this Privacy Policy or
            our data practices, please contact us at{" "}
            <span className="text-foreground font-medium">
              privacy@store.com
            </span>{" "}
            or write to us at: Store Inc., 100 Market Street, Suite 400, San
            Francisco, CA 94105.
          </p>
        </section>
      </div>
    </div>
  );
}
