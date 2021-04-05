import { TheDb } from './thedb';
import {Intern} from "./intern";
import {Session} from "./session";
import {Settings} from "./settings";
import {Questionnaire} from "./questionnaire";

/**
 * class for selecting, inserting, updating and deleting exams in exam table.
 *
 * @export
 * @class Exam
 */
export class Exam {
    public id = -1;
    public mark: any = null;
    public result: any = null;
    public retake: any = null;
    public passed: any = null;
    public date: Date | number;
    public time = '';
    public comment= '';
    public intern_id: number | Intern;
    public session_id: number | Session;
    public questionnaire_id: number | Questionnaire;


    public static getCount(filter: string): Promise<Exam[]> {
        const sql = Settings.isDbLocalFile ? `SELECT count(*) as count FROM "exam" WHERE date LIKE '%${filter}%' OR 
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

    public static getCountByInstructor(filter: string, instructor: number): Promise<Exam[]> {
        const sql =
            `SELECT count(e.*) as count
                                                FROM "exam" AS e 
                                                INNER JOIN "session" AS s ON e.session_id = s.id
                                             INNER JOIN "training" AS t ON s.training_id = t.id
                                             INNER JOIN "intern" AS i ON e.intern_id = i.id
                                             LEFT JOIN "questionnaire" AS q ON q.id = e.questionnaire_id
                                             WHERE s.instructor_id = ${instructor} AND
                                             (t.name ILIKE '%${filter}%' OR i.name ILIKE '%${filter}%' 
                                             OR s.name ILIKE '%${filter}%' OR q.title ILIKE '%${filter}%')`;
        return TheDb.selectAll(sql, {})
            .then((count: any) => count);
    }

    public static getCountByIntern(filter: string, intern: number): Promise<Exam[]> {
        return TheDb.selectAll(`SELECT count(*) as count FROM "exam" AS e 
                                                INNER JOIN "session" AS s ON e.session_id = s.id
                                             INNER JOIN "training" AS t ON s.training_id = t.id
                                             INNER JOIN "intern" AS i ON e.intern_id = i.id
                                             LEFT JOIN "questionnaire" AS q ON q.id = e.questionnaire_id
                                             WHERE i.id = ${intern}  AND 
                                             (t.name ILIKE '%${filter}%' OR s.name ILIKE '%${filter}%' 
                                             OR q.title ILIKE '%${filter}%') `, {})
            .then((count: any) => count);
    }

    public static getCountBySession(filter: string, session: number): Promise<Exam[]> {
        return TheDb.selectAll(`SELECT count(*) as count FROM "exam" AS e 
                                                INNER JOIN "session" AS s ON e.session_id = s.id
                                             INNER JOIN "training" AS t ON s.training_id = t.id
                                             INNER JOIN "intern" AS i ON e.intern_id = i.id
                                             LEFT JOIN "questionnaire" AS q ON q.id = e.questionnaire_id
                                             WHERE s.id = ${session}  AND
                                             (t.name ILIKE '%${filter}%' OR i.name ILIKE '%${filter}%' 
                                             OR s.name ILIKE '%${filter}%' OR q.title ILIKE '%${filter}%')`, {})
            .then((count: any) => count);
    }

    public static getCountByInstructorGroupedBySession(filter: string, instructor: number): Promise<Exam[]> {
        const sql = `SELECT count(e.*) as count
                                                FROM "exam" AS e 
                                                INNER JOIN "session" AS s ON e.session_id = s.id
                                             INNER JOIN "training" AS t ON s.training_id = t.id
                                             INNER JOIN "intern" AS i ON e.intern_id = i.id
                                             INNER JOIN "instructor" AS ins ON s.instructor_id = ins.id
                                             LEFT JOIN "questionnaire" AS q ON q.id = e.questionnaire_id
                                             WHERE s.instructor_id = ${instructor} AND
                                             (t.name ILIKE '%${filter}%' OR s.name ILIKE '%${filter}%' 
                                             OR q.title ILIKE '%${filter}%' OR ins.name ILIKE '%${filter}%')  
                           group by e.date, s.name, t.name, ins.name, q.title`;
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

    public static getCountGroupedBySession(filter: string, session?: number): Promise<Exam[]> {
        const sessionWhere = session ? ` s.id = ${session} AND ` : '';
        const sql = `SELECT count(e.*) as count
                                                FROM "exam" AS e 
                                                INNER JOIN "session" AS s ON e.session_id = s.id
                                             INNER JOIN "training" AS t ON s.training_id = t.id
                                             INNER JOIN "intern" AS i ON e.intern_id = i.id
                                             INNER JOIN "instructor" AS ins ON s.instructor_id = ins.id
                                             LEFT JOIN "questionnaire" AS q ON q.id = e.questionnaire_id
                                             WHERE ${sessionWhere}
                                             (t.name ILIKE '%${filter}%' OR s.name ILIKE '%${filter}%' 
                                             OR q.title ILIKE '%${filter}%' OR ins.name ILIKE '%${filter}%') 
                                             OR q.title ILIKE '%${filter}%' 
                           group by e.date, s.name, t.name, ins.name, q.title`;
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


    public static get(id: number): Promise<Exam> {
        const sql = `SELECT e.*, q.title as questionnaire, i.name as intern, t.name as training
                        FROM "exam" e
                        INNER JOIN "intern" AS i ON i.id = e.intern_id 
                        LEFT JOIN "questionnaire" AS q ON q.id = e.questionnaire_id
                        LEFT JOIN "training" AS t ON t.id = q.training
                        WHERE e.id = ${id}`;
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
        const sql = Settings.isDbLocalFile ? `SELECT e.id, e.mark, e.result, e.retake, e.date, e.time, e.comment, s.training_id, e.intern_id, e.session_id,q.title as questionnaire, i.name as intern, s.name as session, t.name as training
                                            FROM "exam" AS e 
                                             INNER JOIN "training" AS t ON s.training_id = t.id
                                             INNER JOIN "intern" AS i ON e.intern_id = i.id
                                             INNER JOIN "session" AS s ON e.session_id = s.id
                                             LEFT JOIN "questionnaire" AS q ON q.id = e.questionnaire_id
                                                    WHERE e.date LIKE '%${filter}%' OR 
                            e.mark LIKE '%${filter}%'  OR 
                            e.result LIKE '%${filter}%' OR t.name LIKE '%${filter}%' OR i.name LIKE '%${filter}%' OR s.name LIKE '%${filter}%'
                            ORDER BY ${sort} ${order} LIMIT ${pageSize} OFFSET ${pageIndex}` :
            `SELECT e.id, e.mark, e.result,e.passed, e.retake, e.date, e.time, e.comment, s.training_id, e.intern_id, e.session_id,q.title as questionnaire, i.name as intern, s.name as session, t.name as training
                                            FROM "exam" AS e 
                                             INNER JOIN "session" AS s ON e.session_id = s.id
                                             INNER JOIN "training" AS t ON s.training_id = t.id
                                             INNER JOIN "intern" AS i ON e.intern_id = i.id
                                             LEFT JOIN "questionnaire" AS q ON q.id = e.questionnaire_id
                                                    WHERE e.date ILIKE '%${filter}%' OR 
                                                    CAST(e.mark AS TEXT) LIKE '%${filter}%'  OR 
                             t.name ILIKE '%${filter}%' OR i.name ILIKE '%${filter}%' OR s.name ILIKE '%${filter}%' 
                             OR q.title ILIKE '%${filter}%'
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

    public static getAllPagedByIntern(pageIndex: number, pageSize: number, sort: string, order: string, filter: string, intern: number): Promise<Exam[]> {
        const sql = `SELECT e.id, e.mark, e.result,e.passed, e.retake, e.date, e.time, e.comment,q.title as questionnaire, q.id as questionnaire_id, s.training_id, e.intern_id, e.session_id, i.name as intern, s.name as session, t.name as training
                                                FROM "exam" AS e 
                                                INNER JOIN "session" AS s ON e.session_id = s.id
                                             INNER JOIN "training" AS t ON s.training_id = t.id
                                             INNER JOIN "intern" AS i ON e.intern_id = i.id
                                             LEFT JOIN "questionnaire" AS q ON q.id = e.questionnaire_id
                                             WHERE i.id = ${intern}  AND 
                                             (t.name ILIKE '%${filter}%' OR s.name ILIKE '%${filter}%' OR q.title ILIKE '%${filter}%') 
                           
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

    public static getAllPagedBySession(pageIndex: number, pageSize: number, sort: string, order: string,filter: string, session: number): Promise<Exam[]> {
        const sql = `SELECT e.id, e.mark, e.result,e.passed, e.retake, e.date, e.time, e.comment,q.title as questionnaire, 
        s.training_id, e.intern_id, e.session_id, i.name as intern, s.name as session, t.name as training, s.id as session_id
                                                FROM "exam" AS e 
                                                INNER JOIN "session" AS s ON e.session_id = s.id
                                             INNER JOIN "training" AS t ON s.training_id = t.id
                                             INNER JOIN "intern" AS i ON e.intern_id = i.id
                                             LEFT JOIN "questionnaire" AS q ON q.id = e.questionnaire_id
                                             WHERE s.id = ${session}  AND
                                             (t.name ILIKE '%${filter}%' OR i.name ILIKE '%${filter}%' 
                                             OR s.name ILIKE '%${filter}%' OR q.title ILIKE '%${filter}%')
                           
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

    public static getAllPagedBySessionAndByDate(pageIndex: number, pageSize: number, sort: string, order: string,filter: string, session: number, date: number): Promise<Exam[]> {
        const sql = `SELECT e.id, e.mark, e.result,e.passed, e.retake, e.date, e.time, e.comment,q.title as questionnaire, 
        s.training_id, e.intern_id, e.session_id, i.name as intern, s.name as session, t.name as training, s.id as session_id
                                                FROM "exam" AS e 
                                                INNER JOIN "session" AS s ON e.session_id = s.id
                                             INNER JOIN "training" AS t ON s.training_id = t.id
                                             INNER JOIN "intern" AS i ON e.intern_id = i.id
                                             LEFT JOIN "questionnaire" AS q ON q.id = e.questionnaire_id
                                             WHERE s.id = ${session}  AND e.date::bigint = ${date}::bigint AND
                                             (t.name ILIKE '%${filter}%' OR i.name ILIKE '%${filter}%' 
                                             OR s.name ILIKE '%${filter}%' OR q.title ILIKE '%${filter}%')
                           
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

    public static getAllPagedByInstructor(pageIndex: number, pageSize: number, sort: string, order: string, filter: string, instructor: number): Promise<Exam[]> {
        const sql = `SELECT e.id, e.mark, e.result,e.passed, e.retake, e.date, e.time,q.title as questionnaire, e.comment, s.training_id, e.intern_id, e.session_id, i.name as intern, s.name as session, t.name as training
                                                FROM "exam" AS e 
                                                INNER JOIN "session" AS s ON e.session_id = s.id
                                             INNER JOIN "training" AS t ON s.training_id = t.id
                                             INNER JOIN "intern" AS i ON e.intern_id = i.id
                                             LEFT JOIN "questionnaire" AS q ON q.id = e.questionnaire_id
                                             WHERE s.instructor_id = ${instructor} AND
                                             (t.name ILIKE '%${filter}%' OR i.name ILIKE '%${filter}%' 
                                             OR s.name ILIKE '%${filter}%' OR q.title ILIKE '%${filter}%')  
                           
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

    public static getAllPagedGroupedBySession(pageIndex: number, pageSize: number, sort: string, order: string, filter: string, session?: number): Promise<Exam[]> {
        const sessionWhere = session ? ` s.id = ${session} AND ` : '';
        const sql = `SELECT e.date, s.name as session, t.name as training, ins.name as instructor, 
        count(i.id) as interns, q.title as questionnaire, s.id as session_id
                                                FROM "exam" AS e 
                                                INNER JOIN "session" AS s ON e.session_id = s.id
                                             INNER JOIN "training" AS t ON s.training_id = t.id
                                             INNER JOIN "intern" AS i ON e.intern_id = i.id
                                             INNER JOIN "instructor" AS ins ON s.instructor_id = ins.id
                                             LEFT JOIN "questionnaire" AS q ON q.id = e.questionnaire_id
                                             WHERE ${sessionWhere}
                                             (t.name ILIKE '%${filter}%' OR s.name ILIKE '%${filter}%' 
                                             OR q.title ILIKE '%${filter}%' OR ins.name ILIKE '%${filter}%') 
                           group by e.date, s.name, t.name, ins.name, q.title, s.id
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


    public static getAllPagedByInstructorGroupedBySession(pageIndex: number, pageSize: number, sort: string, order: string, filter: string, instructor: number): Promise<Exam[]> {
        const sql = `SELECT e.date, s.name as session, t.name as training, ins.name as instructor, count(i.id) as interns, 
        q.title as questionnaire, s.id as session_id
                                                FROM "exam" AS e 
                                                INNER JOIN "session" AS s ON e.session_id = s.id
                                             INNER JOIN "training" AS t ON s.training_id = t.id
                                             INNER JOIN "intern" AS i ON e.intern_id = i.id
                                             INNER JOIN "instructor" AS ins ON s.instructor_id = ins.id
                                             LEFT JOIN "questionnaire" AS q ON q.id = e.questionnaire_id
                                             WHERE s.instructor_id = ${instructor} AND
                                             (t.name ILIKE '%${filter}%' OR s.name ILIKE '%${filter}%' 
                                             OR q.title ILIKE '%${filter}%' OR ins.name ILIKE '%${filter}%')  
                           group by e.date, s.name, t.name, ins.name, q.title, s.id
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

    public insert(cloud?: boolean): Promise<void> {
        const sql = `
            INSERT INTO "exam" (mark, result,passed, date, retake, comment, time, intern_id, session_id, questionnaire_id)
            VALUES(${this.mark}, ${this.result}, ${this.passed}, '${this.date}', ${this.retake}, 
            '${this.comment ? this.comment.replace(/\'/g, "''") : ''}',
             '${this.time}', ${this.intern_id}, ${this.session_id}, ${this.questionnaire_id})`;

        const values = {
        };

        return TheDb.insert(sql, values, cloud)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Exam to be inserted. Was ${result.changes}`);
                } else {
                    this.id = result.lastID;
                }
            });
    }

    public insertWithId(cloud?: boolean): Promise<void> {
        const sql = `
            INSERT INTO "exam" (id, mark, result,passed, date, retake, comment, time, intern_id, session_id, questionnaire_id)
            VALUES(${this.id},${this.mark}, ${this.result}, ${this.passed}, '${this.date}', ${this.retake}, 
            '${this.comment ? this.comment.replace(/\'/g, "''") : ''}',
             '${this.time}', ${this.intern_id}, ${this.session_id}, ${this.questionnaire_id})`;

        const values = {
        };

        return TheDb.insert(sql, values, cloud)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Exam to be inserted. Was ${result.changes}`);
                } else {
                    this.id = result.lastID;
                }
            });
    }

