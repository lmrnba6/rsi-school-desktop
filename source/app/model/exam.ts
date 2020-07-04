import { TheDb } from './thedb';
import {Intern} from "./intern";
import {Session} from "./session";
import {Settings} from "./settings";

/**
 * class for selecting, inserting, updating and deleting exams in exam table.
 *
 * @export
 * @class Exam
 */
export class Exam {
    public id = -1;
    public mark: number;
    public result: number = 0;
    public retake: number = 0;
    public date: Date | number;
    public time = '';
    public comment= '';
    public intern_id: number | Intern;
    public session_id: number | Session;


    public static getCount(filter: string): Promise<Exam[]> {
        const sql = Settings.isDbLocal ? `SELECT count(*) as count FROM "exam" WHERE date LIKE '%${filter}%' OR 
                                        mark LIKE '%${filter}%'` :
            `SELECT count(*) as count FROM "exam" AS e 
                                             INNER JOIN "session" AS s ON e.session_id = s.id
                                             INNER JOIN "training" AS t ON s.training_id = t.id
                                             INNER JOIN "intern" AS i ON e.intern_id = i.id
                                                    WHERE e.date ILIKE '%${filter}%' OR 
                                                    CAST(e.mark AS TEXT) LIKE '%${filter}%'  OR 
                             t.name ILIKE '%${filter}%' OR i.name ILIKE '%${filter}%' OR s.name ILIKE '%${filter}%'`;
        return TheDb.selectAll(sql, {})
            .then((count: any) => count);
    }

    public static getCountByIntern(intern: number): Promise<Exam[]> {
        return TheDb.selectAll(`SELECT count(*) as count FROM "exam" AS e 
                                              INNER JOIN "session" AS s ON e.session_id = s.id
                                             INNER JOIN "training" AS t ON s.training_id = t.id
                                             INNER JOIN "intern" AS i ON e.intern_id = i.id
                                            
                                                    WHERE i.id = ${intern}`, {})
            .then((count: any) => count);
    }

    public static getCountBySession(session: number): Promise<Exam[]> {
        return TheDb.selectAll(`SELECT count(*) as count FROM "exam" AS e 
                                              INNER JOIN "session" AS s ON e.session_id = s.id
                                             INNER JOIN "training" AS t ON s.training_id = t.id
                                             INNER JOIN "intern" AS i ON e.intern_id = i.id
                                            
                                                    WHERE s.id = ${session}`, {})
            .then((count: any) => count);
    }

    public static get(id: number): Promise<Exam> {
        const sql = `SELECT * FROM "exam" WHERE id = ${id}`;
        const values = {};

        return TheDb.selectOne(sql, values)
            .then((row) => {
                if (row) {
                    return new Exam().fromRow(row);
                } else {
                    throw new Error('Expected to find 1 Exam. Found 0.');
                }
            });
    }


