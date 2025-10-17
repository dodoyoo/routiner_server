// import { MigrationInterface, QueryRunner, TableForeignKey } from 'typeorm';

// export class ModifyRoutinesAddCategory1760600017631
//   implements MigrationInterface
// {
//   public async up(queryRunner: QueryRunner): Promise<void> {
//     const table = await queryRunner.getTable('routines');
//     const hasCategoryId = table?.columns.find(
//       (col) => col.name === 'category_id'
//     );

//     if (!hasCategoryId) {
//       await queryRunner.query(
//         `ALTER TABLE routines ADD COLUMN category_id int NOT NULL`
//       );
//     }

//     await queryRunner.createForeignKey(
//       'routines',
//       new TableForeignKey({
//         columnNames: ['category_id'],
//         referencedTableName: 'categories',
//         referencedColumnNames: ['id'],
//         onDelete: 'NO ACTION',
//         onUpdate: 'CASCADE',
//       })
//     );
//   }

//   public async down(queryRunner: QueryRunner): Promise<void> {
//     const table = await queryRunner.getTable('routines');
//     const fk = table!.foreignKeys.find((fk) =>
//       fk.columnNames.includes('category_id')
//     );
//     if (fk) {
//       await queryRunner.dropForeignKey('routines', fk);
//     }
//     await queryRunner.query(`ALTER TABLE routines DROP COLUMN category_id`);
//     await queryRunner.query(
//       `ALTER TABLE routines ADD COLUMN category varchar(100) NOT NULL`
//     );
//   }
// }
