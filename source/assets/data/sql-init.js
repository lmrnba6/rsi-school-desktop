export const sqlInit =
    `CREATE TABLE IF NOT EXISTS "user" (
    "id"	SERIAL NOT NULL,
    "name"	TEXT NOT NULL,
    "username"	TEXT NOT NULL UNIQUE,
    "password"	TEXT NOT NULL,
    "role"	TEXT NOT NULL,
    PRIMARY KEY("id")
);

    CREATE TABLE IF NOT EXISTS "training" (
    "id"	SERIAL NOT NULL,
    "name"	TEXT NOT NULL,
    "time"	TEXT NOT NULL,
    "type"  TEXT NOT NULL,
    "training_fees"	INTEGER NOT NULL,
    "books_fees"	INTEGER NOT NULL,
    "enrollment_fees"	INTEGER NOT NULL,
    PRIMARY KEY("id")
);

CREATE TABLE IF NOT EXISTS "questionnaire" (
    "id"	SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "timed" INTEGER NOT NULL,
    "jump"	INTEGER NOT NULL,
    "save"	INTEGER NOT NULL,
    "number"	INTEGER NOT NULL,
    "training"	INTEGER,
    FOREIGN KEY(training) REFERENCES "training"(id),
    PRIMARY KEY("id")
);

    CREATE TABLE IF NOT EXISTS "instructor" (
    "id"	SERIAL NOT NULL,
    "name"	TEXT NOT NULL,
    "name_arabic"	TEXT NOT NULL,
    "address"	TEXT NOT NULL,
    "phone"	TEXT NOT NULL,
    "email"	TEXT NOT NULL,
    "sold"	INTEGER NOT NULL,
    "isFullTime" INTEGER,
    "user_id" INTEGER,
    FOREIGN KEY(user_id) REFERENCES "user"(id),
    PRIMARY KEY("id")
);

    CREATE TABLE IF NOT EXISTS "session" (
    "id"	SERIAL NOT NULL,
    "name"	TEXT NOT NULL,
    "start"  TEXT NOT NULL,
    "end"  TEXT NOT NULL,
    "limit"  INTEGER NOT NULL,
    "instructor_id"  INTEGER NOT NULL,
    "training_id"  INTEGER NOT NULL,
    "closed"  BOOLEAN,
    FOREIGN KEY(instructor_id) REFERENCES "instructor"(id),
    FOREIGN KEY(training_id) REFERENCES "training"(id),
    PRIMARY KEY("id")
);

    CREATE TABLE IF NOT EXISTS "inbox" (
    "id"	SERIAL NOT NULL,
    "date"	TEXT NOT NULL,
    "from"  INTEGER NOT NULL,
    "to"  INTEGER NOT NULL,
    "deleted"  INTEGER NOT NULL,
    "read"  INTEGER NOT NULL,
    "subject"  TEXT NOT NULL,
    "content"  TEXT NOT NULL,
    FOREIGN KEY("from") REFERENCES "user"(id),
    FOREIGN KEY("to") REFERENCES "user"(id),
    PRIMARY KEY("id")
);

    CREATE TABLE IF NOT EXISTS "attachment" (
    "id"	SERIAL NOT NULL,
    "name"	TEXT NOT NULL,
    "file"  BYTEA NOT NULL,
    "type"  TEXT NOT NULL,
    "inbox_id"  INTEGER NOT NULL,
    FOREIGN KEY(inbox_id) REFERENCES "inbox"(id),
    PRIMARY KEY("id")
);

    CREATE TABLE IF NOT EXISTS "room" (
    "id"	SERIAL NOT NULL,
    "number"	TEXT NOT NULL,
    "capacity"  INTEGER NOT NULL,
    PRIMARY KEY("id")
);

    CREATE TABLE IF NOT EXISTS "weekday" (
    "id"	SERIAL NOT NULL,
    "name"	TEXT NOT NULL,
    "time"  TEXT NOT NULL,
    "session_id"  INTEGER NOT NULL,
    "room_id"  INTEGER NOT NULL,
    FOREIGN KEY(session_id) REFERENCES "session"(id),
    FOREIGN KEY(room_id) REFERENCES "room"(id),
    PRIMARY KEY("id")
);

    CREATE TABLE IF NOT EXISTS "intern" (
    "id"	SERIAL NOT NULL,
    "name"	TEXT NOT NULL,
    "birth"	TEXT,
    "name_arabic"	TEXT NOT NULL,
    "address"	TEXT,
    "phone"	TEXT NOT NULL,
    "phone2"	TEXT,
    "email"	TEXT,
    "photo"	TEXT,
    "scholar"	TEXT,
    "sold"	NUMERIC NOT NULL,
    "isAllowed"	INTEGER NOT NULL,
    "isPromo"	INTEGER NOT NULL,
    "isVip"	INTEGER NOT NULL,
    "parent"	INTEGER,
    "user_id" INTEGER,
    FOREIGN KEY(user_id) REFERENCES "user"(id),
    FOREIGN KEY(parent) REFERENCES "user"(id),
    PRIMARY KEY("id")
);

    CREATE TABLE IF NOT EXISTS "visitor" (
    "id"	SERIAL NOT NULL,
    "name"	TEXT NOT NULL,
    "phone"	TEXT NOT NULL,
    "comment"	TEXT NOT NULL,
    "date"  TEXT NOT NULL,
    PRIMARY KEY("id")
);

    CREATE TABLE IF NOT EXISTS "commentIntern" (
    "id"	SERIAL NOT NULL,
    "comment"	TEXT NOT NULL,
    "date"  TEXT NOT NULL,
    "intern"	INTEGER NOT NULL,
    FOREIGN KEY(intern) REFERENCES "intern"(id),
    PRIMARY KEY("id")
);

    CREATE TABLE IF NOT EXISTS "commentInstructor" (
    "id"	SERIAL NOT NULL,
    "comment"	TEXT NOT NULL,
    "date"  TEXT NOT NULL,
    "instructor"	INTEGER NOT NULL,
    FOREIGN KEY(instructor) REFERENCES "instructor"(id),
    PRIMARY KEY("id")
);

    CREATE TABLE IF NOT EXISTS "school" (
    "id"	SERIAL NOT NULL,
    "name"	TEXT NOT NULL,
    "dist"	TEXT,
    "address"	TEXT,
    "phone1"	TEXT,
    "phone2"	TEXT,
    "email"	TEXT,
    "website"	TEXT,
    "photo"  BYTEA,
    "api" TEXT,
    "host" TEXT,
    "db" TEXT,
    "user" TEXT,
    "password" TEXT,
    PRIMARY KEY("id")
);

    CREATE TABLE IF NOT EXISTS "payment_instructor" (
    "id"	SERIAL NOT NULL,
    "amount"	NUMERIC NOT NULL,
    "date"  TEXT NOT NULL,
    "comment"  TEXT NOT NULL,
    "instructor_id"	INTEGER NOT NULL,
    FOREIGN KEY(instructor_id) REFERENCES "instructor"(id),
    PRIMARY KEY("id")
);

    CREATE TABLE IF NOT EXISTS "exam" (
    "id"	SERIAL NOT NULL,
    "date"  TEXT NOT NULL,
    "time"  TEXT NOT NULL,
    "comment"  TEXT,
    "mark"	INTEGER,
    "passed"	INTEGER,
    "result" INTEGER,
    "retake" INTEGER,
    "intern_id"	INTEGER NOT NULL,
    "session_id"	INTEGER NOT NULL,
    "questionnaire_id" INTEGER,
    FOREIGN KEY(intern_id) REFERENCES "intern"(id),
    FOREIGN KEY(session_id) REFERENCES "session"(id),
    FOREIGN KEY(questionnaire_id) REFERENCES "questionnaire"(id),
    PRIMARY KEY("id")
);

    CREATE TABLE IF NOT EXISTS "attendance" (
    "id"	SERIAL NOT NULL,
    "date"  TEXT NOT NULL,
    "present"	INTEGER NOT NULL,
    "intern_id"	INTEGER NOT NULL,
    "session_id"  INTEGER NOT NULL,
    "weekday_id"  INTEGER NOT NULL,
    FOREIGN KEY(session_id) REFERENCES "session"(id),
    FOREIGN KEY(weekday_id) REFERENCES "weekday"(id),
    FOREIGN KEY(intern_id) REFERENCES "intern"(id),
    PRIMARY KEY("id")
);

    CREATE TABLE IF NOT EXISTS "enrollment" (
    "id"	SERIAL NOT NULL,
    "comment"  TEXT NOT NULL,
    "date"  TEXT NOT NULL,
    "session_id"  INTEGER NOT NULL,
    "intern_id"	INTEGER NOT NULL,
    FOREIGN KEY(session_id) REFERENCES "session"(id),
    FOREIGN KEY(intern_id) REFERENCES "intern"(id),
    PRIMARY KEY("id")
);

    CREATE TABLE IF NOT EXISTS "charge" (
    "id"	SERIAL NOT NULL,
    "amount"	NUMERIC NOT NULL,
    "rest"	NUMERIC,
    "date"  TEXT NOT NULL,
    "comment"  TEXT NOT NULL,
    "session"  INTEGER NOT NULL,
    "intern"	INTEGER NOT NULL,
    FOREIGN KEY(intern) REFERENCES "intern"(id),
    FOREIGN KEY(session) REFERENCES "session"(id),
    PRIMARY KEY("id")
);

    CREATE TABLE IF NOT EXISTS "payment" (
    "id"	SERIAL NOT NULL,
    "amount"	NUMERIC NOT NULL,
    "rest"	NUMERIC,
    "username" TEXT,
    "date"  TEXT NOT NULL,
    "comment"  TEXT NOT NULL,
    "charge"  INTEGER,
    "error"  INTEGER,
    "month"  TEXT NOT NULL,
    "intern_id"	INTEGER NOT NULL,
    FOREIGN KEY(intern_id) REFERENCES "intern"(id),
    FOREIGN KEY(charge) REFERENCES "charge"(id),
    PRIMARY KEY("id")
);

    CREATE TABLE IF NOT EXISTS "register" (
    "id"	SERIAL NOT NULL,
    "date"  TEXT NOT NULL,
    "amount"  NUMERIC NOT NULL,
    "comment"	TEXT NOT NULL,
    "intern"	TEXT,
    "training"    TEXT,
    "sold"  NUMERIC,
    "rest"  NUMERIC,
    "username" TEXT,
    "responsible" TEXT,
    PRIMARY KEY("id")
);

    CREATE TABLE IF NOT EXISTS "car" (
    "id"	SERIAL NOT NULL,
    "name"  TEXT NOT NULL,
    "make"  TEXT,
    "plate"	TEXT,
    "seat"	INTEGER NOT NULL,
    "comment" TEXT,
    PRIMARY KEY("id")
);

    CREATE TABLE IF NOT EXISTS "transport" (
    "id"	SERIAL NOT NULL,
    "time"  TEXT NOT NULL,
    "day"  TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "comment" TEXT,
    "car"	INTEGER NOT NULL,
    FOREIGN KEY(car) REFERENCES "car"(id),
    PRIMARY KEY("id")
);

    CREATE TABLE IF NOT EXISTS "commute" (
    "id"	SERIAL NOT NULL,
    "comment" TEXT,
    "address" TEXT NOT NULL,
    "transport"	INTEGER NOT NULL,
    "intern"	INTEGER NOT NULL,
    FOREIGN KEY(intern) REFERENCES "intern"(id),
    FOREIGN KEY(transport) REFERENCES "transport"(id),
    PRIMARY KEY("id")
);

    CREATE TABLE IF NOT EXISTS "question" (
    "id"	SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "note" TEXT,
    "sequence" INTEGER NOT NULL,
    "type"	TEXT NOT NULL,
    "questionnaire"	INTEGER NOT NULL,
    FOREIGN KEY(questionnaire) REFERENCES "questionnaire"(id),
    PRIMARY KEY("id")
);

    CREATE TABLE IF NOT EXISTS "answer" (
    "id"	SERIAL NOT NULL,
    "note" TEXT,
    "title" TEXT NOT NULL,
    "correct" INTEGER,
    "question"	INTEGER NOT NULL,
    FOREIGN KEY(question) REFERENCES "question"(id),
    PRIMARY KEY("id")
);

    CREATE TABLE IF NOT EXISTS "mark" (
    "id"	SERIAL NOT NULL,
    "answer" TEXT NOT NULL,
    "exam" INTEGER NOT NULL,
    "question"	INTEGER NOT NULL,
    FOREIGN KEY(exam) REFERENCES "exam"(id),
    FOREIGN KEY(question) REFERENCES "question"(id),
    PRIMARY KEY("id")
);
`
