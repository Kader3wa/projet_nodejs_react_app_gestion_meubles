-- -----------------------------------------------------
--  Base de données : Meubles
--  Description : structure minimale pour la persistance
-- -----------------------------------------------------

DROP TABLE IF EXISTS furniture_tags;
DROP TABLE IF EXISTS build_materials;
DROP TABLE IF EXISTS builds;
DROP TABLE IF EXISTS furniture_models;
DROP TABLE IF EXISTS tags;
DROP TABLE IF EXISTS materials;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS companies;

-- -----------------------------------------------------
--  Table: companies (fournisseurs)
-- -----------------------------------------------------
CREATE TABLE companies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE
);

-- -----------------------------------------------------
--  Table: materials (matières premières)
-- -----------------------------------------------------
CREATE TABLE materials (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type ENUM('Bois','Fer','Plastique') NOT NULL,
  company_id INT NOT NULL,
  CONSTRAINT fk_materials_company
    FOREIGN KEY (company_id) REFERENCES companies(id)
    ON DELETE CASCADE
);

-- -----------------------------------------------------
--  Table: categories (types de meubles)
-- -----------------------------------------------------
CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE
);

-- -----------------------------------------------------
--  Table: furniture_models (modèles de meuble)
-- -----------------------------------------------------
CREATE TABLE furniture_models (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category_id INT NOT NULL,
  CONSTRAINT fk_models_category
    FOREIGN KEY (category_id) REFERENCES categories(id)
    ON DELETE CASCADE
);

-- -----------------------------------------------------
--  Table: builds (réalisations)
-- -----------------------------------------------------
CREATE TABLE builds (
  id INT AUTO_INCREMENT PRIMARY KEY,
  furniture_model_id INT NOT NULL,
  ref VARCHAR(100),
  date_creation DATE DEFAULT (CURRENT_DATE),
  destination VARCHAR(255),
  notes TEXT,
  CONSTRAINT fk_builds_model
    FOREIGN KEY (furniture_model_id) REFERENCES furniture_models(id)
    ON DELETE CASCADE
);

-- -----------------------------------------------------
--  Table: build_materials (liaison réalisations ↔ matières)
-- -----------------------------------------------------
CREATE TABLE build_materials (
  build_id INT NOT NULL,
  material_id INT NOT NULL,
  quantity DECIMAL(10,2) DEFAULT 0,
  unit VARCHAR(20) DEFAULT 'u',
  cost_unit DECIMAL(10,2) DEFAULT 0,
  PRIMARY KEY (build_id, material_id),
  CONSTRAINT fk_bm_build FOREIGN KEY (build_id) REFERENCES builds(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_bm_material FOREIGN KEY (material_id) REFERENCES materials(id)
    ON DELETE CASCADE
);

-- -----------------------------------------------------
--  Table: tags (mots-clés)
-- -----------------------------------------------------
CREATE TABLE tags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  label VARCHAR(100) NOT NULL UNIQUE
);

-- -----------------------------------------------------
--  Table: furniture_tags (liaison tags ↔ modèles)
-- -----------------------------------------------------
CREATE TABLE furniture_tags (
  furniture_model_id INT NOT NULL,
  tag_id INT NOT NULL,
  PRIMARY KEY (furniture_model_id, tag_id),
  CONSTRAINT fk_ft_model FOREIGN KEY (furniture_model_id)
    REFERENCES furniture_models(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_ft_tag FOREIGN KEY (tag_id)
    REFERENCES tags(id)
    ON DELETE CASCADE
);
