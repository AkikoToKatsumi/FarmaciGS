-- Crear tabla de categorías si no existe
CREATE TABLE IF NOT EXISTS public.categories
(
    id serial NOT NULL,
    name character varying(100) COLLATE pg_catalog."default" NOT NULL UNIQUE,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT categories_pkey PRIMARY KEY (id),
    CONSTRAINT categories_name_unique UNIQUE (name)
);

-- Insertar categorías por defecto
INSERT INTO categories (name) VALUES 
('Analgésicos'),
('Antibióticos'),
('Antihistamínicos'),
('Vitaminas'),
('Medicamentos para la presión'),
('Medicamentos para la diabetes'),
('Antiinflamatorios'),
('Medicamentos gastrointestinales'),
('Suplementos'),
('Productos de cuidado personal')
ON CONFLICT (name) DO NOTHING;
