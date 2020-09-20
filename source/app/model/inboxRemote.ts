import {User} from "./user";
import {Settings} from "./settings";

/**
 * class for selecting, inserting, updating and deleting payments in inboxRemote table.
 *
 * @export
 * @class InboxRemote
 */
export class InboxRemote {
    public id = -1;
    public date: Date| number;
    public subject: string;
    public from: number | User;
    public to: number | User;
    public content = '';
    public deleted = 0;
    public read = 0;

    public static getAll(): Promise<InboxRemote[]> {
        const sql = `SELECT * FROM "inbox_remote" ORDER BY date DESC`;

        return new Promise<any>((resolve, reject) => {
            Settings.cloudClient.query(sql, (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    const messages: InboxRemote[] = [];
                    for (const r of row.rows) {
                        const m = new InboxRemote().fromRow(r);
                        messages.push(m);
                    }
                    resolve(messages);
                }
            });
        });
    }

    public fromRow(row: object): InboxRemote {
        this.id = row['id'];
        this.subject = row['subject'];
        this.date = row['date'];
        this.content = row['content'];
        this.to = row['to'];
        this.from = row['from'];
        this.deleted = row['deleted'];
        this.read = row['read'];
        return this;
    }

}
