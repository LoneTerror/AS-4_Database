-- AlterTable
ALTER TABLE "employees" ADD COLUMN     "date_of_birth" DATE;

-- AlterTable
ALTER TABLE "reviews" ADD COLUMN     "raw_points" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "reward_catalog" ADD COLUMN     "available_stock" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "roles" ADD COLUMN     "reviewer_weight" DECIMAL(5,4) NOT NULL DEFAULT 1.0000;

-- CreateTable
CREATE TABLE "notifications" (
    "notification_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "employee_id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "message" TEXT NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "email_sent" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read_at" TIMESTAMPTZ(6),

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("notification_id")
);

-- CreateTable
CREATE TABLE "points_config" (
    "config_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "config_key" VARCHAR(100) NOT NULL,
    "config_value" DECIMAL(10,6) NOT NULL,
    "description" TEXT,
    "effective_from" DATE,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "updated_by" UUID,

    CONSTRAINT "points_config_pkey" PRIMARY KEY ("config_id")
);

-- CreateTable
CREATE TABLE "review_categories" (
    "category_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "category_code" VARCHAR(50) NOT NULL,
    "category_name" VARCHAR(100) NOT NULL,
    "multiplier" DECIMAL(5,4) NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "updated_by" UUID,

    CONSTRAINT "review_categories_pkey" PRIMARY KEY ("category_id")
);

-- CreateTable
CREATE TABLE "review_category_tags" (
    "tag_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "review_id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "multiplier_snapshot" DECIMAL(5,4) NOT NULL,
    "category_code_snapshot" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_category_tags_pkey" PRIMARY KEY ("tag_id")
);

-- CreateTable
CREATE TABLE "route_permissions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "route_key" VARCHAR(200) NOT NULL,
    "role_id" UUID NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_at" TIMESTAMPTZ(6),
    "updated_by" UUID,

    CONSTRAINT "route_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seasonal_multipliers" (
    "seasonal_multiplier_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "quarter" INTEGER NOT NULL,
    "label" VARCHAR(50) NOT NULL,
    "multiplier" DECIMAL(5,4) NOT NULL,
    "effective_from" DATE,
    "effective_to" DATE,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "updated_by" UUID,

    CONSTRAINT "seasonal_multipliers_pkey" PRIMARY KEY ("seasonal_multiplier_id")
);

-- CreateIndex
CREATE INDEX "notifications_created_at_idx" ON "notifications"("created_at");

-- CreateIndex
CREATE INDEX "notifications_email_sent_idx" ON "notifications"("email_sent");

-- CreateIndex
CREATE INDEX "notifications_employee_id_idx" ON "notifications"("employee_id");

-- CreateIndex
CREATE INDEX "notifications_employee_id_is_read_idx" ON "notifications"("employee_id", "is_read");

-- CreateIndex
CREATE UNIQUE INDEX "points_config_config_key_key" ON "points_config"("config_key");

-- CreateIndex
CREATE INDEX "points_config_config_key_idx" ON "points_config"("config_key");

-- CreateIndex
CREATE UNIQUE INDEX "review_categories_category_code_key" ON "review_categories"("category_code");

-- CreateIndex
CREATE UNIQUE INDEX "review_categories_category_name_key" ON "review_categories"("category_name");

-- CreateIndex
CREATE INDEX "review_categories_category_code_idx" ON "review_categories"("category_code");

-- CreateIndex
CREATE INDEX "review_categories_is_active_idx" ON "review_categories"("is_active");

-- CreateIndex
CREATE INDEX "review_category_tags_category_id_idx" ON "review_category_tags"("category_id");

-- CreateIndex
CREATE INDEX "review_category_tags_review_id_idx" ON "review_category_tags"("review_id");

-- CreateIndex
CREATE UNIQUE INDEX "review_category_tags_review_id_category_id_key" ON "review_category_tags"("review_id", "category_id");

-- CreateIndex
CREATE INDEX "idx_route_permissions_route_key" ON "route_permissions"("route_key");

-- CreateIndex
CREATE UNIQUE INDEX "uq_route_permissions_route_role" ON "route_permissions"("route_key", "role_id");

-- CreateIndex
CREATE INDEX "seasonal_multipliers_effective_from_idx" ON "seasonal_multipliers"("effective_from");

-- CreateIndex
CREATE INDEX "seasonal_multipliers_quarter_idx" ON "seasonal_multipliers"("quarter");

-- CreateIndex
CREATE UNIQUE INDEX "seasonal_multipliers_quarter_effective_from_key" ON "seasonal_multipliers"("quarter", "effective_from");

-- CreateIndex
CREATE INDEX "employees_date_of_birth_idx" ON "employees"("date_of_birth");

-- CreateIndex
CREATE INDEX "reviews_receiver_id_raw_points_idx" ON "reviews"("receiver_id", "raw_points");

-- CreateIndex
CREATE INDEX "reviews_receiver_id_review_at_idx" ON "reviews"("receiver_id", "review_at");

-- AddForeignKey
ALTER TABLE "points_config" ADD CONSTRAINT "points_config_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "employees"("employee_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "points_config" ADD CONSTRAINT "points_config_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "employees"("employee_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_categories" ADD CONSTRAINT "review_categories_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "employees"("employee_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_categories" ADD CONSTRAINT "review_categories_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "employees"("employee_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_category_tags" ADD CONSTRAINT "review_category_tags_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "review_categories"("category_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_category_tags" ADD CONSTRAINT "review_category_tags_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "reviews"("review_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route_permissions" ADD CONSTRAINT "fk_route_permissions_role" FOREIGN KEY ("role_id") REFERENCES "roles"("role_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "seasonal_multipliers" ADD CONSTRAINT "seasonal_multipliers_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "employees"("employee_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seasonal_multipliers" ADD CONSTRAINT "seasonal_multipliers_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "employees"("employee_id") ON DELETE RESTRICT ON UPDATE CASCADE;