    public update(cloud?: boolean): Promise<void> {
        const sql = `
            UPDATE "exam"
               SET mark = ${this.mark}, passed = ${this.passed},
                date = '${this.date}', retake= ${this.retake}, comment = '${this.comment ? this.comment.replace(/\'/g, "''") : ''}',
                result = ${this.result}, time = '${this.time}', intern_id = '${this.intern_id}',
                session_id = '${this.session_id}', questionnaire_id = ${this.questionnaire_id}
             WHERE id = ${this.id}`;

        const values = {
        };

        return TheDb.update(sql, values, cloud)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Exam to be updated. Was ${result.changes}`);
                }
            });
    }

    public static passTest(id: number): Promise<void> {
        const sql = `
            UPDATE "exam"   SET passed = 1  WHERE id = ${id}`;

        const values = {
        };

        return TheDb.update(sql, values)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Exam to be updated. Was ${result.changes}`);
                }
            });
    }


    public static delete(id: number, cloud?: boolean): Promise<void> {
        const sql = `
            DELETE FROM "exam" WHERE id = ${id}`;

        const values = {
        };

        return TheDb.delete(sql, values, cloud)
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
        this.passed = row['passed'];
        this['training_id'] = row['training_id'];
        this['intern'] = row['intern'];
        this['interns'] = row['interns'];
        this['instructor'] = row['instructor'];
        this['session'] = row['session'];
        this['training'] = row['training'];
        this['questionnaire_id'] = row['questionnaire_id']
        this['questionnaire'] = row['questionnaire']
        return this;
    }

}
