"""
JACRAL – CMS Seed Data.
Seeds default brand settings, 3 hero slides, and landing page sections
with documented Jacral facts:
- Primary Product: Jacral Jackfruit Cereal
- Unripe jackfruit bulbs and seeds
- Documented Claims: 20% Protein, 25% Fiber, Zero Sugar
"""
import logging
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.content import WebsiteSetting, LandingPageSlide, LandingPageSection
from app.models.review import CustomerReview

logger = logging.getLogger(__name__)


def seed_cms_content():
    db: Session = SessionLocal()
    try:
        # 1. Seed Website Settings
        settings_defaults = {
            "brand_name": "JACRAL",
            "tagline": "Pure Jackfruit Goodness · 100% Natural",
            "logo_url": None,
            "draft_logo_url": None,
            "favicon_url": None,
            "draft_favicon_url": None,
            "contact_email": "hello@jacral.com",
            "contact_phone": "+91 98765 43210",
            "contact_address": "Bengaluru, Karnataka, India",
            "social_instagram": "https://instagram.com/jacralfoods",
            "social_facebook": "https://facebook.com/jacralfoods",
            "social_twitter": "https://twitter.com/jacralfoods",
            "social_linkedin": "https://linkedin.com/company/jacral",
        }

        for key, val in settings_defaults.items():
            setting = db.query(WebsiteSetting).filter(WebsiteSetting.key == key).first()
            if not setting:
                setting = WebsiteSetting(
                    key=key,
                    value=val,
                    draft_value=val,
                    is_published=True,
                )
                db.add(setting)

        # 2. Seed 3 Default Hero Slides
        slides_count = db.query(LandingPageSlide).count()
        if slides_count == 0:
            slide_1 = LandingPageSlide(
                slide_number=1,
                display_order=1,
                # Published
                title="THE JACKFRUIT REVOLUTION",
                subtitle="100% UNRIPE BULBS & SEEDS",
                description="Fuel your day with India's cleanest super-cereal. 20% natural protein, 25% prebiotic fiber, zero added sugar.",
                cta_text="SHOP CEREAL",
                cta_url="/shop",
                secondary_cta_text="OUR STORY",
                secondary_cta_url="#story",
                image_url=None,
                mobile_image_url=None,
                is_active=True,
                # Draft
                draft_title="THE JACKFRUIT REVOLUTION",
                draft_subtitle="100% UNRIPE BULBS & SEEDS",
                draft_description="Fuel your day with India's cleanest super-cereal. 20% natural protein, 25% prebiotic fiber, zero added sugar.",
                draft_cta_text="SHOP CEREAL",
                draft_cta_url="/shop",
                draft_secondary_cta_text="OUR STORY",
                draft_secondary_cta_url="#story",
                draft_image_url=None,
                draft_mobile_image_url=None,
                draft_is_active=True,
                is_published=True,
            )

            slide_2 = LandingPageSlide(
                slide_number=2,
                display_order=2,
                # Published
                title="CLEAN NUTRITION, ZERO SUGAR",
                subtitle="20% PROTEIN · 25% FIBER",
                description="Milled from unripened whole jackfruit bulbs and nutrient-rich seeds. Naturally low glycemic index for sustained energy.",
                cta_text="EXPLORE BENEFITS",
                cta_url="#nutrition",
                secondary_cta_text="ORDER NOW",
                secondary_cta_url="/shop",
                image_url=None,
                mobile_image_url=None,
                is_active=True,
                # Draft
                draft_title="CLEAN NUTRITION, ZERO SUGAR",
                draft_subtitle="20% PROTEIN · 25% FIBER",
                draft_description="Milled from unripened whole jackfruit bulbs and nutrient-rich seeds. Naturally low glycemic index for sustained energy.",
                draft_cta_text="EXPLORE BENEFITS",
                draft_cta_url="#nutrition",
                draft_secondary_cta_text="ORDER NOW",
                draft_secondary_cta_url="/shop",
                draft_image_url=None,
                draft_mobile_image_url=None,
                draft_is_active=True,
                is_published=True,
            )

            slide_3 = LandingPageSlide(
                slide_number=3,
                display_order=3,
                # Published
                title="SUSTAINABLE HARVEST, PURE TASTE",
                subtitle="FARM TO TABLE MORNING ESSENTIAL",
                description="Wild-harvested with local farming communities. Gentle milling preserves essential micronutrients and authentic flavor.",
                cta_text="SEE HOW IT'S MADE",
                cta_url="#how-it-is-made",
                secondary_cta_text="WHOLESALE INQUIRY",
                secondary_cta_url="#b2b",
                image_url=None,
                mobile_image_url=None,
                is_active=True,
                # Draft
                draft_title="SUSTAINABLE HARVEST, PURE TASTE",
                draft_subtitle="FARM TO TABLE MORNING ESSENTIAL",
                draft_description="Wild-harvested with local farming communities. Gentle milling preserves essential micronutrients and authentic flavor.",
                draft_cta_text="SEE HOW IT'S MADE",
                draft_cta_url="#how-it-is-made",
                draft_secondary_cta_text="WHOLESALE INQUIRY",
                draft_secondary_cta_url="#b2b",
                draft_image_url=None,
                draft_mobile_image_url=None,
                draft_is_active=True,
                is_published=True,
            )

            db.add_all([slide_1, slide_2, slide_3])

        # 3. Seed Default Landing Page Sections
        sections_data = [
            {
                "section_key": "story",
                "title": "THE JACRAL STORY",
                "subtitle": "REDEFINING BREAKFAST WITH JACKFRUIT",
                "content": {
                    "heading": "From Forgotten Super-Fruit to Daily Morning Staple",
                    "paragraph_1": "For centuries, India's jackfruit tree has stood as a bastion of resilience and biodiversity. While ripe jackfruit is renowned for its sweetness, it is the unripe green jackfruit and its nutrient-dense seeds that hold profound nutritional power.",
                    "paragraph_2": "JACRAL was created with a clear purpose: transform sustainably harvested unripe jackfruit bulbs and seeds into a clean, modern breakfast cereal that delivers uncompromised nourishment.",
                    "tag": "100% SUSTAINABLE HARVEST"
                }
            },
            {
                "section_key": "why_jackfruit",
                "title": "WHY JACKFRUIT?",
                "subtitle": "THE TROPICAL POWERHOUSE",
                "content": {
                    "points": [
                        {
                            "title": "Unripe Bulbs & Seeds",
                            "desc": "Unlike sugary breakfast grains, unripe jackfruit offers a neutral, versatile foundation packed with resistant starch and micronutrients."
                        },
                        {
                            "title": "Low Glycemic Index",
                            "desc": "Gradual carbohydrate absorption ensures sustained energy without insulin spikes or mid-day crashes."
                        },
                        {
                            "title": "Naturally High Satiety",
                            "desc": "High complex fiber keeps you full and satisfied throughout busy mornings."
                        },
                        {
                            "title": "Climate-Resilient Tree Crop",
                            "desc": "Jackfruit trees require minimal irrigation, require zero chemicals, and sequester carbon naturally."
                        }
                    ]
                }
            },
            {
                "section_key": "nutrition",
                "title": "NUTRITION & PRODUCT BENEFITS",
                "subtitle": "DOCUMENTED NUTRITIONAL PROFILE",
                "content": {
                    "metrics": [
                        {
                            "value": "20%",
                            "label": "Protein",
                            "desc": "Naturally derived from jackfruit seeds to nourish muscles and sustain energy."
                        },
                        {
                            "value": "25%",
                            "label": "Fiber",
                            "desc": "Prebiotic dietary fiber supporting optimal digestion and daily gut health."
                        },
                        {
                            "value": "0g",
                            "label": "Zero Sugar",
                            "desc": "No added refined sugars, artificial sweeteners, or hidden syrups."
                        }
                    ],
                    "footnote": "Claims verified based on unripe jackfruit bulbs and seed flour composition."
                }
            },
            {
                "section_key": "how_it_is_made",
                "title": "HOW IT IS MADE",
                "subtitle": "FROM WILD GROVES TO YOUR BOWL",
                "content": {
                    "steps": [
                        {
                            "step": "01",
                            "title": "Wild Harvest",
                            "desc": "Harvesting mature green jackfruit at peak nutrient density before sugars form."
                        },
                        {
                            "step": "02",
                            "title": "Bulb & Seed Separation",
                            "desc": "Hand-separated bulbs and seeds are cleaned with purified water."
                        },
                        {
                            "step": "03",
                            "title": "Low-Temperature Milling",
                            "desc": "Dehydrated gently at controlled temperatures to lock in enzymes, fiber, and protein."
                        },
                        {
                            "step": "04",
                            "title": "Clean Packaging",
                            "desc": "Nitrogen-flushed to preserve freshness naturally without synthetic preservatives."
                        }
                    ]
                }
            },
            {
                "section_key": "b2b",
                "title": "B2B & WHOLESALE",
                "subtitle": "PARTNER WITH JACRAL",
                "content": {
                    "heading": "Supply Jacral Jackfruit Cereal to Your Business",
                    "description": "We supply specialty cafes, boutique hotels, wellness centers, and organic retail chains across India with bulk and wholesale packaging.",
                    "contact_email": "wholesale@jacral.com",
                    "cta_text": "INQUIRE FOR BULK SUPPLY"
                }
            },
            {
                "section_key": "subscribe",
                "title": "SUBSCRIBE & SAVE",
                "subtitle": "YOUR DAILY NUTRITION DELIVERED",
                "content": {
                    "heading": "Never Run Out of Wholesome Morning Fuel",
                    "discount_text": "Save 15% on Every Monthly Delivery",
                    "perks": ["Free Express Shipping", "Cancel or Pause Anytime", "Exclusive Batch Access"],
                    "cta_text": "SUBSCRIBE NOW"
                }
            },
            {
                "section_key": "faq",
                "title": "FREQUENTLY ASKED QUESTIONS",
                "subtitle": "EVERYTHING YOU NEED TO KNOW",
                "content": {
                    "faqs": [
                        {
                            "q": "What is Jacral Jackfruit Cereal made of?",
                            "a": "It is made entirely from whole unripe jackfruit bulbs and seeds, retaining the natural 20% protein and 25% dietary fiber without added sugars."
                        },
                        {
                            "q": "Does it taste like sweet ripe jackfruit?",
                            "a": "No! Because we harvest unripe green jackfruit before the natural sugars develop, it has a neutral, gently nutty, and wholesome cereal taste that pairs perfectly with milk, plant milk, or yogurt."
                        },
                        {
                            "q": "Is there any added sugar or preservative?",
                            "a": "Zero. We have 0g added sugar, no artificial preservatives, and no synthetic flavors."
                        },
                        {
                            "q": "How should I store Jacral Cereal?",
                            "a": "Keep in a cool, dry place. Once opened, seal the zip-lock pouch or store in an airtight container for up to 9 months."
                        }
                    ]
                }
            },
            {
                "section_key": "how_to_use",
                "title": "HOW TO ENJOY",
                "subtitle": "EFFORTLESS MORNING NOURISHMENT",
                "content": {
                    "heading": "Ready in Under 2 Minutes",
                    "description": "Clean, quick, and customizable. Fuel up the smart way every morning.",
                    "steps": [
                        {
                            "step": "01",
                            "title": "Pour Cereal",
                            "desc": "Add 40-50g of Jacral Jackfruit Cereal into your breakfast bowl.",
                            "image_url": None
                        },
                        {
                            "step": "02",
                            "title": "Add Milk or Plant Milk",
                            "desc": "Pour warm or chilled milk, almond milk, or oat milk over the cereal.",
                            "image_url": None
                        },
                        {
                            "step": "03",
                            "title": "Top & Customize",
                            "desc": "Add your favorite fresh berries, nuts, seeds, or a drizzle of raw honey.",
                            "image_url": None
                        },
                        {
                            "step": "04",
                            "title": "Savor & Energize",
                            "desc": "Enjoy crisp texture and clean, steady energy that powers your day.",
                            "image_url": None
                        }
                    ]
                }
            },
            {
                "section_key": "products_section",
                "title": "OUR PRODUCTS",
                "subtitle": "Discover the goodness of jackfruit, crafted for everyday living.",
                "content": {
                    "badge_text": "NATURE'S HARVEST INNOVATION",
                    "protein_claim": "20% PROTEIN",
                    "fiber_claim": "25% FIBER",
                    "sugar_claim": "0 ADDED SUGAR",
                    "trust_badge_1": "100% Clean Jackfruit",
                    "trust_badge_2": "No Artificial Preservatives",
                    "trust_badge_3": "Ancient Indian Millets",
                    "shop_cta_text": "View Full Shop"
                }
            }
        ]

        for sec in sections_data:
            existing = db.query(LandingPageSection).filter(LandingPageSection.section_key == sec["section_key"]).first()
            if not existing:
                new_sec = LandingPageSection(
                    section_key=sec["section_key"],
                    title=sec["title"],
                    subtitle=sec["subtitle"],
                    content=sec["content"],
                    draft_content=sec["content"],
                    is_active=True,
                    draft_is_active=True,
                    is_published=True,
                )
                db.add(new_sec)

        # Seed sample customer reviews if table is empty
        reviews_count = db.query(CustomerReview).count()
        if reviews_count == 0:
            sample_reviews = [
                CustomerReview(
                    customer_name="Dr. Priya Sharma",
                    customer_location="Bengaluru",
                    review_text="As a nutritionist, I am thoroughly impressed by Jacral. 20% natural protein and zero sugar in a breakfast cereal made from unripe jackfruit is a game changer for metabolic health.",
                    rating=5,
                    display_order=1,
                    is_active=True,
                    is_published=True,
                ),
                CustomerReview(
                    customer_name="Vikram Menon",
                    customer_location="Kochi",
                    review_text="The taste is wonderful! It's nutty, wholesome, and keeps me genuinely full until lunch. Knowing it's made from jackfruit bulbs and seeds makes it even better.",
                    rating=5,
                    display_order=2,
                    is_active=True,
                    is_published=True,
                ),
                CustomerReview(
                    customer_name="Ananya Roy",
                    customer_location="Mumbai",
                    review_text="Finally a cereal without hidden sugars or artificial fluff. Love pairing it with cold almond milk and chia seeds in the morning.",
                    rating=5,
                    display_order=3,
                    is_active=True,
                    is_published=True,
                ),
            ]
            db.add_all(sample_reviews)

        db.commit()
        logger.info("CMS content seeded successfully.")
    except Exception as e:
        db.rollback()
        logger.error(f"Error seeding CMS content: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    seed_cms_content()
