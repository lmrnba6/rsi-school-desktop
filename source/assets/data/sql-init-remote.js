export const sqlInitRemote =
    `CREATE TABLE IF NOT EXISTS "inbox_remote" (
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

    CREATE TABLE IF NOT EXISTS "mark_remote" (
    "id"	SERIAL NOT NULL,
    "answer" TEXT NOT NULL,
    "exam" INTEGER NOT NULL,
    "question"	INTEGER NOT NULL,
    FOREIGN KEY(exam) REFERENCES "exam"(id),
    FOREIGN KEY(question) REFERENCES "question"(id),
    PRIMARY KEY("id")
);`

