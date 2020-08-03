export const sql = [
    `CREATE TABLE IF NOT EXISTS "charge" (
  	"id"	SERIAL NOT NULL,
  	"amount"	NUMERIC NOT NULL,
  	"rest"	NUMERIC,
  	"date"  TEXT NOT NULL,
  	"comment"  TEXT NOT NULL,
  	"session"  INTEGER NOT NULL,
  	"intern"	INTEGER NOT NULL,
  	FOREIGN KEY(intern) REFERENCES "intern"(id),
  	FOREIGN KEY(session) REFERENCES "session"(id),
  	PRIMARY KEY("id"));`,

    `ALTER TABLE payment ADD COLUMN charge INTEGER REFERENCES "charge"(id);`,

    `ALTER TABLE exam ADD COLUMN passed INTEGER`,

    `ALTER TABLE exam ADD COLUMN questionnaire_id INTEGER REFERENCES "questionnaire"(id);`,

    `ALTER TABLE intern ADD COLUMN user_id INTEGER REFERENCES "user"(id);`,

    `ALTER TABLE instructor ADD COLUMN user_id INTEGER REFERENCES "user"(id);`,

    `ALTER TABLE payment DROP COLUMN training;`,

    `alter table exam alter comment drop not null;`,

    `alter table exam alter mark drop not null;`,

    `alter table exam alter result drop not null;`,

    `alter table exam alter retake drop not null;`,

    `CREATE TABLE IF NOT EXISTS "commentIntern" (
	"id"	SERIAL NOT NULL,
	"comment"	TEXT NOT NULL,
	"date"  TEXT NOT NULL,
	"intern"    INTEGER NOT NULL,
	FOREIGN KEY(intern) REFERENCES "intern"(id),
	PRIMARY KEY("id"));`,

    `CREATE TABLE IF NOT EXISTS "commentInstructor" (
	"id"	SERIAL NOT NULL,
	"comment"	TEXT NOT NULL,
	"date"  TEXT NOT NULL,
	"instructor"    INTEGER NOT NULL,
	FOREIGN KEY(instructor) REFERENCES "instructor"(id),
	PRIMARY KEY("id"));`,

    `CREATE TABLE IF NOT EXISTS "car" (
    	"id"	SERIAL NOT NULL,
    	"name"  TEXT NOT NULL,
        "make"  TEXT,
        "plate"	TEXT,
        "seat"	INTEGER NOT NULL,
        "comment" TEXT,
    	PRIMARY KEY("id"));`,

    `CREATE TABLE IF NOT EXISTS "transport" (
        "id"	SERIAL NOT NULL,
        "time"  TEXT NOT NULL,
        "day"  TEXT NOT NULL,
        "direction" TEXT NOT NULL,
        "comment" TEXT,
        "car"	INTEGER NOT NULL,
        FOREIGN KEY(car) REFERENCES "car"(id),
        PRIMARY KEY("id"));`,

    `CREATE TABLE IF NOT EXISTS "commute" (
            "id"	SERIAL NOT NULL,
            "comment" TEXT,
            "address"  TEXT NOT NULL,
            "transport"	INTEGER NOT NULL,
            "intern"	INTEGER NOT NULL,
            FOREIGN KEY(intern) REFERENCES "intern"(id),
            FOREIGN KEY(transport) REFERENCES "transport"(id),
            PRIMARY KEY("id"));`,

    `CREATE TABLE IF NOT EXISTS "questionnaire" (
    "id"	SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "timed" INTEGER NOT NULL,
    "jump"	INTEGER NOT NULL,
    "number"	INTEGER NOT NULL,
    "training"	INTEGER,
    FOREIGN KEY(training) REFERENCES "training"(id),
    PRIMARY KEY("id")
);`,

    `CREATE TABLE IF NOT EXISTS "question" (
    "id"	SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "note" TEXT,
    "sequence" INTEGER NOT NULL,
    "type"	TEXT NOT NULL,
    "questionnaire"	INTEGER NOT NULL,
    FOREIGN KEY(questionnaire) REFERENCES "questionnaire"(id),
    PRIMARY KEY("id")
);`,

    `CREATE TABLE IF NOT EXISTS "answer" (
    "id"	SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "note" TEXT,
    "correct" INTEGER,
    "question"	INTEGER NOT NULL,
    FOREIGN KEY(question) REFERENCES "question"(id),
    PRIMARY KEY("id")
);`,
    `CREATE TABLE IF NOT EXISTS "mark" (
    "id" SERIAL NOT NULL,
    "answer" TEXT NOT NULL,
    "exam" INTEGER NOT NULL,
    "question" INTEGER NOT NULL,
    FOREIGN KEY(exam) REFERENCES "exam"(id),
    FOREIGN KEY(question) REFERENCES "question"(id),
    PRIMARY KEY("id")
);`
]
