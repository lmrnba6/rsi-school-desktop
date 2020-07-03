--BEGIN TRANSACTION;
--
--DROP TABLE IF EXISTS `school`;
--CREATE TABLE IF NOT EXISTS `school` (
--	`id`	INTEGER NOT NULL,
--	`name`	TEXT NOT NULL,
--	`photo`  BLOB,
--	PRIMARY KEY(`id`)
--);
--
--DROP TABLE IF EXISTS `inbox`;
--CREATE TABLE IF NOT EXISTS `inbox` (
--	`id`	INTEGER NOT NULL,
--	`date`	INTEGER NOT NULL,
--	`from`  INTEGER NOT NULL,
--	`to`  INTEGER NOT NULL,
--	`deleted`  INTEGER NOT NULL,
--	`read`  INTEGER NOT NULL,
--	`subject`  TEXT NOT NULL,
--	`content`  TEXT NOT NULL,
--	FOREIGN KEY(`from`) REFERENCES user(id),
--	FOREIGN KEY(`to`) REFERENCES user(id),
--	PRIMARY KEY(`id`)
--);
--
--DROP TABLE IF EXISTS `attachment`;
--CREATE TABLE IF NOT EXISTS `attachment` (
--	`id`	INTEGER NOT NULL,
--	`name`	TEXT NOT NULL,
--	`file`  BLOB NOT NULL,
--	`inbox_id`  INTEGER NOT NULL,
--	FOREIGN KEY(inbox_id) REFERENCES inbox(id),
--	PRIMARY KEY(`id`)
--);
--
--DROP TABLE IF EXISTS `intern`;
--CREATE TABLE IF NOT EXISTS `intern` (
--	`id`	INTEGER NOT NULL,
--	`name`	TEXT NOT NULL,
--	`birth`	TEXT,
--	`name_arabic`	TEXT NOT NULL,
--	`address`	TEXT,
--	`phone`	TEXT NOT NULL,
--	`phone2`	TEXT,
--	`email`	TEXT,
--	`photo`	BLOB,
--	`scholar`	TEXT,
--	`sold`	INTEGER NOT NULL,
--    `isAllowed`	INTEGER NOT NULL,
--	PRIMARY KEY(`id`)
--);
--
--INSERT INTO school (name, photo) VALUES ('', '');
--
--ALTER TABLE intern
--ADD COLUMN phone2 TEXT;
--
--ALTER TABLE training
--ADD COLUMN enrollment_fees INTEGER;
--
--COMMIT;