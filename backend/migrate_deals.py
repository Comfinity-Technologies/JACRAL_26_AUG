import sys
sys.path.insert(0, '.')
from app.database import engine
from sqlalchemy import text, inspect

inspector = inspect(engine)
cols = [c['name'] for c in inspector.get_columns('deals')]

with engine.connect() as conn:
    if 'bg_color' not in cols:
        conn.execute(text("ALTER TABLE deals ADD COLUMN bg_color VARCHAR(20)"))
        print("Added bg_color")
    else:
        print("bg_color already exists")

    if 'text_color' not in cols:
        conn.execute(text("ALTER TABLE deals ADD COLUMN text_color VARCHAR(20)"))
        print("Added text_color")
    else:
        print("text_color already exists")
    
    conn.commit()
    print("Migration complete")
