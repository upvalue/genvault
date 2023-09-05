import { Knex } from "knex";

exports.up = async function(knex: Knex) {
  await knex.schema
    // Create the workspace table
    .createTable("workspaces", (table) => {
      table.text("slug").primary().notNullable();
      table.text("name").notNullable();
    })
    // Create the image_session table
    .createTable("image_sessions", (table) => {
      table.text("id").primary().notNullable();
      table.text("name").notNullable();
      table.text("workspace_slug")
        .notNullable()
        .references("slug")
        .inTable("workspaces")
        .onDelete("CASCADE"); // or 'SET NULL' depending on your needs
    })
    // Create the image_message table
    .createTable("image_messages", (table) => {
      table.text("image_session_id")
        .notNullable()
        .references("id")
        .inTable("image_sessions")
        .onDelete("CASCADE"); // or 'SET NULL' depending on your needs
      table.text("file_path").notNullable();
      table.jsonb("generation").notNullable();
    });

  return knex.table("workspaces").insert({
    slug: "scratch",
    name: "Scratch",
  });
};

exports.down = function(knex: Knex) {
  return knex.schema
    .dropTableIfExists("image_messages")
    .dropTableIfExists("image_sessions")
    .dropTableIfExists("workspaces");
};
