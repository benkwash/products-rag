DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'figtech_db') THEN
        CREATE DATABASE figtech_db;
    END IF;
END $$;