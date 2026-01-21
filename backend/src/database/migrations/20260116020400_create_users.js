/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('users', function(table) {
        table.increments('id').primary()
        table.string('name').notNullable()
        table.string('email').unique().notNullable()
        table.string('password').notNullable()
        table.string('phone').notNullable()
        table.date('birth_date').notNullable()
        table.string('status').notNullable().defaultTo('ativo')
        table.timestamps(true, true) // created_at e updated_at
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('users')
};
