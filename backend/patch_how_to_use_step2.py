"""
JACRAL – Patch script to update HowToUse step 2 title and description
in the existing database records.

Run this once with:
    python patch_how_to_use_step2.py
"""
import logging
from app.database import SessionLocal
from app.models.how_to_use import HowToUseStep
from app.models.content import LandingPageSection

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def patch_step2():
    db = SessionLocal()
    try:
        # 1. Update HowToUseStep record (step_number=2)
        step = db.query(HowToUseStep).filter(HowToUseStep.step_number == 2).first()
        if step:
            old_title = step.title
            old_desc = step.description
            step.title = "ADD MILK"
            step.description = "Pour warm or chilled milk over the cereal."
            logger.info(f"Updated HowToUseStep id={step.id}:")
            logger.info(f"  Title: '{old_title}' -> '{step.title}'")
            logger.info(f"  Desc:  '{old_desc}' -> '{step.description}'")
        else:
            logger.warning("No HowToUseStep with step_number=2 found.")

        # 2. Update the LandingPageSection 'how_to_use' draft_content and content
        section = db.query(LandingPageSection).filter(
            LandingPageSection.section_key == "how_to_use"
        ).first()
        if section:
            def patch_steps(content_dict):
                if not content_dict:
                    return content_dict
                steps = content_dict.get("steps", [])
                for i, s in enumerate(steps):
                    if (s.get("step") == "02" or
                            (isinstance(s, dict) and s.get("step_number") == 2)):
                        steps[i] = {
                            **s,
                            "title": "Add Milk",
                            "desc": "Pour warm or chilled milk over the cereal.",
                        }
                content_dict["steps"] = steps
                return content_dict

            if section.content:
                section.content = patch_steps(dict(section.content))
            if section.draft_content:
                section.draft_content = patch_steps(dict(section.draft_content))
            logger.info("Updated LandingPageSection 'how_to_use' step 2 content.")
        else:
            logger.warning("No LandingPageSection 'how_to_use' found.")

        db.commit()
        logger.info("Patch completed successfully.")

    except Exception as e:
        db.rollback()
        logger.error(f"Patch failed: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    patch_step2()
