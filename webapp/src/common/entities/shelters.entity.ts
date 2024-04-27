import { Column, Entity } from "typeorm";
import { BaseModel } from "./base-model.entity";

  @Entity({ name: "shelters" })
  export class Shelters extends BaseModel{
    // 대피소 등록일 필요할 것 같아서 BaseModel 상속 시킴

    // 나중에 실제 api 데이터상의 shelterId를 넣고 로직 완성 시킬 예정
    // 줄었다, 늘었다 pk id값을 보완하기 위해 사용중. 사실상 유니크 값인 id컬럼
    @Column({ type : 'int', nullable : false })
    shelter_id : number

    @Column({ type: 'varchar', nullable: false })
    address: string;

    @Column({ type: 'varchar', nullable: false })
    facility_name: string;

    // 평수면 string, 수용 가능인원이면 number 타입이 좋을듯.
    @Column({ type: 'varchar', nullable: false })
    facility_area: string;

    @Column({ type: 'decimal', nullable: false })
    longitude: number;

    @Column({ type: 'decimal', nullable: false })
    latitude: number;

    @Column({ type: 'varchar', nullable: false })
    department_number: string;

  }