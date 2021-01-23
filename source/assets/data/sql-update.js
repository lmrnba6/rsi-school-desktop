export const sqlUpdate =
    `CREATE TABLE IF NOT EXISTS "charge"
(
    "id"      SERIAL  NOT NULL,
    "amount"  NUMERIC NOT NULL,
    "rest"    NUMERIC,
    "date"    TEXT    NOT NULL,
    "comment" TEXT    NOT NULL,
    "session" INTEGER NOT NULL,
    "intern"  INTEGER NOT NULL,
    FOREIGN KEY (intern) REFERENCES "intern" (id),
    FOREIGN KEY (session) REFERENCES "session" (id),
    PRIMARY KEY ("id")
);

ALTER TABLE payment
    ADD COLUMN IF NOT EXISTS charge INTEGER REFERENCES "charge" (id);

ALTER TABLE school
    ADD COLUMN IF NOT EXISTS address TEXT;

ALTER TABLE school
    ADD COLUMN IF NOT EXISTS phone1 TEXT;

ALTER TABLE school
    ADD COLUMN IF NOT EXISTS phone2 TEXT;

ALTER TABLE school
    ADD COLUMN IF NOT EXISTS email TEXT;

ALTER TABLE school
    ADD COLUMN IF NOT EXISTS website TEXT;

ALTER TABLE exam
    ADD COLUMN IF NOT EXISTS passed INTEGER;

ALTER TABLE exam
    ADD COLUMN IF NOT EXISTS questionnaire_id INTEGER REFERENCES "questionnaire" (id);

ALTER TABLE intern
    ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES "user" (id);

ALTER TABLE instructor
    ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES "user" (id);

ALTER TABLE payment
    DROP COLUMN IF EXISTS training;

alter table exam
    alter comment drop not null;

alter table exam
    alter mark drop not null;

alter table exam
    alter result drop not null;

alter table exam
    alter retake drop not null;

CREATE TABLE IF NOT EXISTS "commentIntern"
(
    "id"      SERIAL  NOT NULL,
    "comment" TEXT    NOT NULL,
    "date"    TEXT    NOT NULL,
    "intern"  INTEGER NOT NULL,
    FOREIGN KEY (intern) REFERENCES "intern" (id),
    PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "commentInstructor"
(
    "id"         SERIAL  NOT NULL,
    "comment"    TEXT    NOT NULL,
    "date"       TEXT    NOT NULL,
    "instructor" INTEGER NOT NULL,
    FOREIGN KEY (instructor) REFERENCES "instructor" (id),
    PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "car"
(
    "id"      SERIAL  NOT NULL,
    "name"    TEXT    NOT NULL,
    "make"    TEXT,
    "plate"   TEXT,
    "seat"    INTEGER NOT NULL,
    "comment" TEXT,
    PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "transport"
(
    "id"        SERIAL  NOT NULL,
    "time"      TEXT    NOT NULL,
    "day"       TEXT    NOT NULL,
    "direction" TEXT    NOT NULL,
    "comment"   TEXT,
    "car"       INTEGER NOT NULL,
    FOREIGN KEY (car) REFERENCES "car" (id),
    PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "commute"
(
    "id"        SERIAL  NOT NULL,
    "comment"   TEXT,
    "address"   TEXT    NOT NULL,
    "transport" INTEGER NOT NULL,
    "intern"    INTEGER NOT NULL,
    FOREIGN KEY (intern) REFERENCES "intern" (id),
    FOREIGN KEY (transport) REFERENCES "transport" (id),
    PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "questionnaire"
(
    "id"          SERIAL  NOT NULL,
    "title"       TEXT    NOT NULL,
    "description" TEXT,
    "timed"       INTEGER NOT NULL,
    "jump"        INTEGER NOT NULL,
    "number"      INTEGER NOT NULL,
    "training"    INTEGER,
    FOREIGN KEY (training) REFERENCES "training" (id),
    PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "question"
(
    "id"            SERIAL  NOT NULL,
    "title"         TEXT    NOT NULL,
    "note"          TEXT,
    "sequence"      INTEGER NOT NULL,
    "type"          TEXT    NOT NULL,
    "questionnaire" INTEGER NOT NULL,
    FOREIGN KEY (questionnaire) REFERENCES "questionnaire" (id),
    PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "answer"
(
    "id"       SERIAL  NOT NULL,
    "title"    TEXT    NOT NULL,
    "note"     TEXT,
    "correct"  INTEGER,
    "question" INTEGER NOT NULL,
    FOREIGN KEY (question) REFERENCES "question" (id),
    PRIMARY KEY ("id")
);
CREATE TABLE IF NOT EXISTS "mark"
(
    "id"       SERIAL  NOT NULL,
    "answer"   TEXT    NOT NULL,
    "exam"     INTEGER NOT NULL,
    "question" INTEGER NOT NULL,
    FOREIGN KEY (exam) REFERENCES "exam" (id),
    FOREIGN KEY (question) REFERENCES "question" (id),
    PRIMARY KEY ("id")
);

ALTER TABLE questionnaire
    ADD COLUMN IF NOT EXISTS save INTEGER NOT NULL;
ALTER TABLE visitor
    ADD COLUMN IF NOT EXISTS date TEXT NOT NULL;
ALTER TABLE register
    ADD COLUMN IF NOT EXISTS responsible TEXT;
ALTER TABLE school
    ADD COLUMN IF NOT EXISTS api TEXT;
ALTER TABLE school
    ADD COLUMN IF NOT EXISTS host TEXT;
ALTER TABLE school
    ADD COLUMN IF NOT EXISTS db TEXT;
ALTER TABLE school
    ADD COLUMN IF NOT EXISTS "user" TEXT;
ALTER TABLE school
    ADD COLUMN IF NOT EXISTS password TEXT;
ALTER TABLE questionnaire
    ALTER save DROP NOT NULL;
ALTER TABLE intern
    ALTER "isPromo" DROP NOT NULL;
ALTER TABLE intern
    ALTER "isVip" DROP NOT NULL;
ALTER TABLE training
    ADD COLUMN IF NOT EXISTS payment_type TEXT;
ALTER TABLE training
    ADD COLUMN IF NOT EXISTS seance_number INTEGER;
ALTER TABLE training
    ADD COLUMN IF NOT EXISTS seance_fees INTEGER;
ALTER TABLE training
    ADD COLUMN IF NOT EXISTS instructor_fees INTEGER;
CREATE TABLE IF NOT EXISTS "charge_instructor" (
    "id"	SERIAL NOT NULL,
    "amount"	NUMERIC NOT NULL,
    "rest"	NUMERIC,
    "date"  TEXT NOT NULL,
    "comment"  TEXT NOT NULL,
    "session"  INTEGER NOT NULL,
    "instructor"	INTEGER NOT NULL,
    FOREIGN KEY(instructor) REFERENCES "instructor"(id),
    FOREIGN KEY(session) REFERENCES "session"(id),
    PRIMARY KEY("id")
);
ALTER TABLE payment_instructor
    ADD COLUMN IF NOT EXISTS charge INTEGER REFERENCES "charge_instructor" (id); 
ALTER TABLE payment_instructor
    ADD COLUMN IF NOT EXISTS rest INTEGER;
ALTER TABLE payment_instructor
    ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE payment_instructor
    ADD COLUMN IF NOT EXISTS error INTEGER;
ALTER TABLE payment_instructor
    ADD COLUMN IF NOT EXISTS month TEXT; 
alter table charge_instructor
    alter session drop not null; 
alter table charge
    alter session drop not null;     
`;
