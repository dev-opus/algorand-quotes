import { db } from '.';

export async function insertRow(sql: string, params: string[]) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, (err: any) => {
      if (err) {
        reject(err);
      }
      resolve('row inserted');
    });
  });
}

export async function selectRow(sql: string, params: string[]) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, function (err: any, row: any) {
      if (err) {
        reject(err);
      }

      resolve(row);
    });
  });
}

export async function selectRows(sql: string, params: string[]) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, function (err: any, rows: any) {
      if (err) {
        reject(err);
      }

      resolve(rows);
    });
  });
}

export async function updateRow(sql: string, params: string[]) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, (err: any) => {
      if (err) {
        reject(err);
      }
      resolve('row inserted');
    });
  });
}
