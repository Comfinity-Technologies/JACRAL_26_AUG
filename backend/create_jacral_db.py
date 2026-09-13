import psycopg

def create_db():
    try:
        conn = psycopg.connect(
            host="localhost",
            port=5432,
            user="postgres",
            password="ARar@123",
            dbname="postgres",
            autocommit=True,
        )
        cur = conn.cursor()
        cur.execute("SELECT 1 FROM pg_database WHERE datname='jacral';")
        exists = cur.fetchone()
        if not exists:
            cur.execute("CREATE DATABASE jacral;")
            print("SUCCESS: Database 'jacral' created successfully!")
        else:
            print("INFO: Database 'jacral' already exists!")
        cur.close()
        conn.close()
    except Exception as e:
        print("ERROR:", e)

if __name__ == "__main__":
    create_db()
