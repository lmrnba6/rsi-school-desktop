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
  	PRIMARY KEY("id")
);
`,
    `ALTER TABLE payment ADD COLUMN charge INTEGER REFERENCES "charge"(id);`,
    `ALTER TABLE intern ADD COLUMN user_id INTEGER REFERENCES "user"(id);`,
    `ALTER TABLE instructor ADD COLUMN user_id INTEGER REFERENCES "user"(id);`,

    `ALTER TABLE payment DROP COLUMN training;`,

    `CREATE TABLE IF NOT EXISTS "comment" (
	"id"	SERIAL NOT NULL,
	"comment"	TEXT NOT NULL,
	"date"  TEXT NOT NULL,
	"employee"	INTEGER NOT NULL,
	FOREIGN KEY(employee) REFERENCES "user"(id),
	PRIMARY KEY("id"));`
]
