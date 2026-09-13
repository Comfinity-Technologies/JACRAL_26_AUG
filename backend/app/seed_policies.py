"""
JACRAL – Policy seeder.
Run once: python -m app.seed_policies
Seeds the four standard policies into the database.
"""
from datetime import datetime
from app.database import SessionLocal
from app.models.policy import Policy

POLICIES = [
    {
        "slug": "privacy",
        "title": "Privacy Policy",
        "content": """<h2>Privacy Policy</h2>
<p>Last updated: January 2025</p>

<p>At JACRAL, we are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, and safeguard your data when you visit our website or make a purchase.</p>

<h3>1. Information We Collect</h3>
<p>We collect information you provide directly to us, such as when you:</p>
<ul>
  <li>Create an account or register on our website</li>
  <li>Place an order or make a purchase</li>
  <li>Subscribe to our newsletter</li>
  <li>Contact our customer support team</li>
</ul>
<p>This may include your name, email address, phone number, delivery address, and payment information.</p>

<h3>2. How We Use Your Information</h3>
<p>We use the information we collect to:</p>
<ul>
  <li>Process and fulfil your orders</li>
  <li>Send you order confirmations and updates</li>
  <li>Respond to your queries and provide customer support</li>
  <li>Send you promotional communications (with your consent)</li>
  <li>Improve our website and services</li>
</ul>

<h3>3. Data Security</h3>
<p>We implement appropriate technical and organisational security measures to protect your personal data against unauthorised access, alteration, disclosure or destruction.</p>

<h3>4. Sharing Your Data</h3>
<p>We do not sell or rent your personal information to third parties. We may share data with trusted service providers who assist us in operating our website and conducting our business, subject to confidentiality agreements.</p>

<h3>5. Your Rights</h3>
<p>You have the right to access, update, or delete your personal information at any time. Contact us at hello@jacral.com to exercise these rights.</p>

<h3>6. Contact Us</h3>
<p>If you have any questions about this Privacy Policy, please contact us at: <strong>hello@jacral.com</strong></p>""",
    },
    {
        "slug": "terms",
        "title": "Terms of Service",
        "content": """<h2>Terms of Service</h2>
<p>Last updated: January 2025</p>

<p>Welcome to JACRAL. By accessing or using our website, you agree to be bound by these Terms of Service. Please read them carefully before placing an order.</p>

<h3>1. Acceptance of Terms</h3>
<p>By using the JACRAL website, you confirm that you are at least 18 years of age and agree to comply with these terms and all applicable laws and regulations.</p>

<h3>2. Products and Availability</h3>
<p>All products listed on our website are subject to availability. We reserve the right to discontinue any product at any time. Prices are subject to change without notice.</p>

<h3>3. Orders and Payments</h3>
<p>When you place an order, you make an offer to purchase the product(s) at the stated price. We reserve the right to refuse or cancel any order for reasons including product unavailability, errors in product or pricing information, or suspected fraudulent activity.</p>
<p>Payments must be completed in full before orders are dispatched. We accept UPI, credit/debit cards, and net banking.</p>

<h3>4. Pricing</h3>
<p>All prices are listed in Indian Rupees (₹) and are inclusive of applicable taxes. Shipping charges are calculated at checkout based on your delivery location and order value.</p>

<h3>5. Intellectual Property</h3>
<p>All content on the JACRAL website, including text, images, logos and graphics, is the property of JACRAL and is protected by applicable intellectual property laws.</p>

<h3>6. Limitation of Liability</h3>
<p>JACRAL shall not be liable for any indirect, incidental, or consequential damages arising from your use of our website or products.</p>

<h3>7. Governing Law</h3>
<p>These terms shall be governed by and construed in accordance with the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Kerala, India.</p>

<h3>8. Changes to Terms</h3>
<p>We reserve the right to update these terms at any time. Continued use of the website after changes constitutes acceptance of the new terms.</p>

<h3>9. Contact</h3>
<p>For any questions regarding these Terms, contact us at: <strong>hello@jacral.com</strong></p>""",
    },
    {
        "slug": "shipping",
        "title": "Shipping Policy",
        "content": """<h2>Shipping Policy</h2>
<p>Last updated: January 2025</p>

<p>Thank you for shopping at JACRAL. We are committed to delivering your order promptly and safely.</p>

<h3>1. Shipping Areas</h3>
<p>We currently deliver across India. Delivery times and charges may vary based on your location.</p>

<h3>2. Shipping Charges</h3>
<ul>
  <li><strong>Orders above ₹500:</strong> Free shipping</li>
  <li><strong>Orders below ₹500:</strong> Flat shipping charge of ₹50</li>
</ul>

<h3>3. Delivery Timeframes</h3>
<ul>
  <li><strong>Metro cities:</strong> 2–4 business days</li>
  <li><strong>Tier-2 & Tier-3 cities:</strong> 4–7 business days</li>
  <li><strong>Remote areas:</strong> 7–10 business days</li>
</ul>
<p>Business days are Monday to Saturday, excluding public holidays.</p>

<h3>4. Order Processing</h3>
<p>Orders are processed within 1–2 business days after payment confirmation. You will receive an email confirmation with tracking details once your order is dispatched.</p>

<h3>5. Tracking Your Order</h3>
<p>Once your order is shipped, you will receive a tracking number via email and SMS. You can track your shipment through your account or the courier's website.</p>

<h3>6. Delivery Attempts</h3>
<p>Our courier partner will make up to 2 delivery attempts. If delivery is unsuccessful, the package will be returned to our warehouse and you will be contacted to reschedule.</p>

<h3>7. Damaged or Lost Shipments</h3>
<p>If your order arrives damaged or is lost in transit, please contact us within 24 hours of the expected delivery date at <strong>hello@jacral.com</strong> with your order number and photographs (if applicable).</p>""",
    },
    {
        "slug": "return",
        "title": "Return & Refund Policy",
        "content": """<h2>Return & Refund Policy</h2>
<p>Last updated: January 2025</p>

<p>We want you to be completely satisfied with your JACRAL purchase. If you are not happy with your order, we are here to help.</p>

<h3>1. Return Eligibility</h3>
<p>You may return products within <strong>7 days</strong> of the delivery date, provided:</p>
<ul>
  <li>The product is unused and in its original packaging</li>
  <li>The product is not a perishable item (fresh produce, opened food items)</li>
  <li>The product was not purchased during a final sale or clearance event</li>
  <li>Proof of purchase (order number or receipt) is provided</li>
</ul>

<h3>2. Non-Returnable Items</h3>
<p>The following items cannot be returned:</p>
<ul>
  <li>Perishable food products once opened</li>
  <li>Products damaged due to misuse or improper storage</li>
  <li>Items marked as "Non-Returnable" on the product page</li>
</ul>

<h3>3. How to Initiate a Return</h3>
<p>To start a return:</p>
<ol>
  <li>Email us at <strong>hello@jacral.com</strong> with your order number and reason for return</li>
  <li>Our team will review your request within 1–2 business days</li>
  <li>If approved, we will provide return shipping instructions</li>
</ol>

<h3>4. Refund Process</h3>
<p>Once we receive and inspect the returned item, we will notify you of the approval or rejection of your refund.</p>
<ul>
  <li><strong>Approved refunds</strong> will be processed within 5–7 business days to your original payment method</li>
  <li>UPI and bank transfer refunds may take an additional 2–3 business days to reflect in your account</li>
  <li>Original shipping charges are non-refundable unless the return is due to a defective or incorrect product</li>
</ul>

<h3>5. Defective or Wrong Products</h3>
<p>If you received a defective, damaged, or incorrect product, please contact us within 48 hours of delivery with photographs. We will arrange a replacement or full refund at no additional cost to you.</p>

<h3>6. Exchanges</h3>
<p>We do not offer direct product exchanges at this time. If you wish to exchange a product, please return it and place a new order.</p>

<h3>7. Contact</h3>
<p>For any return or refund queries, reach us at: <strong>hello@jacral.com</strong></p>""",
    },
]


def seed_policies():
    db = SessionLocal()
    try:
        for data in POLICIES:
            existing = db.query(Policy).filter(Policy.slug == data["slug"]).first()
            if existing:
                existing.title = data["title"]
                existing.content = data["content"]
                existing.is_active = True
                existing.updated_at = datetime.utcnow()
                print(f"  [UPDATED] policy: {data['slug']}")
            else:
                policy = Policy(**data)
                db.add(policy)
                print(f"  [CREATED] policy: {data['slug']}")
        db.commit()
        print("[SUCCESS] All policies seeded successfully.")
    except Exception as e:
        db.rollback()
        print(f"[ERROR] Error seeding policies: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_policies()
