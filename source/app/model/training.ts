import { TheDb } from './thedb';

/**
 * class for selecting, inserting, updating and deleting Trainings in training table.
 *
 * @export
 * @class Training
 */
export class Training {
    public id = -1;
    public name = '';
    public time = '';
    public type = '';
    public payment_type = 'total';
    public seance_fees = 0;
    public instructor_fees = 0;
    public seance_number = 0;
    public training_fees = 0;
    public books_fees = 0;
    public enrollment_fees = 0;

    public static getCount(filter: string): Promise<Training[]> {
        return TheDb.selectAll(`SELECT count(*) as count FROM "training" WHERE name ILIKE '%${filter}%' OR 
                                        time ILIKE '%${filter}%' OR type ILIKE '%${filter}%'`, {})
            .then((count: any) => count);
    }

    public static get(id: number): Promise<Training> {
        const sql = `SELECT * FROM "training" WHERE id = ${id}`;
        const values = {};

        return TheDb.selectOne(sql, values)
            .then((row) => {
                if (row) {
                    return new Training().fromRow(row);
                } else {
                    throw new Error('Expected to find 1 Training. Found 0.');
                }
            });
    }

    public static getAll(): Promise<Training[]> {
        const sql = `SELECT * FROM "training" ORDER BY name`;
        const values = {};

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const users: Training[] = [];
                for (const row of rows) {
                    const training = new Training().fromRow(row);
                    users.push(training);
                }
                return users;
            });
    }

    public static getAllPaged(pageIndex: number, pageSize: number, sort: string, order: string, filter: string): Promise<Training[]> {
        const sql = `SELECT * FROM "training" WHERE name ILIKE '%${filter}%' OR 
                            time ILIKE '%${filter}%' OR
                            type ILIKE '%${filter}%' 
                            ORDER BY ${sort} ${order} LIMIT ${pageSize} OFFSET ${pageIndex}`;
        const values = {
        };

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const users: Training[] = [];
                for (const row of rows) {
                    const training = new Training().fromRow(row);
                    users.push(training);
                }
                return users;
            });
    }

    public insert(cloud?: boolean): Promise<void> {
        const sql = `
            INSERT INTO "training" (name, time, type, training_fees,seance_number, seance_fees, instructor_fees, payment_type, books_fees, enrollment_fees)
            VALUES('${this.name}', '${this.time}', '${this.type}', ${this.training_fees},${this.seance_number},${this.seance_fees}, ${this.instructor_fees}, '${this.payment_type}', ${this.books_fees}, ${this.enrollment_fees})`;

        const values = {
        };

        return TheDb.insert(sql, values, cloud)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Training to be inserted. Was ${result.changes}`);
                } else {
                    this.id = result.lastID;
                }
            });
    }

    public insertWithId(cloud?: boolean): Promise<void> {
        const sql = `
            INSERT INTO "training" (id,name, time, type, training_fees, seance_number,seance_fees,instructor_fees, payment_type, books_fees, enrollment_fees)
            VALUES(${this.id},'${this.name}', '${this.time}', '${this.type}', ${this.training_fees},${this.seance_number},${this.seance_fees}, ${this.instructor_fees}, 
            '${this.payment_type}', ${this.books_fees}, ${this.enrollment_fees})`;

        const values = {
        };

        return TheDb.insert(sql, values, cloud)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Training to be inserted. Was ${result.changes}`);
                } else {
                    this.id = result.lastID;
                }
            });
    }

    public update(cloud?: boolean): Promise<void> {
        const sql = `
            UPDATE "training"
               SET name = '${this.name}', time = '${this.time}', type = '${this.type}', 
               training_fees = ${this.training_fees}, payment_type = '${this.payment_type}', 
               seance_fees = ${this.seance_fees}, instructor_fees = ${this.instructor_fees}, books_fees = ${this.books_fees}, 
               enrollment_fees = ${this.enrollment_fees},seance_number = ${this.seance_number}
             WHERE id = ${this.id}`;

        const values = {
        };

        return TheDb.update(sql, values, cloud)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Training to be updated. Was ${result.changes}`);
                }
            });
    }

    public static nameExist(name: string) {
        const sql = `SELECT * FROM "training" WHERE name = '${name}'`;
        const values = {};

        return TheDb.selectOne(sql, values)
            .then((row) => {
                if (row) {
                    throw new Error('duplicated name');
                } else {
                    return null;
                }
            });
    }

    public static delete(id: number, cloud?: boolean): Promise<void> {
        const sql = `
            DELETE FROM "training" WHERE id = ${id}`;

        const values = {
        };

        return TheDb.delete(sql, values, cloud)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Training to be deleted. Was ${result.changes}`);
                }
            });
    }

    public fromRow(row: object): Training {
        this.id = row['id'];
        this.name = row['name'];
        this.time = row['time'];
        this.type = row['type'];
        this.training_fees = row['training_fees'];
        this.seance_number = row['seance_number'];
        this.seance_fees = row['seance_fees'];
        this.instructor_fees = row['instructor_fees'];
        this.payment_type = row['payment_type'];
        this.books_fees = row['books_fees'];
        this.enrollment_fees = row['enrollment_fees'];
        return this;
    }
}
