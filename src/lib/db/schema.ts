// =============================================================================
// lib/db/schema.ts
// Schema Drizzle ORM — fonte única de verdade para o banco de dados.
//
// Mapeamento 1:1 com src/types/index.ts:
//   users        ↔ User
//   user_goals   ↔ NutritionGoals
//   day_logs     ↔ DayLog (totais denormalizados para performance de queries)
//   meal_entries ↔ MealEntry
//   food_items   ↔ FoodItem
// =============================================================================
import { pgTable, varchar, text, integer, date, timestamp, unique } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// ─── users ────────────────────────────────────────────────────────────────────

export const users = pgTable('users', {
  id: varchar('id', { length: 36 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

// ─── user_goals ───────────────────────────────────────────────────────────────

export const userGoals = pgTable('user_goals', {
  userId: varchar('user_id', { length: 36 })
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  dailyCalories: integer('daily_calories').notNull(),
  dailyCarbsG: integer('daily_carbs_g').notNull(),
  dailyFatG: integer('daily_fat_g').notNull(),
  dailyProteinG: integer('daily_protein_g').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

// ─── day_logs ─────────────────────────────────────────────────────────────────
// Os totais (calories, macros) são denormalizados aqui para
// performance de queries no calendário e gráfico.
// calorieStatus é calculado no momento do insert/update e armazenado.

export const dayLogs = pgTable(
  'day_logs',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    userId: varchar('user_id', { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    date: date('date').notNull(),
    calories: integer('calories').notNull().default(0),
    carbsG: integer('carbs_g').notNull().default(0),
    fatG: integer('fat_g').notNull().default(0),
    proteinG: integer('protein_g').notNull().default(0),
    /** Calculado e armazenado no insert/update para evitar recomputar em cada query */
    calorieStatus: varchar('calorie_status', { length: 32 }).notNull().default('no_data'),
    notes: text('notes'),
  },
  (table) => [unique('day_logs_user_date_unique').on(table.userId, table.date)],
)

// ─── meal_entries ─────────────────────────────────────────────────────────────

export const mealEntries = pgTable('meal_entries', {
  id: varchar('id', { length: 64 }).primaryKey(),
  dayLogId: varchar('day_log_id', { length: 64 })
    .notNull()
    .references(() => dayLogs.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 32 }).notNull(),
  loggedAt: timestamp('logged_at', { withTimezone: true }).notNull(),
})

// ─── food_items ───────────────────────────────────────────────────────────────

export const foodItems = pgTable('food_items', {
  id: varchar('id', { length: 64 }).primaryKey(),
  mealEntryId: varchar('meal_entry_id', { length: 64 })
    .notNull()
    .references(() => mealEntries.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  quantityG: integer('quantity_g').notNull(),
  calories: integer('calories').notNull(),
  carbsG: integer('carbs_g').notNull(),
  fatG: integer('fat_g').notNull(),
  proteinG: integer('protein_g').notNull(),
})

// ─── Relations ────────────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ one, many }) => ({
  goals: one(userGoals, { fields: [users.id], references: [userGoals.userId] }),
  dayLogs: many(dayLogs),
}))

export const userGoalsRelations = relations(userGoals, ({ one }) => ({
  user: one(users, { fields: [userGoals.userId], references: [users.id] }),
}))

export const dayLogsRelations = relations(dayLogs, ({ one, many }) => ({
  user: one(users, { fields: [dayLogs.userId], references: [users.id] }),
  mealEntries: many(mealEntries),
}))

export const mealEntriesRelations = relations(mealEntries, ({ one, many }) => ({
  dayLog: one(dayLogs, { fields: [mealEntries.dayLogId], references: [dayLogs.id] }),
  foodItems: many(foodItems),
}))

export const foodItemsRelations = relations(foodItems, ({ one }) => ({
  mealEntry: one(mealEntries, { fields: [foodItems.mealEntryId], references: [mealEntries.id] }),
}))
