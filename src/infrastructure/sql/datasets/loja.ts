/**
 * SQL de seed do dataset "Loja de exemplo", migrado sem alterações de
 * legacy/Trilha_PostgreSQL_com_Laboratorio.html.
 */
export const SEED_LOJA = `
CREATE TABLE categorias (
    id    SERIAL PRIMARY KEY,
    nome  VARCHAR(60) NOT NULL UNIQUE
);
CREATE TABLE produtos (
    id            SERIAL PRIMARY KEY,
    nome          VARCHAR(120) NOT NULL,
    descricao     TEXT,
    preco         NUMERIC(10, 2) NOT NULL CHECK (preco >= 0),
    estoque       INTEGER NOT NULL DEFAULT 0,
    ativo         BOOLEAN DEFAULT TRUE,
    criado_em     TIMESTAMP DEFAULT NOW(),
    categoria_id  INTEGER REFERENCES categorias (id)
);
CREATE TABLE clientes (
    id     SERIAL PRIMARY KEY,
    nome   VARCHAR(100) NOT NULL,
    email  VARCHAR(150) UNIQUE
);
CREATE TABLE pedidos (
    id          SERIAL PRIMARY KEY,
    cliente_id  INTEGER NOT NULL REFERENCES clientes (id),
    total       NUMERIC(10, 2) NOT NULL
);
CREATE TABLE contas (
    id       SERIAL PRIMARY KEY,
    titular  VARCHAR(80) NOT NULL,
    saldo    NUMERIC(10, 2) NOT NULL
);
INSERT INTO categorias (nome) VALUES ('Teclados'), ('Mouses'), ('Monitores');
INSERT INTO produtos (nome, preco, estoque, categoria_id) VALUES
    ('Teclado Mecânico', 249.90, 15, 1),
    ('Mouse Gamer',      129.90, 40, 2),
    ('Monitor 24 pol',   899.00,  8, 3),
    ('Teclado Compacto', 179.90,  0, 1);
INSERT INTO clientes (nome, email) VALUES
    ('Ana',   'ana@exemplo.com'),
    ('Bruno', 'bruno@exemplo.com'),
    ('Carla', 'carla@exemplo.com');
INSERT INTO pedidos (id, cliente_id, total) VALUES (101, 1, 250.00), (102, 1, 80.00), (103, 2, 129.90);
INSERT INTO contas (titular, saldo) VALUES ('Conta 1', 500.00), ('Conta 2', 300.00);
`;
