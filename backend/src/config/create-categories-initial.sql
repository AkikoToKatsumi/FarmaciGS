-- Asegurar que la tabla existe y tiene datos
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
