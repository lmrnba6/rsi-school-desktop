BEGIN TRANSACTION;

ALTER TABLE register
ADD COLUMN sold INTEGER;
ADD COLUMN rest INTEGER;
ADD COLUMN intern TEXT;
ADD COLUMN training TEXT;

COMMIT;
