import { TheDb } from './thedb';
import {Session} from "./session";
import {Intern} from "./intern";

/**
 * class for selecting, inserting, updating and deleting Enrollments in enrollment table.
 *
 * @export
 * @class Enrollment
 */
export class Enrollment {
    public id = -1;
    public comment = '';
    public date: Date | number;
    public session_id: Session | number;
    public intern_id: Intern | number;

    public static getCount(filter: string): Promise<Enrollment[]> {
        return TheDb.selectAll(`SELECT count(*) as count FROM "enrollment" WHERE date LIKE '%${filter}%'`, {})
            .then((count: any) => count);
    }

    public static getCountByIntern(intern: number): Promise<Enrollment[]> {
        return TheDb.selectAll(`SELECT count(*) as count  FROM "enrollment" AS e 
                                                   INNER JOIN "intern" AS i ON e.intern_id = i.id
                                                   INNER JOIN "session" AS s ON e.session_id = s.id
                                                   INNER JOIN "training" AS t ON s.training_id = t.id
                                                   WHERE i.id = ${intern}`, {})
            .then((count: any) => count);
    }

    public static get(id: number): Promise<Enrollment> {
        const sql = `SELECT * FROM "enrollment" WHERE id = ${id}`;
        const values = {};

        return TheDb.selectOne(sql, values)
            .then((row) => {
                if (row) {
                    return new Enrollment().fromRow(row);
                } else {
                    throw new Error('Expected to find 1 Enrollment. Found 0.');
                }
            });
    }


