-- -----------------------------------------------------
-- Données de référence de base
-- -----------------------------------------------------

-- Nettoyage préalable
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE furniture_tags;
TRUNCATE TABLE build_materials;
TRUNCATE TABLE builds;
TRUNCATE TABLE furniture_models;
TRUNCATE TABLE tags;
TRUNCATE TABLE materials;
TRUNCATE TABLE categories;
TRUNCATE TABLE companies;
SET FOREIGN_KEY_CHECKS = 1;

-- -----------------------------------------------------
-- Entreprises (fournisseurs)
-- -----------------------------------------------------
INSERT INTO companies (name) VALUES
('BBois'),
('MetaLo'),
('pPlastique');

-- -----------------------------------------------------
-- Matières premières
-- -----------------------------------------------------
INSERT INTO materials (name, type, company_id) VALUES
('Frêne',       'Bois',       1),
('Chêne',       'Bois',       1),
('Noyer',       'Bois',       1),
('Acier inox',  'Fer',        2),
('Aluminium',   'Fer',        2),
('Plastique',   'Plastique',  3);

-- -----------------------------------------------------
-- Catégories de meubles
-- -----------------------------------------------------
INSERT INTO categories (name) VALUES
('Armoire'),
('Étagère');
