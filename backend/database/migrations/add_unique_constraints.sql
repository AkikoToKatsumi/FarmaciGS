-- Migración para agregar constraints únicos a la base de datos
-- Ejecutar este script para asegurar la integridad de datos a nivel de base de datos

BEGIN;

-- 1. Agregar constraint único para email en la tabla clients
-- Primero verificar si ya existe la constraint
DO $$
BEGIN
    -- Verificar si la constraint ya existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'clients' 
        AND constraint_name = 'clients_email_unique'
    ) THEN
        -- Remover duplicados existentes antes de agregar la constraint
        DELETE FROM clients a USING clients b 
        WHERE a.id > b.id 
        AND LOWER(a.email) = LOWER(b.email)
        AND a.email IS NOT NULL 
        AND b.email IS NOT NULL;
        
        -- Agregar constraint único para email en clients
        ALTER TABLE clients ADD CONSTRAINT clients_email_unique UNIQUE (email);
    END IF;
END $$;

-- 2. Agregar constraint único para teléfono en la tabla clients
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'clients' 
        AND constraint_name = 'clients_phone_unique'
    ) THEN
        -- Remover duplicados existentes antes de agregar la constraint
        DELETE FROM clients a USING clients b 
        WHERE a.id > b.id 
        AND a.phone = b.phone
        AND a.phone IS NOT NULL 
        AND b.phone IS NOT NULL;
        
        ALTER TABLE clients ADD CONSTRAINT clients_phone_unique UNIQUE (phone);
    END IF;
END $$;

-- 3. Agregar constraint único para cédula en la tabla clients (excluyendo valores vacíos y NULL)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'clients' 
        AND constraint_name = 'clients_cedula_unique'
    ) THEN
        -- Actualizar valores vacíos a NULL primero
        UPDATE clients SET cedula = NULL WHERE cedula = '' OR cedula = ' ';
        
        -- Remover duplicados existentes antes de agregar la constraint
        DELETE FROM clients a USING clients b 
        WHERE a.id > b.id 
        AND a.cedula = b.cedula
        AND a.cedula IS NOT NULL 
        AND b.cedula IS NOT NULL;
        
        -- Crear índice único parcial que excluye valores NULL
        CREATE UNIQUE INDEX clients_cedula_unique ON clients (cedula) WHERE cedula IS NOT NULL;
    END IF;
END $$;

-- 4. Agregar constraint único para RNC en la tabla clients (excluyendo valores vacíos y NULL)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'clients' 
        AND constraint_name = 'clients_rnc_unique'
    ) THEN
        -- Actualizar valores vacíos a NULL primero
        UPDATE clients SET rnc = NULL WHERE rnc = '' OR rnc = ' ';
        
        -- Remover duplicados existentes antes de agregar la constraint
        DELETE FROM clients a USING clients b 
        WHERE a.id > b.id 
        AND a.rnc = b.rnc
        AND a.rnc IS NOT NULL 
        AND b.rnc IS NOT NULL;
        
        -- Crear índice único parcial que excluye valores NULL
        CREATE UNIQUE INDEX clients_rnc_unique ON clients (rnc) WHERE rnc IS NOT NULL;
    END IF;
END $$;

-- 5. Agregar constraint único para teléfono en la tabla employees (excluyendo valores vacíos y NULL)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'employees' 
        AND constraint_name = 'employees_phone_unique'
    ) THEN
        -- Actualizar valores vacíos a NULL primero
        UPDATE employees SET phone = NULL WHERE phone = '' OR phone = ' ';
        
        -- Remover duplicados existentes antes de agregar la constraint
        DELETE FROM employees a USING employees b 
        WHERE a.user_id > b.user_id 
        AND a.phone = b.phone
        AND a.phone IS NOT NULL 
        AND b.phone IS NOT NULL;
        
        -- Crear índice único parcial que excluye valores NULL
        CREATE UNIQUE INDEX employees_phone_unique ON employees (phone) WHERE phone IS NOT NULL;
    END IF;
END $$;

-- 6. Agregar constraint único para email en la tabla employees
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'employees' 
        AND constraint_name = 'employees_email_unique'
    ) THEN
        -- Remover duplicados existentes antes de agregar la constraint
        DELETE FROM employees a USING employees b 
        WHERE a.user_id > b.user_id 
        AND LOWER(a.email) = LOWER(b.email)
        AND a.email IS NOT NULL 
        AND b.email IS NOT NULL;
        
        ALTER TABLE employees ADD CONSTRAINT employees_email_unique UNIQUE (email);
    END IF;
