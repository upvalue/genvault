DROP TABLE IF EXISTS collections;
DROP TABLE IF EXISTS images;

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