    public static getAll(): Promise<Enrollment[]> {
        const sql = `SELECT * FROM "enrollment" ORDER BY date DESC`;
        const values = {};

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const users: Enrollment[] = [];
                for (const row of rows) {
                    const enrollment = new Enrollment().fromRow(row);
                    users.push(enrollment);
                }
                return users;
            });
    }

    public static getAllBySession(session: number): Promise<Enrollment[]> {
        const sql = `SELECT e.id, e.comment, e.date, e.intern_id, s.training_id, e.session_id  FROM "enrollment" AS e 
                                                    INNER JOIN "intern" AS i ON e.intern_id = i.id
                                                   INNER JOIN "session" AS s ON e.session_id = s.id
                                                   INNER JOIN "training" AS t ON s.training_id = t.id
                                                   WHERE s.id = ${session}`;
        const values = {};

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const users: Enrollment[] = [];
                for (const row of rows) {
                    const enrollment = new Enrollment().fromRow(row);
                    users.push(enrollment);
                }
                return users;
            });
    }

    public static getAllByIntern(intern: number): Promise<Enrollment[]> {
        const sql = `SELECT e.*, t.name as training, s.name as session FROM "enrollment" AS e 
                                                    INNER JOIN "intern" AS i ON e.intern_id = i.id
                                                   INNER JOIN "session" AS s ON e.session_id = s.id
                                                   INNER JOIN "training" AS t ON s.training_id = t.id
                                                   WHERE i.id = ${intern}`;
        const values = {};

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const users: Enrollment[] = [];
                for (const row of rows) {
                    const enrollment = new Enrollment().fromRow(row);
                    users.push(enrollment);
                }
                return users;
            });
    }

    public static getAllGroupByTrainingByIntern(date1: number, date2: number): Promise<Enrollment[]> {
        const sql = `SELECT t.name, count(i.id) as interns FROM "enrollment" as e 
				inner join "session" as s On e.session_id = s.id 
				inner join "training" as t on s.training_id = t.id
                inner join "intern" as i on e.intern_id = i.id 
                where e.date between '${date1}' and '${date2}'
                group by t.name`
        const values = {};

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const users: Enrollment[] = [];
                for (const row of rows) {
                    const enrollment = new Enrollment().fromRow(row);
                    users.push(enrollment);
                }
                return users;
            });
    }

    public static getAllPaged(pageIndex: number, pageSize: number, sort: string, order: string, filter: string): Promise<Enrollment[]> {
        const sql = `SELECT e.id, e.comment, e.date, e.intern_id, s.training_id, e.session_id , t.name as training_id, 
                                            s.name as session, i.name as intern, ins.name as instructor  FROM "enrollment" AS e 
                                                   INNER JOIN "intern" AS i ON e.intern_id = i.id
                                                   INNER JOIN "session" AS s ON e.session_id = s.id
                                                   INNER JOIN "training" AS t ON s.training_id = t.id
                                                   INNER JOIN "instructor" AS ins ON s.instructor_id = ins.id
                                                   WHERE e.date LIKE '%${filter}%' OR 
                                                    i.name LIKE '%${filter}%' OR 
                                                    t.name LIKE '%${filter}%' OR
                                                    s.name LIKE '%${filter}%' 
                            ORDER BY ${sort} ${order} LIMIT ${pageSize} OFFSET ${pageIndex}`;
        const values = {
        };

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const users: Enrollment[] = [];
                for (const row of rows) {
                    const enrollment = new Enrollment().fromRow(row);
                    users.push(enrollment);
                }
                return users;
            });
    }

    public static getAllPagedByIntern(pageIndex: number, pageSize: number, sort: string, order: string, intern: number): Promise<Enrollment[]> {
        const sql = `SELECT e.id, e.comment, e.date, e.intern_id, s.training_id, e.session_id, t.name as training_id,
                                                s.name as session, i.name as intern, ins.name as instructor  FROM "enrollment" AS e 
                                                    INNER JOIN "intern" AS i ON e.intern_id = i.id
                                                   INNER JOIN "session" AS s ON e.session_id = s.id
                                                   INNER JOIN "training" AS t ON s.training_id = t.id
                                                   INNER JOIN "instructor" AS ins ON s.instructor_id = ins.id
                                                   WHERE i.id = ${intern}
                                               
                            ORDER BY ${sort} ${order} LIMIT ${pageSize} OFFSET ${pageIndex}`;
        const values = {
        };

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const users: Enrollment[] = [];
                for (const row of rows) {
                    const enrollment = new Enrollment().fromRow(row);
                    users.push(enrollment);
                }
                return users;
            });
    }

    public insert(): Promise<void> {
        const sql = `
            INSERT INTO "enrollment" (date, comment, intern_id, session_id)
            VALUES('${this.date}', '${this.comment}', ${this.intern_id}, ${this.session_id})`;

        const values = {
        };

        return TheDb.insert(sql, values)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Enrollment to be inserted. Was ${result.changes}`);
                } else {
                    this.id = result.lastID;
                }
            });
    }

    public update(): Promise<void> {
        const sql = `
            UPDATE "enrollment"
               SET date = '${this.date}', comment = '${this.comment}', intern_id = ${this.intern_id}, session_id = ${this.session_id}
             WHERE id = ${this.id}`;

        const values = {
        };

        return TheDb.update(sql, values)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Enrollment to be updated. Was ${result.changes}`);
                }
            });
    }

    public static delete(id: number): Promise<void> {
        const sql = `
            DELETE FROM "enrollment" WHERE id = ${id}`;

        const values = {
        };

        return TheDb.delete(sql, values)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Enrollment to be deleted. Was ${result.changes}`);
                }
            });
    }

    public fromRow(row: object): Enrollment {
        this.id = row['id'];
        this.date = row['date'];
        this.comment = row['comment'];
        this.intern_id = row['intern_id'];
        this.session_id = row['session_id'];
        this['training_id'] = row['training_id'];
        this['name'] = row['name'];
        this['interns'] = row['interns'];
        this['limit'] = row['limit'];
        this['session'] = row['session'];
        this['intern'] = row['intern'];
        this['instructor'] = row['instructor'];
        this['training'] = row['training'];
        return this;
    }
}