END $$;

-- 7. Agregar constraint único para teléfono en la tabla providers (excluyendo valores vacíos y NULL)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'providers' 
        AND constraint_name = 'providers_phone_unique'
    ) THEN
        -- Actualizar valores vacíos a NULL primero
        UPDATE providers SET phone = NULL WHERE phone = '' OR phone = ' ';
        
        -- Crear índice único parcial que excluye valores NULL
        CREATE UNIQUE INDEX providers_phone_unique ON providers (phone) WHERE phone IS NOT NULL;
    END IF;
EXCEPTION 
    WHEN unique_violation THEN
        RAISE NOTICE 'Existen valores duplicados en providers.phone. Resuelva los duplicados manualmente.';
END $$;

-- 8. Agregar constraint único para email en la tabla providers
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'providers' 
        AND constraint_name = 'providers_email_unique'
    ) THEN
        -- Crear constraint único para email en providers
        ALTER TABLE providers ADD CONSTRAINT providers_email_unique UNIQUE (email);
    END IF;
EXCEPTION 
    WHEN unique_violation THEN
        RAISE NOTICE 'Existen valores duplicados en providers.email. Resuelva los duplicados manualmente.';
END $$;

-- 9. Agregar constraint único para tax_id en la tabla providers (excluyendo valores vacíos y NULL)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'providers' 
        AND constraint_name = 'providers_tax_id_unique'
    ) THEN
        -- Actualizar valores vacíos a NULL primero
        UPDATE providers SET tax_id = NULL WHERE tax_id = '' OR tax_id = ' ';
        
        -- Solo crear el índice si no hay duplicados actuales
        -- El índice parcial permitirá NULL pero no duplicados no-NULL
        CREATE UNIQUE INDEX providers_tax_id_unique ON providers (tax_id) WHERE tax_id IS NOT NULL;
    END IF;
EXCEPTION 
    WHEN unique_violation THEN
        RAISE NOTICE 'Existen valores duplicados en providers.tax_id. Resuelva los duplicados manualmente.';
END $$;

-- 10. Agregar constraint único para código de barras en la tabla medicine (excluyendo valores vacíos y NULL)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'medicine' 
        AND constraint_name = 'medicine_barcode_unique'
    ) THEN
        -- Actualizar valores vacíos a NULL primero
        UPDATE medicine SET barcode = NULL WHERE barcode = '' OR barcode = ' ';
        
        -- Remover duplicados existentes antes de agregar la constraint
        DELETE FROM medicine a USING medicine b 
        WHERE a.id > b.id 
        AND a.barcode = b.barcode
        AND a.barcode IS NOT NULL 
        AND b.barcode IS NOT NULL;
        
        -- Crear índice único parcial que excluye valores NULL
        CREATE UNIQUE INDEX medicine_barcode_unique ON medicine (barcode) WHERE barcode IS NOT NULL;
    END IF;
END $$;

-- 11. Agregar constraint único compuesto para nombre y lote en la tabla medicine
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'medicine' 
        AND constraint_name = 'medicine_name_lot_unique'
    ) THEN
        -- Remover duplicados existentes antes de agregar la constraint
        DELETE FROM medicine a USING medicine b 
        WHERE a.id > b.id 
        AND LOWER(a.name) = LOWER(b.name)
        AND a.lot = b.lot
        AND a.name IS NOT NULL 
        AND b.name IS NOT NULL
        AND a.lot IS NOT NULL 
        AND b.lot IS NOT NULL;
        
        -- Crear un índice único que ignore mayúsculas/minúsculas para el nombre
        CREATE UNIQUE INDEX medicine_name_lot_unique ON medicine (LOWER(name), lot);
    END IF;
END $$;

COMMIT;

-- Mostrar las constraints agregadas
SELECT 
    tc.table_name, 
    tc.constraint_name, 
    tc.constraint_type,
    string_agg(kcu.column_name, ', ') as columns
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_schema = 'public' 
    AND tc.constraint_type = 'UNIQUE'
    AND tc.table_name IN ('clients', 'employees', 'providers', 'medicine', 'users')
GROUP BY tc.table_name, tc.constraint_name, tc.constraint_type
ORDER BY tc.table_name, tc.constraint_name;
