DROP TABLE IF EXISTS collections CASCADE;
DROP TABLE IF EXISTS images CASCADE;
DROP TABLE IF EXISTS app CASCADE;

CREATE TABLE IF NOT EXISTS collections (
    collection_id text,
    name text,
    PRIMARY key(collection_id)
);

CREATE TABLE IF NOT EXISTS images (
    prompt text,
    image_url text,
    image_id text,
    collection_id text references collections(collection_id),
    PRIMARY KEY (image_id)
);

CREATE TABLE IF NOT EXISTS app (
    app_id text PRIMARY KEY,
    active_collection text references collections(collection_id)
);

INSERT INTO collections(collection_id, name) VALUES ('collection_0CI8vyo0jVupAj7b', 'Scratch') ON CONFLICT DO NOTHING;
INSERT INTO app(app_id, active_collection) VALUES ('mj-workbook', 'collection_0CI8vyo0jVupAj7b') ON CONFLICT DO NOTHING;
