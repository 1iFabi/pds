-- Script para configurar la base de datos local de PDS
CREATE DATABASE pds_local;
CREATE USER pds_user WITH PASSWORD 'admin';
GRANT ALL PRIVILEGES ON DATABASE pds_local TO pds_user;

-- Conectar a la base de datos creada
\c pds_local

-- Otorgar permisos adicionales en PostgreSQL 15+
GRANT ALL ON SCHEMA public TO pds_user;
ALTER DATABASE pds_local OWNER TO pds_user;
