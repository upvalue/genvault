
/* @name getChannels */
SELECT name FROM channels;

/* @name getChannel */
SELECT name FROM channels WHERE name = :name;

/* @name getChannelImages */
SELECT images.* FROM images INNER JOIN channels ON images.channel_id = channels.channel_id WHERE channels.name = :channelName;

/* @name upsertImage */
INSERT INTO images (prompt, channel_id, message_id, image_url) VALUES (:prompt, :channelId, :messageId, :imageUrl) ON CONFLICT (message_id) DO UPDATE SET prompt = :prompt, image_url = :imageUrl;

/* @name upsertChannel */
INSERT INTO channels (name, channel_id) VALUES (:name, :channel_id) ON CONFLICT (name) DO UPDATE SET channel_id = :channel_id;

