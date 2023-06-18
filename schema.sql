DROP TABLE IF EXISTS channels CASCADE;
DROP TABLE IF EXISTS images CASCADE;

CREATE TABLE IF NOT EXISTS channels (
    name text not null,
    channel_id text not null,
    PRIMARY key(name),
    UNIQUE (channel_id)
);

CREATE TABLE IF NOT EXISTS images (
    prompt text not null,
    image_url text not null,
    message_id text not null,
    channel_id text not null references channels(channel_id),
    PRIMARY KEY (message_id)
);

CREATE TABLE IF NOT EXISTS images_upscaled(
    upscale_message_id text not null primary key,
    image_message_id text not null references images(message_id),
    image_url text not null
)