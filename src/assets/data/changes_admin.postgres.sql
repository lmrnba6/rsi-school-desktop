BEGIN TRANSACTION;

ALTER TABLE register
ADD COLUMN sold INTEGER,
ADD COLUMN rest INTEGER,
ADD COLUMN username VARCHAR,
ADD COLUMN intern VARCHAR,
ADD COLUMN training VARCHAR;

ALTER TABLE payment
ADD COLUMN rest INTEGER,
ADD COLUMN username VARCHAR;

ALTER TABLE intern
ADD COLUMN isPromo INTEGER,
ADD COLUMN isVip INTEGER,
ADD COLUMN username INTEGER,
ADD COLUMN comment VARCHAR;

ALTER TABLE instructor
ADD COLUMN isFullTime INTEGER;

COMMIT;