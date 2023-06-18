DROP TABLE IF EXISTS channels CASCADE;
DROP TABLE IF EXISTS images CASCADE;

CREATE TABLE IF NOT EXISTS channels (
    name text,
    channel_id text,
    PRIMARY key(name)
);

CREATE TABLE IF NOT EXISTS images (
    prompt text,
    image_url text,
    message_id text,
    channel_id text references channels(channel_id),
    PRIMARY KEY (message_id)
);

/*
CREATE TABLE IF NOT EXISTS image_upscales (
    image_message_id text references images(message_id),
    upscale_message_id text PRIMARY KEY
);
*/