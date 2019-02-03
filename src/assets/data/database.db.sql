BEGIN TRANSACTION;
DROP TABLE IF EXISTS `user`;
CREATE TABLE IF NOT EXISTS `user` (
	`id`	INTEGER NOT NULL,
	`name`	TEXT NOT NULL,
	`username`	TEXT NOT NULL UNIQUE,
	`password`	TEXT NOT NULL,
	`role`	TEXT NOT NULL,
	PRIMARY KEY(`id`)
);

DROP TABLE IF EXISTS `session`;
CREATE TABLE IF NOT EXISTS `session` (
	`id`	INTEGER NOT NULL,
	`name`	TEXT NOT NULL,
	`start`  INTEGER NOT NULL,
	`end`  INTEGER NOT NULL,
	`limit`  INTEGER NOT NULL,
	`instructor_id`  INTEGER NOT NULL,
	`training_id`  INTEGER NOT NULL,
	FOREIGN KEY(instructor_id) REFERENCES instructor(id),
	FOREIGN KEY(training_id) REFERENCES training(id),
	PRIMARY KEY(`id`)
);

DROP TABLE IF EXISTS `inbox`;
CREATE TABLE IF NOT EXISTS `inbox` (
	`id`	INTEGER NOT NULL,
	`date`	INTEGER NOT NULL,
	`from`  INTEGER NOT NULL,
	`to`  INTEGER NOT NULL,
	`deleted`  INTEGER NOT NULL,
    `read`  INTEGER NOT NULL,
	`subject`  TEXT NOT NULL,
	`content`  TEXT NOT NULL,
	FOREIGN KEY(`from`) REFERENCES user(id),
	FOREIGN KEY(`to`) REFERENCES user(id),
	PRIMARY KEY(`id`)
);

DROP TABLE IF EXISTS `attachment`;
CREATE TABLE IF NOT EXISTS `attachment` (
	`id`	INTEGER NOT NULL,
	`name`	TEXT NOT NULL,
	`file`  BLOB NOT NULL,
	`type`  TEXT NOT NULL,
	`inbox_id`  INTEGER NOT NULL,
	FOREIGN KEY(inbox_id) REFERENCES inbox(id),
	PRIMARY KEY(`id`)
);

DROP TABLE IF EXISTS `weekday`;
CREATE TABLE IF NOT EXISTS `weekday` (
	`id`	INTEGER NOT NULL,
	`name`	TEXT NOT NULL,
	`time`  TEXT NOT NULL,
	`session_id`  INTEGER NOT NULL,
	`room_id`  INTEGER NOT NULL,
	FOREIGN KEY(session_id) REFERENCES session(id),
	FOREIGN KEY(room_id) REFERENCES room(id),
	PRIMARY KEY(`id`)
);

DROP TABLE IF EXISTS `intern`;
CREATE TABLE IF NOT EXISTS `intern` (
	`id`	INTEGER NOT NULL,
	`name`	TEXT NOT NULL,
	`birth`	TEXT,
	`name_arabic`	TEXT NOT NULL,
	`address`	TEXT,
	`phone`	TEXT NOT NULL,
	`phone2`	TEXT,
	`email`	TEXT,
	`photo`	BLOB,
	`scholar`	TEXT,
	`sold`	INTEGER NOT NULL,
    `isAllowed`	INTEGER NOT NULL,
    `parent`	INTEGER,
    FOREIGN KEY(parent) REFERENCES user(id),
	PRIMARY KEY(`id`)
);

DROP TABLE IF EXISTS `visitor`;
CREATE TABLE IF NOT EXISTS `visitor` (
	`id`	INTEGER NOT NULL,
	`name`	TEXT NOT NULL,
	`phone`	TEXT NOT NULL,
	`comment`	TEXT NOT NULL,
	PRIMARY KEY(`id`)
);

DROP TABLE IF EXISTS `instructor`;
CREATE TABLE IF NOT EXISTS `instructor` (
	`id`	INTEGER NOT NULL,
	`name`	TEXT NOT NULL,
    `name_arabic`	TEXT NOT NULL,
    `address`	TEXT NOT NULL,
    `phone`	TEXT NOT NULL,
    `email`	TEXT NOT NULL,
    `sold`	INTEGER NOT NULL,
	PRIMARY KEY(`id`)
);

