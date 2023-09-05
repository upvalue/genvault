/* @name listWorkspacesQuery */
SELECT * FROM workspaces;

/* @name insertWorkspaceMutation */
INSERT INTO workspaces (slug, name) VALUES (:slug, :name);

/* @name getWorkspaceQuery */
SELECT * FROM workspaces WHERE slug = :slug;