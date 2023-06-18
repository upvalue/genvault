
/* @name getCollections */
SELECT collection_id, name FROM collections;

/* @name getCollection */
SELECT collection_id, name FROM collections WHERE collection_id = :collectionId;

/* @name getCollectionImages */
SELECT * FROM images WHERE collection_id = :collectionId;

/* @name getActiveCollection */
SELECT collection_id, name FROM collections INNER JOIN app ON collections.collection_id = app.active_collection;

/* @name insertImage */
INSERT INTO images (prompt, collection_id, image_id, image_url) VALUES (:prompt, :collectionId, :imageId, :imageUrl);