DROP TABLE IF EXISTS `room`;
CREATE TABLE IF NOT EXISTS `room` (
	`id`	INTEGER NOT NULL,
	`number`	TEXT NOT NULL,
	`capacity`  INTEGER NOT NULL,
	PRIMARY KEY(`id`)
);

DROP TABLE IF EXISTS `school`;
CREATE TABLE IF NOT EXISTS `school` (
	`id`	INTEGER NOT NULL,
	`name`	TEXT NOT NULL,
	`photo`  BLOB,
	PRIMARY KEY(`id`)
);

DROP TABLE IF EXISTS `payment`;
CREATE TABLE IF NOT EXISTS `payment` (
	`id`	INTEGER NOT NULL,
	`amount`	NUMERIC NOT NULL,
	`date`  TEXT NOT NULL,
	`comment`  TEXT NOT NULL,
	`training`  TEXT NOT NULL,
	`month`  TEXT NOT NULL,
	`intern_id`	INTEGER NOT NULL,
	FOREIGN KEY(intern_id) REFERENCES intern(id),
	PRIMARY KEY(`id`)
);

DROP TABLE IF EXISTS `payment_instructor`;
CREATE TABLE IF NOT EXISTS `payment_instructor` (
	`id`	INTEGER NOT NULL,
	`amount`	NUMERIC NOT NULL,
	`date`  TEXT NOT NULL,
	`comment`  TEXT NOT NULL,
	`instructor_id`	INTEGER NOT NULL,
	FOREIGN KEY(instructor_id) REFERENCES instructor(id),
	PRIMARY KEY(`id`)
);

DROP TABLE IF EXISTS `exam`;
CREATE TABLE IF NOT EXISTS `exam` (
	`id`	INTEGER NOT NULL,
	`date`  TEXT NOT NULL,
	`time`  TEXT NOT NULL,
	`comment`  TEXT NOT NULL,
	`mark`	INTEGER NOT NULL,
	`result` INTEGER NOT NULL,
	`retake` INTEGER NOT NULL,
	`intern_id`	INTEGER NOT NULL,
	`session_id`	INTEGER NOT NULL,
    FOREIGN KEY(intern_id) REFERENCES intern(id),
    FOREIGN KEY(session_id) REFERENCES session(id),
	PRIMARY KEY(`id`)
);

DROP TABLE IF EXISTS `training`;
CREATE TABLE IF NOT EXISTS `training` (
	`id`	INTEGER NOT NULL,
	`name`	TEXT NOT NULL,
	`time`	TEXT NOT NULL,
	`type`  TEXT NOT NULL,
	`training_fees`	INTEGER NOT NULL,
	`books_fees`	INTEGER NOT NULL,
	`enrollment_fees`	INTEGER NOT NULL,
	PRIMARY KEY(`id`)
);

DROP TABLE IF EXISTS `attendance`;
CREATE TABLE IF NOT EXISTS `attendance` (
	`id`	INTEGER NOT NULL,
    `date`  TEXT NOT NULL,
	`present`	INTEGER NOT NULL,
	`intern_id`	INTEGER NOT NULL,
    `session_id`  INTEGER NOT NULL,
    `weekday_id`  INTEGER NOT NULL,
    FOREIGN KEY(session_id) REFERENCES session(id),
    FOREIGN KEY(weekday_id) REFERENCES weekday(id),
    FOREIGN KEY(intern_id) REFERENCES intern(id),
	PRIMARY KEY(`id`)
);

DROP TABLE IF EXISTS `enrollment`;
CREATE TABLE IF NOT EXISTS `enrollment` (
	`id`	INTEGER NOT NULL,
	`comment`  TEXT NOT NULL,
	`date`  TEXT NOT NULL,
    `session_id`  INTEGER NOT NULL,
    `intern_id`	INTEGER NOT NULL,
    FOREIGN KEY(session_id) REFERENCES session(id),
    FOREIGN KEY(intern_id) REFERENCES intern(id),
	PRIMARY KEY(`id`)
);

COMMIT;
