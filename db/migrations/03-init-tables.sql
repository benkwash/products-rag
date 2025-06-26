CREATE TABLE IF NOT EXISTS products (
    "id"              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name"            VARCHAR(255) NOT NULL,
    "description"     TEXT NOT NULL,
    -- .
    -- .. other details
    -- ...
    "details_text"    TEXT,
    "embeddings"      VECTOR(1536),
    "created_at"      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updated_at"      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
