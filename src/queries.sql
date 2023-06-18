
/* @name getChannels */
SELECT name FROM channels;

/* @name getChannel */
SELECT name FROM channels WHERE name = :name;

/* @name getChannelImages */
SELECT * FROM images WHERE channel = :channelName;

/* @name insertImage */
INSERT INTO images (prompt, channel, message_id, image_url) VALUES (:prompt, :channel, :messageId, :imageUrl);

/* @name upsertChannel */
INSERT INTO channels (name, channel_id) VALUES (:name, :channel_id) ON CONFLICT (name) DO UPDATE SET channel_id = :channel_id;