    public static getAll(): Promise<Exam[]> {
        const sql = `SELECT * FROM "exam" ORDER BY date DESC`;
        const values = {};

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const exams: Exam[] = [];
                for (const row of rows) {
                    const exam = new Exam().fromRow(row);
                    exams.push(exam);
                }
                return exams;
            });
    }

    public static getAllPaged(pageIndex: number, pageSize: number, sort: string, order: string, filter: string): Promise<Exam[]> {
        const sql = Settings.isDbLocal ? `SELECT e.id, e.mark, e.result, e.retake, e.date, e.time, e.comment, s.training_id, e.intern_id, e.session_id, i.name as intern, s.name as session, t.name as training
                                            FROM "exam" AS e 
                                             INNER JOIN "training" AS t ON s.training_id = t.id
                                             INNER JOIN "intern" AS i ON e.intern_id = i.id
                                             INNER JOIN "session" AS s ON e.session_id = s.id
                                                    WHERE e.date LIKE '%${filter}%' OR 
                            e.mark LIKE '%${filter}%'  OR 
                            e.result LIKE '%${filter}%' OR t.name LIKE '%${filter}%' OR i.name LIKE '%${filter}%' OR s.name LIKE '%${filter}%'
                            ORDER BY ${sort} ${order} LIMIT ${pageSize} OFFSET ${pageIndex}` :
            `SELECT e.id, e.mark, e.result, e.retake, e.date, e.time, e.comment, s.training_id, e.intern_id, e.session_id, i.name as intern, s.name as session, t.name as training
                                            FROM "exam" AS e 
                                             INNER JOIN "session" AS s ON e.session_id = s.id
                                             INNER JOIN "training" AS t ON s.training_id = t.id
                                             INNER JOIN "intern" AS i ON e.intern_id = i.id
                                                    WHERE e.date ILIKE '%${filter}%' OR 
                                                    CAST(e.mark AS TEXT) LIKE '%${filter}%'  OR 
                             t.name ILIKE '%${filter}%' OR i.name ILIKE '%${filter}%' OR s.name ILIKE '%${filter}%'
                            ORDER BY ${sort} ${order} LIMIT ${pageSize} OFFSET ${pageIndex}`;
        const values = {
        };

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const exams: Exam[] = [];
                for (const row of rows) {
                    const exam = new Exam().fromRow(row);
                    exams.push(exam);
                }
                return exams;
            });
    }

    public static getAllPagedByIntern(pageIndex: number, pageSize: number, sort: string, order: string, intern: number): Promise<Exam[]> {
        const sql = `SELECT e.id, e.mark, e.result, e.retake, e.date, e.time, e.comment, s.training_id, e.intern_id, e.session_id, i.name as intern, s.name as session, t.name as training
                                                FROM "exam" AS e 
                                                INNER JOIN "session" AS s ON e.session_id = s.id
                                             INNER JOIN "training" AS t ON s.training_id = t.id
                                             INNER JOIN "intern" AS i ON e.intern_id = i.id
                                             
                                                    WHERE i.id = ${intern}  
                           
                            ORDER BY ${sort} ${order} LIMIT ${pageSize} OFFSET ${pageIndex}`;
        const values = {};

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const exams: Exam[] = [];
                for (const row of rows) {
                    const exam = new Exam().fromRow(row);
                    exams.push(exam);
                }
                return exams;
            });
    }

    public static getAllPagedBySession(pageIndex: number, pageSize: number, sort: string, order: string, session: number): Promise<Exam[]> {
        const sql = `SELECT e.id, e.mark, e.result, e.retake, e.date, e.time, e.comment, s.training_id, e.intern_id, e.session_id, i.name as intern, s.name as session, t.name as training
                                                FROM "exam" AS e 
                                                INNER JOIN "session" AS s ON e.session_id = s.id
                                             INNER JOIN "training" AS t ON s.training_id = t.id
                                             INNER JOIN "intern" AS i ON e.intern_id = i.id
                                             
                                                    WHERE s.id = ${session}  
                           
                            ORDER BY ${sort} ${order} LIMIT ${pageSize} OFFSET ${pageIndex}`;
        const values = {};

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const exams: Exam[] = [];
                for (const row of rows) {
                    const exam = new Exam().fromRow(row);
                    exams.push(exam);
                }
                return exams;
            });
    }

    public insert(): Promise<void> {
        const sql = `
            INSERT INTO "exam" (mark, result, date, retake, comment, time, intern_id, session_id)
            VALUES('${this.mark}', '${this.result}', '${this.date}', '${this.retake}', 
            '${this.comment ? this.comment.replace(/\'/g, "''") : ''}', '${this.time}', ${this.intern_id}, ${this.session_id})`;

        const values = {
        };

        return TheDb.insert(sql, values)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Exam to be inserted. Was ${result.changes}`);
                } else {
                    this.id = result.lastID;
                }
            });
    }

    public update(): Promise<void> {
        const sql = `
            UPDATE "exam"
               SET mark = '${this.mark}',
                date = '${this.date}', retake= '${this.retake}', comment = '${this.comment ? this.comment.replace(/\'/g, "''") : ''}',
                result = '${this.result}', time = '${this.time}', intern_id = '${this.intern_id}',
                session_id = '${this.session_id}'
             WHERE id = ${this.id}`;

        const values = {
        };

        return TheDb.update(sql, values)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Exam to be updated. Was ${result.changes}`);
                }
            });
    }

    public static delete(id: number): Promise<void> {
        const sql = `
            DELETE FROM "exam" WHERE id = ${id}`;

        const values = {
        };

        return TheDb.delete(sql, values)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Exam to be deleted. Was ${result.changes}`);
                }
            });
    }

    public fromRow(row: object): Exam {
        this.id = row['id'];
        this.mark = row['mark'];
        this.result = row['result'];
        this.date = row['date'];
        this.time = row['time'];
        this.retake = row['retake'];
        this.comment = row['comment'];
        this.intern_id = row['intern_id'];
        this.session_id = row['session_id'];
        this['training_id'] = row['training_id'];
        this['intern'] = row['intern'];
        this['session'] = row['session'];
        this['training'] = row['training'];
        return this;
    }

}
