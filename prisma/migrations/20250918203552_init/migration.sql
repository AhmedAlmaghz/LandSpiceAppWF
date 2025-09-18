-- CreateTable
CREATE TABLE "public"."roles" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "display_name" VARCHAR(100),
    "description" TEXT,
    "permissions" JSON,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "email" VARCHAR(150),
    "password" TEXT NOT NULL,
    "phone" VARCHAR(20),
    "first_name" VARCHAR(100),
    "last_name" VARCHAR(100),
    "avatar" TEXT,
    "role_id" INTEGER NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."restaurants" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "business_name" VARCHAR(200),
    "commercial_reg_no" VARCHAR(50),
    "tax_number" VARCHAR(50),
    "address" TEXT,
    "city" VARCHAR(100),
    "district" VARCHAR(100),
    "postal_code" VARCHAR(10),
    "phone" VARCHAR(20),
    "email" VARCHAR(150),
    "website" VARCHAR(200),
    "logo" TEXT,
    "documents" JSON,
    "contact_info" JSON,
    "marketer_id" TEXT,
    "status" VARCHAR(30) NOT NULL DEFAULT 'pending',
    "monthly_quota" INTEGER NOT NULL DEFAULT 18000,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "restaurants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."banks" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "branch" VARCHAR(100),
    "swift_code" VARCHAR(20),
    "address" TEXT,
    "phone" VARCHAR(20),
    "email" VARCHAR(150),
    "contact_info" JSON,
    "api_endpoint" VARCHAR(255),
    "api_key" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "banks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."suppliers" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "specialization" VARCHAR(100),
    "address" TEXT,
    "phone" VARCHAR(20),
    "email" VARCHAR(150),
    "contact_info" JSON,
    "rating" DOUBLE PRECISION DEFAULT 5.0,
    "total_orders" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."contracts" (
    "id" TEXT NOT NULL,
    "restaurant_id" TEXT NOT NULL,
    "bank_id" TEXT NOT NULL,
    "contract_number" VARCHAR(50),
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "monthly_amount" DECIMAL(12,2) NOT NULL,
    "contract_file" TEXT,
    "signed_file" TEXT,
    "status" VARCHAR(30) NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."guarantees" (
    "id" TEXT NOT NULL,
    "contract_id" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" VARCHAR(5) NOT NULL DEFAULT 'SAR',
    "type" VARCHAR(50) NOT NULL,
    "document_file" TEXT,
    "reference_no" VARCHAR(100),
    "valid_from" TIMESTAMP(3),
    "valid_to" TIMESTAMP(3),
    "status" VARCHAR(30) NOT NULL DEFAULT 'pending',
    "notes" TEXT,
    "issued_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guarantees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."designs" (
    "id" TEXT NOT NULL,
    "restaurant_id" TEXT NOT NULL,
    "title" VARCHAR(200),
    "description" TEXT,
    "design_type" VARCHAR(50) NOT NULL DEFAULT 'packaging',
    "original_file" TEXT,
    "preview_file" TEXT,
    "final_file" TEXT,
    "status" VARCHAR(30) NOT NULL DEFAULT 'draft',
    "notes" TEXT,
    "feedback" JSON,
    "designer_id" TEXT,
    "designer_notes" TEXT,
    "submitted_at" TIMESTAMP(3),
    "reviewed_at" TIMESTAMP(3),
    "approved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "designs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."print_orders" (
    "id" TEXT NOT NULL,
    "bank_id" TEXT NOT NULL,
    "supplier_id" TEXT,
    "order_number" VARCHAR(50) NOT NULL,
    "total_amount" DECIMAL(12,2) NOT NULL,
    "currency" VARCHAR(5) NOT NULL DEFAULT 'SAR',
    "expected_date" TIMESTAMP(3),
    "delivery_date" TIMESTAMP(3),
    "status" VARCHAR(30) NOT NULL DEFAULT 'pending',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "print_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."print_order_details" (
    "id" SERIAL NOT NULL,
    "print_order_id" TEXT NOT NULL,
    "restaurant_id" TEXT NOT NULL,
    "design_id" TEXT NOT NULL,
    "ketchup_qty" INTEGER NOT NULL DEFAULT 0,
    "chili_qty" INTEGER NOT NULL DEFAULT 0,
    "unit_price" DECIMAL(8,4) NOT NULL,
    "total_price" DECIMAL(10,2) NOT NULL,
    "specifications" JSON,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "print_order_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."production_batches" (
    "id" TEXT NOT NULL,
    "restaurant_id" TEXT NOT NULL,
    "batch_number" VARCHAR(50) NOT NULL,
    "product_type" VARCHAR(20) NOT NULL,
    "ketchup_qty" INTEGER NOT NULL DEFAULT 0,
    "chili_qty" INTEGER NOT NULL DEFAULT 0,
    "scheduled_date" TIMESTAMP(3) NOT NULL,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "status" VARCHAR(30) NOT NULL DEFAULT 'scheduled',
    "notes" TEXT,
    "assigned_team" JSON,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "production_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."inventory" (
    "id" TEXT NOT NULL,
    "restaurant_id" TEXT NOT NULL,
    "ketchup_remaining" INTEGER NOT NULL DEFAULT 0,
    "chili_remaining" INTEGER NOT NULL DEFAULT 0,
    "ketchup_consumed" INTEGER NOT NULL DEFAULT 0,
    "chili_consumed" INTEGER NOT NULL DEFAULT 0,
    "last_delivery" TIMESTAMP(3),
    "next_delivery" TIMESTAMP(3),
    "low_stock_alert" BOOLEAN NOT NULL DEFAULT false,
    "last_updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."invoices" (
    "id" TEXT NOT NULL,
    "restaurant_id" TEXT NOT NULL,
    "invoice_number" VARCHAR(50) NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" VARCHAR(5) NOT NULL DEFAULT 'SAR',
    "period_from" TIMESTAMP(3) NOT NULL,
    "period_to" TIMESTAMP(3) NOT NULL,
    "ketchup_qty" INTEGER NOT NULL,
    "chili_qty" INTEGER NOT NULL,
    "unit_price" DECIMAL(8,4) NOT NULL,
    "status" VARCHAR(30) NOT NULL DEFAULT 'unpaid',
    "due_date" TIMESTAMP(3) NOT NULL,
    "invoice_file" TEXT,
    "issued_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."payments" (
    "id" TEXT NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" VARCHAR(5) NOT NULL DEFAULT 'SAR',
    "method" VARCHAR(30) NOT NULL,
    "reference_no" VARCHAR(100),
    "receipt_file" TEXT,
    "notes" TEXT,
    "paid_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."installments" (
    "id" TEXT NOT NULL,
    "contract_id" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" VARCHAR(5) NOT NULL DEFAULT 'SAR',
    "due_date" TIMESTAMP(3) NOT NULL,
    "status" VARCHAR(30) NOT NULL DEFAULT 'pending',
    "paid_at" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "installments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."processes" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "entity" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "processes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."process_steps" (
    "id" TEXT NOT NULL,
    "process_id" TEXT NOT NULL,
    "step_order" INTEGER NOT NULL,
    "step_name" VARCHAR(100) NOT NULL,
    "responsible_role" INTEGER NOT NULL,
    "allowed_actions" TEXT[],
    "next_state" VARCHAR(50),
    "prev_state" VARCHAR(50),
    "is_required" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "process_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."workflow_instances" (
    "id" TEXT NOT NULL,
    "process_id" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "restaurant_id" TEXT,
    "current_step_id" TEXT NOT NULL,
    "current_state" VARCHAR(50) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "metadata" JSON,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workflow_instances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."workflow_logs" (
    "id" BIGSERIAL NOT NULL,
    "instance_id" TEXT NOT NULL,
    "step_id" TEXT NOT NULL,
    "actor_id" TEXT NOT NULL,
    "action" VARCHAR(100) NOT NULL,
    "prev_state" VARCHAR(50),
    "new_state" VARCHAR(50) NOT NULL,
    "notes" TEXT,
    "metadata" JSON,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workflow_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "public"."roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "public"."users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE INDEX "users_username_idx" ON "public"."users"("username");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "public"."users"("email");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "public"."users"("status");

-- CreateIndex
CREATE INDEX "users_role_id_idx" ON "public"."users"("role_id");

-- CreateIndex
CREATE UNIQUE INDEX "restaurants_user_id_key" ON "public"."restaurants"("user_id");

-- CreateIndex
CREATE INDEX "restaurants_status_idx" ON "public"."restaurants"("status");

-- CreateIndex
CREATE INDEX "restaurants_marketer_id_idx" ON "public"."restaurants"("marketer_id");

-- CreateIndex
CREATE INDEX "restaurants_name_idx" ON "public"."restaurants"("name");

-- CreateIndex
CREATE INDEX "restaurants_city_idx" ON "public"."restaurants"("city");

-- CreateIndex
CREATE UNIQUE INDEX "banks_user_id_key" ON "public"."banks"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "suppliers_user_id_key" ON "public"."suppliers"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "contracts_contract_number_key" ON "public"."contracts"("contract_number");

-- CreateIndex
CREATE INDEX "contracts_status_idx" ON "public"."contracts"("status");

-- CreateIndex
CREATE INDEX "contracts_restaurant_id_idx" ON "public"."contracts"("restaurant_id");

-- CreateIndex
CREATE INDEX "contracts_start_date_end_date_idx" ON "public"."contracts"("start_date", "end_date");

-- CreateIndex
CREATE INDEX "contracts_bank_id_idx" ON "public"."contracts"("bank_id");

-- CreateIndex
CREATE UNIQUE INDEX "print_orders_order_number_key" ON "public"."print_orders"("order_number");

-- CreateIndex
CREATE UNIQUE INDEX "production_batches_batch_number_key" ON "public"."production_batches"("batch_number");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_restaurant_id_key" ON "public"."inventory"("restaurant_id");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_invoice_number_key" ON "public"."invoices"("invoice_number");

-- CreateIndex
CREATE INDEX "invoices_status_idx" ON "public"."invoices"("status");

-- CreateIndex
CREATE INDEX "invoices_restaurant_id_idx" ON "public"."invoices"("restaurant_id");

-- CreateIndex
CREATE INDEX "invoices_due_date_idx" ON "public"."invoices"("due_date");

-- CreateIndex
CREATE INDEX "invoices_period_from_period_to_idx" ON "public"."invoices"("period_from", "period_to");

-- CreateIndex
CREATE INDEX "installments_status_idx" ON "public"."installments"("status");

-- CreateIndex
CREATE INDEX "installments_due_date_idx" ON "public"."installments"("due_date");

-- CreateIndex
CREATE INDEX "installments_contract_id_idx" ON "public"."installments"("contract_id");

-- CreateIndex
CREATE INDEX "workflow_instances_status_idx" ON "public"."workflow_instances"("status");

-- CreateIndex
CREATE INDEX "workflow_instances_restaurant_id_idx" ON "public"."workflow_instances"("restaurant_id");

-- CreateIndex
CREATE INDEX "workflow_instances_current_state_idx" ON "public"."workflow_instances"("current_state");

-- CreateIndex
CREATE INDEX "workflow_instances_process_id_idx" ON "public"."workflow_instances"("process_id");

-- CreateIndex
CREATE INDEX "workflow_logs_timestamp_idx" ON "public"."workflow_logs"("timestamp");

-- CreateIndex
CREATE INDEX "workflow_logs_instance_id_idx" ON "public"."workflow_logs"("instance_id");

-- CreateIndex
CREATE INDEX "workflow_logs_action_idx" ON "public"."workflow_logs"("action");

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."restaurants" ADD CONSTRAINT "restaurants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."restaurants" ADD CONSTRAINT "restaurants_marketer_id_fkey" FOREIGN KEY ("marketer_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."banks" ADD CONSTRAINT "banks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."suppliers" ADD CONSTRAINT "suppliers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."contracts" ADD CONSTRAINT "contracts_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."contracts" ADD CONSTRAINT "contracts_bank_id_fkey" FOREIGN KEY ("bank_id") REFERENCES "public"."banks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."guarantees" ADD CONSTRAINT "guarantees_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "public"."contracts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."designs" ADD CONSTRAINT "designs_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."print_orders" ADD CONSTRAINT "print_orders_bank_id_fkey" FOREIGN KEY ("bank_id") REFERENCES "public"."banks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."print_orders" ADD CONSTRAINT "print_orders_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."print_order_details" ADD CONSTRAINT "print_order_details_print_order_id_fkey" FOREIGN KEY ("print_order_id") REFERENCES "public"."print_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."print_order_details" ADD CONSTRAINT "print_order_details_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."print_order_details" ADD CONSTRAINT "print_order_details_design_id_fkey" FOREIGN KEY ("design_id") REFERENCES "public"."designs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."production_batches" ADD CONSTRAINT "production_batches_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."inventory" ADD CONSTRAINT "inventory_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."invoices" ADD CONSTRAINT "invoices_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payments" ADD CONSTRAINT "payments_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."installments" ADD CONSTRAINT "installments_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "public"."contracts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."process_steps" ADD CONSTRAINT "process_steps_process_id_fkey" FOREIGN KEY ("process_id") REFERENCES "public"."processes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."process_steps" ADD CONSTRAINT "process_steps_responsible_role_fkey" FOREIGN KEY ("responsible_role") REFERENCES "public"."roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."workflow_instances" ADD CONSTRAINT "workflow_instances_process_id_fkey" FOREIGN KEY ("process_id") REFERENCES "public"."processes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."workflow_instances" ADD CONSTRAINT "workflow_instances_current_step_id_fkey" FOREIGN KEY ("current_step_id") REFERENCES "public"."process_steps"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."workflow_instances" ADD CONSTRAINT "workflow_instances_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."workflow_logs" ADD CONSTRAINT "workflow_logs_instance_id_fkey" FOREIGN KEY ("instance_id") REFERENCES "public"."workflow_instances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."workflow_logs" ADD CONSTRAINT "workflow_logs_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
